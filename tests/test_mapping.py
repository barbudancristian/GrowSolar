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
    assert mp["settings"] == [{}]
    assert m.missing(mp) == []


def test_manual_overrides():
    mp = m.build_map("donglegrowatt", ALL, 1, {"soc": "sensor.bms_soc", "energy_bat_in": "sensor.bms_in"})
    assert mp["system"]["soc"] == "sensor.bms_soc"
    assert mp["energy"]["bat_in"] == ["sensor.bms_in"]


def test_manual_sign_options():
    mp = m.build_map("manual", {}, 1, {"bat_w": "sensor.b", "invert_bat": True, "invert_grid": False})
    assert mp["system"] == {"bat_w": "sensor.b"}
    assert mp["options"] == {"invert_bat": True, "invert_grid": False}


def test_manual_only():
    mp = m.build_map("manual", {}, 1, {"pv": "sensor.pv", "load": "sensor.load", "soc": "sensor.soc", "energy_pv": "sensor.e"})
    assert mp["inverters"] == [{}]
    assert m.missing(mp) == []


CTRL = {}
for i in (1, 2, 3):
    CTRL[f"inverter_{i}_output_source_priority"] = f"select.sa_inv{i}_osp"
    CTRL[f"inverter_{i}_max_charge_current"] = f"number.sa_inv{i}_mcc"
    CTRL[f"growatt_{i}_back_to_battery_capacity"] = f"number.growatt_{i}_btb"
    CTRL[f"growatt_{i}_sync_clock"] = f"button.growatt_{i}_sync_clock"
CTRL["inverter_1_serial_number"] = "sensor.not_a_control"


def test_settings_sa():
    mp = m.build_map("solar_assistant", ALL, 3, None, CTRL)
    assert mp["settings"][2] == {"output_source_priority": "select.sa_inv3_osp", "max_charge_current": "number.sa_inv3_mcc"}
    assert "battery_type" in mp["settings_locked"]


def test_settings_dongle_and_bms():
    uids = {**DG, "growatt_2_output_power": "sensor.g2", "growatt_2_bms_soc": "sensor.g2_bms_soc", "growatt_2_bms_cell_delta": "sensor.g2_delta"}
    mp = m.build_map("donglegrowatt", uids, 2, None, CTRL)
    assert mp["settings"][0] == {"back_to_battery_capacity": "number.growatt_1_btb", "sync_clock": "button.growatt_1_sync_clock"}
    assert mp["system"] == {"soc": "sensor.g2_bms_soc", "cell_imb": "sensor.g2_delta"}
    assert mp["inverters"][0]["serial"] == "sensor.growatt_1_serial_number"



def test_order_and_names():
    mp = m.apply_order(m.build_map("solar_assistant", ALL, 3, None, CTRL), "1,3,2", "L1, L2 ,L3")
    assert mp["inverters"][1]["pv2_v"] == "sensor.sa_inv3_pv_voltage_2"
    assert mp["inverters"][2]["pv2_v"] == "sensor.sa_inv2_pv_voltage_2"
    assert mp["settings"][1]["output_source_priority"] == "select.sa_inv3_osp"
    assert mp["names"] == ["L1", "L2", "L3"]
    assert m.parse_order("1,1,2", 3) == [1, 2, 3]
    assert m.parse_order("x", 3) == [1, 2, 3]
    assert m.parse_order("", 3) == [1, 2, 3]
    assert m.parse_names("", 2) == ["#1", "#2"]



def test_sa_with_dongle_bms():
    # Solar Assistant publishes no battery temperature for this BMS
    sa = {k: v for k, v in ALL.items() if k != "battery_1_temperature"}
    uids = {**sa, "growatt_1_bms_soc": "sensor.g1_bms_soc", "growatt_1_bms_temperature": "sensor.g1_bms_t", "growatt_1_bms_max_charge_current": "sensor.g1_bms_a"}
    mp = m.build_map("solar_assistant", uids, 3)
    assert mp["system"]["bat_temp"] == "sensor.g1_bms_t"
    assert mp["system"]["bms_chg_a"] == "sensor.g1_bms_a"
    assert mp["system"]["soc"] == "sensor.sa_battery_1_state_of_charge"   # Solar Assistant's own value wins



def test_dongle_keeps_sa_energy_history():
    mp = m.build_map("donglegrowatt", ALL, 1)
    assert mp["energy_history"]["pv"] == ["sensor.sa_total_pv_energy"]
    assert mp["energy_history"]["bat_in"] == ["sensor.sa_total_battery_energy_in"]
    assert m.build_map("solar_assistant", ALL, 3)["energy_history"] == {}


if __name__ == "__main__":
    for k, f in list(globals().items()):
        if k.startswith("test_"):
            f(); print("ok  ", k)
