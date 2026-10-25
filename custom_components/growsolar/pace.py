"""PACE BMS protocol (RS485, ASCII frames like Pylontech), without Home Assistant.

Frame: ~ VER ADR CID1 CID2 LENGTH INFO CHKSUM CR, every byte as two hex characters.
Requests used here: CID2 0x42 (analog values: cells, temperatures, current, capacity)
and 0x44 (warnings, protections, MOSFETs, balancing).
"""
from __future__ import annotations

from dataclasses import dataclass, field

CID1 = 0x46
CID2_ANALOG = 0x42
CID2_ALARM = 0x44
VERSIONS = (0x25, 0x20)

# temperature probes of a PACE pack, in the order the BMS sends them
TEMP_NAMES = ["cells_1", "cells_2", "cells_3", "cells_4", "mosfet", "ambient"]

PROTECT_1 = {0: "cell overvoltage", 1: "cell undervoltage", 2: "pack overvoltage", 3: "pack undervoltage",
             4: "charge overcurrent", 5: "discharge overcurrent", 6: "short circuit"}
PROTECT_2 = {0: "charge high temperature", 1: "charge low temperature", 2: "discharge high temperature",
             3: "discharge low temperature", 4: "ambient high temperature", 5: "ambient low temperature",
             6: "MOSFET high temperature"}
FAULT = {0: "charge MOSFET fault", 1: "discharge MOSFET fault", 2: "temperature sensor fault",
         4: "cell fault", 5: "sampling fault"}
WARN_1 = {0: "cell high voltage", 1: "cell low voltage", 2: "pack high voltage", 3: "pack low voltage",
          4: "charge current high", 5: "discharge current high"}
WARN_2 = {0: "charge temperature high", 1: "charge temperature low", 2: "discharge temperature high",
          3: "discharge temperature low", 4: "ambient temperature high", 5: "ambient temperature low",
          6: "MOSFET temperature high", 7: "low capacity"}


def length_field(n_chars: int) -> str:
    """LENGTH: 12-bit character count of INFO plus a 4-bit checksum of it."""
    s = (n_chars & 0xF) + ((n_chars >> 4) & 0xF) + ((n_chars >> 8) & 0xF)
    return f"{(((~s) + 1) & 0xF) << 12 | n_chars:04X}"


def checksum(body: str) -> str:
    """CHKSUM: two's complement of the sum of the ASCII codes (without ~ and CR)."""
    return f"{((~sum(body.encode('ascii'))) + 1) & 0xFFFF:04X}"


def build(ver: int, adr: int, cid2: int, info: str = "") -> bytes:
    body = f"{ver:02X}{adr:02X}{CID1:02X}{cid2:02X}{length_field(len(info))}{info}"
    return f"~{body}{checksum(body)}\r".encode("ascii")


def request(ver: int, adr: int, cid2: int) -> bytes:
    """Request for one pack: INFO is the pack address."""
    return build(ver, adr, cid2, f"{adr:02X}")


class FrameError(ValueError):
    """The answer is not a valid frame."""


def parse_frame(raw: bytes | str) -> tuple[int, int, int, str]:
    """Returns (version, address, return code, INFO)."""
    s = raw.decode("ascii", "replace") if isinstance(raw, (bytes, bytearray)) else raw
    s = s.strip()
    start = s.rfind("~")
    if start < 0:
        raise FrameError("no start character")
    s = s[start + 1:]
    if len(s) < 16:
        raise FrameError("frame too short")
    body, chk = s[:-4], s[-4:]
    if checksum(body) != chk.upper():
        raise FrameError("checksum error")
    ver, adr, rtn = int(body[0:2], 16), int(body[2:4], 16), int(body[6:8], 16)
    n = int(body[8:12], 16) & 0x0FFF
    info = body[12:12 + n]
    if len(info) != n:
        raise FrameError("length mismatch")
    return ver, adr, rtn, info


def _u(info: str, i: int, n: int = 4) -> int:
    if i + n > len(info):
        raise IndexError
    return int(info[i:i + n], 16)


