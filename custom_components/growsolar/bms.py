"""Reads a PACE BMS over an RS485-to-Ethernet converter (TCP server, transparent mode)."""
from __future__ import annotations

import asyncio
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
        _, radr, rtn, info = pace.parse_frame(raw)
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
            try:
                analog = pace.parse_analog(await self._ask(self.ver, self.adr, pace.CID2_ANALOG))
            except (OSError, asyncio.TimeoutError, asyncio.IncompleteReadError, pace.FrameError, ValueError) as e:
                raise UpdateFailed(f"PACE BMS: {e or type(e).__name__}; last data: {self.last_raw[:80]}") from e
            alarm = None
            try:
                alarm = pace.parse_alarm(await self._ask(self.ver, self.adr, pace.CID2_ALARM), analog.offset)
            except (OSError, asyncio.TimeoutError, asyncio.IncompleteReadError, pace.FrameError, ValueError) as e:
                _LOGGER.debug("PACE BMS alarm frame: %s (%s)", e, self.last_raw[:120])
            return {"analog": analog, "alarm": alarm}
