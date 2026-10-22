"""Tests for the entity mapping (no Home Assistant needed): python3 -m pytest tests  or  python3 tests/test_mapping.py"""
import importlib.util, sys, types, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "growsolar"
pkg = types.ModuleType("gs"); pkg.__path__ = [str(ROOT)]; sys.modules["gs"] = pkg
for name in ("const", "mapping"):
    spec = importlib.util.spec_from_file_location(f"gs.{name}", ROOT / f"{name}.py")
    mod = importlib.util.module_from_spec(spec); sys.modules[f"gs.{name}"] = mod; spec.loader.exec_module(mod)
m = sys.modules["gs.mapping"]

# unique ids as seen on a real system: Solar Assistant with 3 inverters + one DongleGrowatt
SA = {}
for i in (1, 2, 3):
    for s in m.SA_INVERTER.values():
        SA[f"inverter_{i}_{s}"] = f"sensor.sa_inv{i}_{s}"
for u in m.SA_SYSTEM.values():
    SA[u] = f"sensor.sa_{u}"
for l in m.SA_ENERGY.values():
    for u in l:
        SA[u] = f"sensor.sa_{u}"
DG = {f"growatt_1_{s}": f"sensor.growatt_1_{s}" for s in list(m.DONGLE_INVERTER.values()) + [x for l in m.DONGLE_ENERGY.values() for x in l]}
ALL = {**SA, **DG}


def test_detect():
    assert m.detect_inverters("solar_assistant", ALL) == 3
    assert m.detect_inverters("donglegrowatt", ALL) == 1
    assert m.detect_inverters("donglegrowatt", SA) == 0


def test_sa_map():
    mp = m.build_map("solar_assistant", ALL, 3)
    assert len(mp["inverters"]) == 3
    assert mp["inverters"][2]["pv2_v"] == "sensor.sa_inv3_pv_voltage_2"
    assert mp["system"]["soc"] == "sensor.sa_battery_1_state_of_charge"
    assert mp["system"]["cell_imb"] == "sensor.sa_battery_1_cell_voltage_-_imbalance"
    assert mp["energy"]["grid_in"] == ["sensor.sa_total_grid_energy_in"]
    assert mp["energy_daily_reset"] is True
    assert m.missing(mp) == []


def test_dongle_map():
    mp = m.build_map("donglegrowatt", ALL, 1)
    inv = mp["inverters"][0]
    assert inv["load"] == "sensor.growatt_1_output_power"
    assert inv["bat_w"] == "sensor.growatt_1_battery_power"
    assert mp["energy"]["grid_in"] == ["sensor.growatt_1_ac_discharge_energy_total", "sensor.growatt_1_ac_charge_energy_total"]
    assert mp["system"] == {}
    assert m.missing(mp) == []


def test_manual_overrides():
    mp = m.build_map("donglegrowatt", ALL, 1, {"soc": "sensor.bms_soc", "energy_bat_in": "sensor.bms_in"})
    assert mp["system"]["soc"] == "sensor.bms_soc"
    assert mp["energy"]["bat_in"] == ["sensor.bms_in"]


def test_manual_only():
    mp = m.build_map("manual", {}, 1, {"pv": "sensor.pv", "load": "sensor.load", "soc": "sensor.soc", "energy_pv": "sensor.e"})
    assert mp["inverters"] == [{}]
    assert m.missing(mp) == []


if __name__ == "__main__":
    for k, f in list(globals().items()):
        if k.startswith("test_"):
            f(); print("ok  ", k)