def _s16(v: int) -> int:
    return v - 0x10000 if v & 0x8000 else v


@dataclass
class Analog:
    cells: list[float]                 # V
    temps: list[float]                 # °C
    current: float                     # A, + charging (raw count x current_scale)
    voltage: float                     # V
    remaining_ah: float
    full_ah: float
    design_ah: float | None
    cycles: int | None
    offset: int = 0                    # where the cell count was found (kept for the alarm frame)
    current_raw: int = 0               # signed count; 10 mA on most packs, 100 mA on some (see bms.py)

    @property
    def soc(self) -> float | None:
        return round(self.remaining_ah / self.full_ah * 100, 1) if self.full_ah else None

    @property
    def soh(self) -> float | None:
        return round(self.full_ah / self.design_ah * 100, 1) if self.design_ah else None


def _analog_at(info: str, i: int, scale: float) -> Analog:
    n = _u(info, i, 2)
    if not 4 <= n <= 32:
        raise ValueError
    i += 2
    cells = [_u(info, i + 4 * k) / 1000 for k in range(n)]
    if any(not 1.5 <= c <= 4.5 for c in cells):
        raise ValueError
    i += 4 * n
    nt = _u(info, i, 2)
    if not 1 <= nt <= 12:
        raise ValueError
    i += 2
    temps = [round((_u(info, i + 4 * k) - 2731) / 10, 1) for k in range(nt)]
    if any(not -40 <= t <= 120 for t in temps):
        raise ValueError
    i += 4 * nt
    craw = _s16(_u(info, i))
    current = round(craw * scale, 2)
    voltage = _u(info, i + 4) / 1000
    remaining = _u(info, i + 8) / 100
    i += 12
    if abs(voltage - sum(cells)) > max(1.0, 0.05 * voltage):
        raise ValueError
    user = _u(info, i, 2)
    i += 2
    full = _u(info, i) / 100
    cycles = design = None
    try:
        cycles = _u(info, i + 4)
        design = _u(info, i + 8) / 100
    except IndexError:
        pass
    if user == 4:      # 3-byte capacities at the end (packs above 655 Ah)
        try:
            remaining = _u(info, i + 12, 6) / 1000
            full = _u(info, i + 18, 6) / 1000
        except IndexError:
            pass
    return Analog(cells, temps, current, voltage, remaining, full, design or None, cycles, offset=0, current_raw=craw)


def parse_analog(info: str, current_scale: float = 0.01) -> Analog:
    """INFO of the 0x42 answer. The cell count sits after a data flag and, on most
    PACE firmwares, a pack number; both layouts are tried and checked against the pack voltage."""
    for off in (4, 2, 0, 6):
        try:
            a = _analog_at(info, off, current_scale)
        except (ValueError, IndexError):
            continue
        a.offset = off
        return a
    raise FrameError("unknown analog data layout")


@dataclass
class Alarm:
    cell_warn: list[int] = field(default_factory=list)
    charge_mos: bool | None = None
    discharge_mos: bool | None = None
    current_limit: bool | None = None
    balancing: list[int] = field(default_factory=list)   # cell numbers, 1-based
    protections: list[str] = field(default_factory=list)
    faults: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    fully_charged: bool = False
    charging: bool | None = None          # protocol 0x20 status 3
    discharging: bool | None = None
    heater: bool | None = None
    buzzer: bool | None = None
    raw: str = ""                         # the status bytes as sent, for comparing with other readers


def _bits(v: int, names: dict[int, str]) -> list[str]:
    return [n for b, n in names.items() if v >> b & 1]


# Pylontech-style status bytes (answers in protocol 0x20)
PY_S1 = {7: "pack undervoltage", 6: "charge temperature", 5: "discharge temperature", 4: "discharge overcurrent",
         2: "charge overcurrent", 1: "cell undervoltage", 0: "pack overvoltage"}
WARN_LEVEL = {1: "low", 2: "high"}


