"""Reads a PACE BMS over an RS485-to-Ethernet converter (TCP server, transparent mode)."""
from __future__ import annotations

import asyncio
import math
import time
from datetime import timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from . import pace

_LOGGER = logging.getLogger(__name__)

SCAN_ADDRESSES = list(range(0, 16))
TIMEOUT = 2.0


class PaceBmsCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Asks the BMS for its analog values and alarms every 10 seconds."""

    def __init__(self, hass: HomeAssistant, host: str, port: int) -> None:
        super().__init__(hass, _LOGGER, name="GrowSolar PACE BMS", update_interval=timedelta(seconds=10))
        self.host, self.port = host, port
        self.ver: int | None = None
        self.adr: int | None = None
        self.last_raw = ""
        self.rver: int | None = None          # protocol version the BMS answers with
        self.scale: float | None = None       # A per current count, calibrated from the capacity change
        self._cal: list[float] | None = None
        self._lock = asyncio.Lock()

    async def _ask(self, ver: int, adr: int, cid2: int, timeout: float = TIMEOUT) -> str:
        """One request on a fresh connection; returns INFO of a valid answer."""
        reader, writer = await asyncio.wait_for(asyncio.open_connection(self.host, self.port), timeout)
        try:
            writer.write(pace.request(ver, adr, cid2))
            await writer.drain()
            raw = await asyncio.wait_for(reader.readuntil(b"\r"), timeout)
        finally:
            writer.close()
            try:
                await writer.wait_closed()
            except OSError:
                pass
        self.last_raw = raw.decode("ascii", "replace").strip()
        rver, radr, rtn, info = pace.parse_frame(raw)
        self.rver = rver
        if rtn != 0:
            raise pace.FrameError(f"BMS answered with error code {rtn:#04x}")
        if radr != adr:
            raise pace.FrameError(f"answer from address {radr}, asked {adr}")
        return info

    async def _find(self) -> None:
        """First contact: which protocol version and pack address answer."""
        for ver in pace.VERSIONS:
            for adr in SCAN_ADDRESSES:
                try:
                    pace.parse_analog(await self._ask(ver, adr, pace.CID2_ANALOG, 1.0))
                except (OSError, asyncio.TimeoutError, asyncio.IncompleteReadError, pace.FrameError, ValueError) as e:
                    if isinstance(e, OSError) and not isinstance(e, TimeoutError):
                        raise UpdateFailed(f"cannot connect to {self.host}:{self.port}: {e}") from e
                    continue
                self.ver, self.adr = ver, adr
                _LOGGER.info("PACE BMS found at %s:%s, protocol %#04x, address %d", self.host, self.port, ver, adr)
                return
        raise UpdateFailed(
            f"no answer from a PACE BMS at {self.host}:{self.port} (check the RS485 port, swap A and B, 9600 8N1)"
            + (f"; last data: {self.last_raw[:80]}" if self.last_raw else "")
        )

    async def _async_update_data(self) -> dict[str, Any]:
        async with self._lock:
            if self.adr is None:
                await self._find()
            if self.scale is None:
                # 10 mA per count in protocol 0x25; the 0x20 PACE packs seen so far count 100 mA
                self.scale = 0.1 if self.rver == 0x20 else 0.01
            try:
                analog = pace.parse_analog(await self._ask(self.ver, self.adr, pace.CID2_ANALOG), self.scale)
            except (OSError, asyncio.TimeoutError, asyncio.IncompleteReadError, pace.FrameError, ValueError) as e:
                raise UpdateFailed(f"PACE BMS: {e or type(e).__name__}; last data: {self.last_raw[:80]}") from e
            alarm = None
            try:
                alarm = pace.parse_alarm(await self._ask(self.ver, self.adr, pace.CID2_ALARM), analog.offset, self.rver or 0x25)
            except (OSError, asyncio.TimeoutError, asyncio.IncompleteReadError, pace.FrameError, ValueError) as e:
                _LOGGER.debug("PACE BMS alarm frame: %s (%s)", e, self.last_raw[:120])
            self._calibrate(analog)
            return {"analog": analog, "alarm": alarm}

    def _calibrate(self, a: pace.Analog) -> None:
        """Checks the current unit (10 or 100 mA per count) against the change of the remaining
        capacity: after at least 1 Ah of change, the counted charge must match."""
        now = time.monotonic()
        if self._cal is None or a.current_raw == 0:
            self._cal = [now, a.remaining_ah, 0.0, now]
            return
        t0, rem0, integ, tprev = self._cal
        integ += a.current_raw * (now - tprev)
        self._cal = [t0, rem0, integ, now]
        d = a.remaining_ah - rem0
        if abs(d) < 1.0 or now - t0 > 3600:
            if now - t0 > 3600:
                self._cal = None
            return
        self._cal = None
        if integ == 0 or (d > 0) != (integ > 0):
            return
        est = d * 3600 / integ                     # Ah per count-second -> A per count
        best = min((0.01, 0.1), key=lambda s: abs(math.log(est / s)))
        if abs(math.log(est / best)) < math.log(2) and best != self.scale:
            _LOGGER.info("PACE BMS current unit set to %g A per count (measured %.4f)", best, est)
            self.scale = best
            a.current = round(a.current_raw * best, 2)
