"""Tests for the PACE BMS protocol (no Home Assistant needed): python3 tests/test_pace.py"""
import importlib.util, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "growsolar"
spec = importlib.util.spec_from_file_location("pace", ROOT / "pace.py")
p = importlib.util.module_from_spec(spec); sys.modules["pace"] = p; spec.loader.exec_module(p)

CELLS = [3297, 3301, 3296, 3299, 3302, 3298, 3284, 3300, 3297, 3303, 3299, 3298, 3301, 3296, 3300, 3299]
TEMPS = [214, 211, 216, 212, 248, 197]          # 0.1 °C


def analog_info(flag="00", pack="01", cur=-2840, rem=9120, full=30400, cycles=192, design=30400):
    i = flag + pack + f"{len(CELLS):02X}" + "".join(f"{c:04X}" for c in CELLS)
    i += f"{len(TEMPS):02X}" + "".join(f"{t + 2731:04X}" for t in TEMPS)
    i += f"{cur & 0xFFFF:04X}{sum(CELLS):04X}{rem:04X}02{full:04X}{cycles:04X}{design:04X}"
    return i


def alarm_info(flag="00", pack="01", ins=0x06, b1=0x00, b2=0x02, p1=0, p2=0, w2=0):
    i = flag + pack + f"{len(CELLS):02X}" + "00" * len(CELLS) + f"{len(TEMPS):02X}" + "00" * len(TEMPS)
    i += "000000" + "".join(f"{x:02X}" for x in (p1, p2, ins, 0, 0, b1, b2, 0, w2))
    return i


def answer(info, ver=0x25, adr=1, rtn=0):
    return p.build(ver, adr, rtn, info)


def test_request():
    r = p.request(0x25, 1, p.CID2_ANALOG)
    assert r == b"~25014642E00201FD30\r", r
    assert p.length_field(0) == "0000" and p.length_field(2) == "E002" and p.length_field(18) == "D012"


def test_frame():
    ver, adr, rtn, info = p.parse_frame(answer(analog_info()))
    assert (ver, adr, rtn) == (0x25, 1, 0) and info == analog_info()
    bad = bytearray(answer(analog_info())); bad[20] = ord("F") if bad[20] != ord("F") else ord("E")
    try:
        p.parse_frame(bytes(bad)); assert False
    except p.FrameError:
        pass


def test_analog():
    for info in (analog_info(), analog_info(pack="")):     # with and without the pack number
        a = p.parse_analog(info)
        assert len(a.cells) == 16 and a.cells[6] == 3.284
        assert a.temps == [21.4, 21.1, 21.6, 21.2, 24.8, 19.7]
        assert a.current == -28.4 and abs(a.voltage - sum(CELLS) / 1000) < 1e-9
        assert a.remaining_ah == 91.2 and a.full_ah == 304.0 and a.cycles == 192
        assert a.soc == 30.0 and a.soh == 100.0
    assert p.parse_analog(analog_info()).offset == 4 and p.parse_analog(analog_info(pack="")).offset == 2


def test_alarm():
    al = p.parse_alarm(alarm_info(), 4)
    assert al.charge_mos and al.discharge_mos and not al.current_limit
    assert al.balancing == [10] and al.protections == [] and al.warnings == []
    al = p.parse_alarm(alarm_info(pack="", ins=0x04, b1=0x41, b2=0, p1=0x01, w2=0x80), 2)
    assert al.charge_mos is False and al.balancing == [1, 7]
    assert al.protections == ["cell overvoltage"] and al.warnings == ["low capacity"]


def test_real_v20_alarm():
    # answer of the PACE BMS of a TowerX 16 kWh pack (RS485 next to CAN), charging at ~60 A
    raw = b"~2002460060460002100000000000000000000000000000000005000000000000060000000006800000F066\r"
    ver, adr, rtn, info = p.parse_frame(raw)
    assert (ver, adr, rtn) == (0x20, 2, 0)
    al = p.parse_alarm(info, 4, ver)
    assert al.charge_mos and al.discharge_mos and al.protections == [] and al.faults == [] and al.warnings == []
    assert al.charging and not al.discharging and not al.fully_charged and al.raw == "00 06 80 00 00"
    al = p.parse_alarm(info[:-16] + "000000" + "02" + "02" + "00" + "00" + "40", 4, 0x20)
    assert al.charge_mos and not al.discharge_mos and al.protections == ["cell undervoltage"] and al.faults == ["cell 15 fault"]


def test_current_scale():
    assert p.parse_analog(analog_info(cur=600), 0.1).current == 60.0
    assert p.parse_analog(analog_info(cur=600)).current == 6.0 and p.parse_analog(analog_info(cur=600)).current_raw == 600


def test_garbage():
    for info in ("", "00", "0001" + "FF" * 40):
        try:
            p.parse_analog(info); assert False
        except p.FrameError:
            pass


if __name__ == "__main__":
    for n, f in list(globals().items()):
        if n.startswith("test_"):
            f(); print("ok  ", n)
    print("ALL OK")