def parse_alarm_v20(info: str, offset: int = 4) -> Alarm:
    """0x44 answer in protocol 0x20 (Pylontech layout): cell and temperature warnings, then
    charge current, pack voltage and discharge current warnings and status bytes 1-5,
    which are the last 8 bytes of INFO (some PACE packs put 2 more bytes before them)."""
    i = offset
    n = _u(info, i, 2)
    if not 4 <= n <= 32:
        raise FrameError("unknown alarm data layout")
    cw = [_u(info, i + 2 + 2 * k, 2) for k in range(n)]
    i += 2 + 2 * n
    nt = _u(info, i, 2)
    tw = [_u(info, i + 2 + 2 * k, 2) for k in range(nt)]
    tail = info[-16:]
    if len(info) - (i + 2 + 2 * nt) < 16:
        raise FrameError("alarm frame too short")
    chg_w, volt_w, dsg_w, s1, s2, s3, s4, s5 = (int(tail[2 * k:2 * k + 2], 16) for k in range(8))
    warns = [f"cell {k + 1} voltage {WARN_LEVEL.get(v, hex(v))}" for k, v in enumerate(cw) if v]
    warns += [f"temperature {k + 1} {WARN_LEVEL.get(v, hex(v))}" for k, v in enumerate(tw) if v]
    warns += [f"{name} {WARN_LEVEL.get(v, hex(v))}" for name, v in
              (("charge current", chg_w), ("pack voltage", volt_w), ("discharge current", dsg_w)) if v]
    return Alarm(
        cell_warn=cw, charge_mos=bool(s2 >> 1 & 1), discharge_mos=bool(s2 >> 2 & 1), current_limit=None,
        balancing=[], protections=_bits(s1, PY_S1),
        faults=[f"cell {k + 1} fault" for k in range(8) if s4 >> k & 1] + [f"cell {k + 9} fault" for k in range(8) if s5 >> k & 1],
        warnings=warns, fully_charged=bool(s3 >> 3 & 1),
        charging=bool(s3 >> 7 & 1), discharging=bool(s3 >> 6 & 1), heater=bool(s3 >> 5 & 1), buzzer=bool(s3 & 1),
        raw=" ".join(f"{x:02X}" for x in (s1, s2, s3, s4, s5)),
    )


def parse_alarm(info: str, offset: int = 4, ver: int = 0x25) -> Alarm:
    """INFO of the 0x44 answer, with the cell count at the same offset as in the analog frame."""
    if ver == 0x20:
        return parse_alarm_v20(info, offset)
    last: Exception | None = None
    for off in dict.fromkeys((offset, 4, 2, 0)):
        try:
            i = off
            n = _u(info, i, 2)
            if not 4 <= n <= 32:
                raise ValueError
            i += 2
            cw = [_u(info, i + 2 * k, 2) for k in range(n)]
            i += 2 * n
            nt = _u(info, i, 2)
            if not 1 <= nt <= 12:
                raise ValueError
            i += 2 + 2 * nt
            i += 6                              # charge current, pack voltage, discharge current warnings
            p1, p2, ins, _ctl, flt, b1, b2, w1, w2 = (_u(info, i + 2 * k, 2) for k in range(9))
        except (ValueError, IndexError) as e:
            last = e
            continue
        bal = [k + 1 for k in range(8) if b1 >> k & 1] + [k + 9 for k in range(8) if b2 >> k & 1]
        return Alarm(
            cell_warn=cw,
            current_limit=bool(ins & 1), charge_mos=bool(ins >> 1 & 1), discharge_mos=bool(ins >> 2 & 1),
            balancing=[c for c in bal if c <= n],
            protections=_bits(p1, PROTECT_1) + _bits(p2, PROTECT_2),
            faults=_bits(flt, FAULT),
            warnings=_bits(w1, WARN_1) + _bits(w2, WARN_2),
            fully_charged=bool(p2 >> 7 & 1),
            raw=" ".join(f"{x:02X}" for x in (p1, p2, ins, _ctl, flt, b1, b2, w1, w2)),
        )
    raise FrameError(f"unknown alarm data layout ({last})")
