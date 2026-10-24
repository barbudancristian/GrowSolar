"""Find the entities GrowSolar shows, for each supported data source.

The panel works with neutral keys (``pv``, ``load``, ``bat_w`` ...). This module
translates them to entity ids by looking at the stable *unique ids* that each
source gives its MQTT entities, so it does not matter how the entities were
renamed in Home Assistant.

Conventions used by the panel:
* power in W, energy in kWh;
* battery power and current: positive while CHARGING, negative while discharging;
* grid power: positive while importing.

This module has no Home Assistant imports, so it can be tested on its own.
"""
from __future__ import annotations

from .const import MAX_INVERTERS, SOURCE_DONGLE, SOURCE_SA

# ---- DongleGrowatt (packages from the Growatt-SPF6K-HA project) ----
# unique_id = growatt_<n>_<suffix>
DONGLE_INVERTER = {
    "pv1": "pv1_power",
    "pv2": "pv2_power",
    "pv1_v": "pv1_voltage",
    "pv2_v": "pv2_voltage",
    "pv1_a": "pv1_current",
    "pv2_a": "pv2_current",
    "load": "output_power",
    "load_va": "output_apparent_power",
    "load_pct": "load_percentage",
    "out_v": "output_voltage",
    "out_hz": "output_frequency",
    "bat_v": "battery_voltage",
    "bat_w": "battery_power",          # + charging (the package already flips the sign)
    "soc": "battery_soc",
    "bat_ac_w": "ac_charge_power",
    "grid_w": "grid_power",
    "grid_v": "grid_voltage",
    "grid_hz": "grid_frequency",
    "temp": "inverter_temperature",
    "temp2": "dcdc_temperature",
    "bus_v": "bus_voltage",
    "mode": "status_text",
    "out_prio": "output_priority",
    "chg_prio": "charger_priority",
    "bat_a": "battery_current",        # + charging
    "serial": "serial_number",
    "fw": "firmware",
    "clock": "inverter_clock",
    "temp_mppt1": "mppt1_temperature",
    "temp_mppt2": "mppt2_temperature",
    "fan": "fan_inverter",
    "last_set": "last_setting_change",
}
# BMS sensors, published by the dongle of the inverter wired to the battery
DONGLE_BMS = {
    "soc": "bms_soc",
    "soh": "bms_soh",
    "bat_v": "bms_voltage",
    "bat_a": "bms_current",
    "bat_temp": "bms_temperature",
    "cycles": "bms_cycles",
    "cell_hi": "bms_cell_max",
    "cell_lo": "bms_cell_min",
    "cell_imb": "bms_cell_delta",
    "bms_chg_a": "bms_max_charge_current",
    "bms_chg_v": "bms_charge_voltage",
    "bms_status": "bms_status",
    "bms_error": "bms_error",
    "bms_warning": "bms_warning",
}

# ---- Inverter settings (select / number entities) ----
# Same names in Solar Assistant (inverter_<n>_<name>) and in the DongleGrowatt
# package (growatt_<n>_<name>). The panel shows every one it finds; values that
# can stop the output or the BMS link are shown but cannot be changed there.
SETTINGS = [
    "output_source_priority",
    "charger_source_priority",
    "energy_priority",
    "max_charge_current",
    "max_grid_charge_current",
    "max_generator_charge_current",
    "battery_absorption_charge_voltage",
    "battery_float_charge_voltage",
    "to_grid_battery_capacity",
    "back_to_battery_capacity",
    "shutdown_battery_capacity",
    "to_grid_battery_voltage",
    "back_to_battery_voltage",
    "shutdown_battery_voltage",
    "ac_input_range",
    "grid_output_start_hour",
    "grid_output_stop_hour",
    "grid_charge_start_hour",
    "grid_charge_stop_hour",
    "power_saving",
    "buzzer",
    "overload_restart",
    "overtemperature_restart",
    "battery_type",
    "remote_switch",
]
SETTINGS_LOCKED = ["battery_type", "remote_switch"]
DONGLE_ENERGY = {
    # cumulative counters, one per inverter; the panel takes the daily change
    "pv": ["pv_energy_total"],
    "load": ["op_discharge_energy_total"],
    "grid_in": ["ac_discharge_energy_total", "ac_charge_energy_total"],
    "bat_out": ["battery_discharge_energy_total"],
}

# ---- Solar Assistant (MQTT discovery) ----
# unique_id = inverter_<n>_<suffix> / total_<suffix> / battery_1_<suffix> / weather_<suffix>
SA_INVERTER = {
    "pv": "pv_power",
    "pv1": "pv_power_1",
    "pv2": "pv_power_2",
    "pv1_v": "pv_voltage_1",
    "pv2_v": "pv_voltage_2",
    "pv1_a": "pv_current_1",
    "pv2_a": "pv_current_2",
    "load": "load_power",
    "load_va": "load_apparent_power",
    "load_pct": "load_percentage",
    "out_v": "ac_output_voltage",
    "out_hz": "ac_output_frequency",
    "bat_v": "battery_voltage",
    "bat_a": "battery_current",        # + charging
    "bat_ac_w": "battery_power_from_ac",
    "grid_w": "grid_power",
    "grid_v": "grid_voltage",
    "grid_hz": "grid_frequency",
    "temp": "temperature",
    "bus_v": "bus_voltage",
    "mode": "device_mode",
    "serial": "serial_number",
}
SA_SYSTEM = {
    "pv": "total_pv_power",
    "load": "total_load_power",
    "bat_w": "total_battery_power",    # + charging
    "grid_w": "total_grid_power",
    "load_pct": "total_load_percentage",
    "grid_v": "total_grid_voltage",
    "grid_hz": "total_grid_frequency",
    "out_v": "total_ac_output_voltage",
    "out_hz": "total_ac_output_frequency",
    "bus_v": "total_bus_voltage",
    "soc": "battery_1_state_of_charge",
    "bat_v": "battery_1_voltage",
    "bat_a": "battery_1_current",
    "bat_w_bms": "battery_1_power",
    "capacity_ah": "battery_1_capacity",
    "soh": "battery_1_state_of_health",
    "cycles": "battery_1_cycles",
    "bat_temp": "battery_1_temperature",
    "cell_hi": "battery_1_cell_voltage_-_highest",
    "cell_lo": "battery_1_cell_voltage_-_lowest",
    "cell_imb": "battery_1_cell_voltage_-_imbalance",
    "fc_w": "weather_pv_power_predicted",
    "fc_left": "weather_pv_energy_remaining_today",
    "cloud": "weather_cloud_cover",
}
SA_ENERGY = {
    # daily counters that reset at midnight (state_class total_increasing)
    "pv": ["total_pv_energy"],
    "load": ["total_load_energy"],
    "grid_in": ["total_grid_energy_in"],
    "grid_out": ["total_grid_energy_out"],
    "bat_in": ["total_battery_energy_in"],
    "bat_out": ["total_battery_energy_out"],
}

ENERGY_KEYS = ["pv", "load", "grid_in", "grid_out", "bat_in", "bat_out"]
SYSTEM_KEYS = list(SA_SYSTEM)


def detect_inverters(source: str, uids: dict[str, str]) -> int:
    """Number of inverters found for a source (0 if none)."""
    n = 0
    for i in range(1, MAX_INVERTERS + 1):
        if source == SOURCE_DONGLE and f"growatt_{i}_output_power" in uids:
            n = i
        elif source == SOURCE_SA and f"inverter_{i}_load_power" in uids:
            n = i
    return n


def build_settings(source: str, ctrl: dict[str, str], inverters: int) -> list[dict]:
    """Per inverter: setting name -> select / number entity, plus the clock button."""
    prefix = {SOURCE_DONGLE: "growatt", SOURCE_SA: "inverter"}.get(source)
    out: list[dict] = []
    for i in range(1, inverters + 1):
        found: dict = {}
        if prefix:
            for name in SETTINGS:
                ent = ctrl.get(f"{prefix}_{i}_{name}")
                if ent and ent.split(".")[0] in ("select", "number"):
                    found[name] = ent
            btn = ctrl.get(f"{prefix}_{i}_sync_clock")
            if btn:
                found["sync_clock"] = btn
        out.append(found)
    return out


def build_map(source: str, uids: dict[str, str], inverters: int, manual: dict | None = None,
              ctrl: dict[str, str] | None = None) -> dict:
    """Return the entity map used by the panel.

    ``uids`` maps the unique id of every MQTT sensor to its entity id.
    ``manual`` holds entities chosen by hand; they win over the automatic ones.
    ``ctrl`` maps the unique id of every MQTT select / number / button to its entity id.
    """
    inv_list: list[dict] = []
    system: dict = {}
    energy: dict = {k: [] for k in ENERGY_KEYS}

    for i in range(1, inverters + 1):
        inv: dict = {}
        if source == SOURCE_DONGLE:
            for key, suffix in DONGLE_INVERTER.items():
                ent = uids.get(f"growatt_{i}_{suffix}")
                if ent:
                    inv[key] = ent
            for key, suffixes in DONGLE_ENERGY.items():
                for suffix in suffixes:
                    ent = uids.get(f"growatt_{i}_{suffix}")
                    if ent:
                        energy[key].append(ent)
        elif source == SOURCE_SA:
            for key, suffix in SA_INVERTER.items():
                ent = uids.get(f"inverter_{i}_{suffix}")
                if ent:
                    inv[key] = ent
        inv_list.append(inv)

    if source == SOURCE_DONGLE:
        for i in range(1, inverters + 1):
            if f"growatt_{i}_bms_soc" in uids:
                for key, suffix in DONGLE_BMS.items():
                    ent = uids.get(f"growatt_{i}_{suffix}")
                    if ent:
                        system[key] = ent
                break

    if source == SOURCE_SA:
        for key, uid in SA_SYSTEM.items():
            ent = uids.get(uid)
            if ent:
                system[key] = ent
        # a DongleGrowatt on the BMS inverter adds what Solar Assistant does not publish
        # (battery temperature, the BMS charge limits and codes)
        for i in range(1, MAX_INVERTERS + 1):
            if f"growatt_{i}_bms_soc" in uids:
                for key, suffix in DONGLE_BMS.items():
                    ent = uids.get(f"growatt_{i}_{suffix}")
                    if ent and key not in system:
                        system[key] = ent
                break
        for key, uid_list in SA_ENERGY.items():
            energy[key] = [uids[u] for u in uid_list if u in uids]

    # after moving from Solar Assistant to the dongles: its energy counters keep the history
    # (the panel uses them for the time before the switch, see history_until)
    energy_history: dict = {}
    if source == SOURCE_DONGLE:
        for key, uid_list in SA_ENERGY.items():
            found = [uids[u] for u in uid_list if u in uids]
            if found:
                energy_history[key] = found

    options: dict = {}
    for key, ent in (manual or {}).items():
        if isinstance(ent, bool):
            options[key] = ent
            continue
        if not ent:
            continue
        if key.startswith("energy_"):
            energy[key[len("energy_"):]] = [ent] if isinstance(ent, str) else list(ent)
        else:
            system[key] = ent

    return {
        "source": source,
        "inverters": inv_list,
        "system": system,
        "energy": energy,
        # energy sensors that reset every day; the panel reads them the same way
        # (daily change from the long-term statistics) in both cases
        "energy_daily_reset": source == SOURCE_SA,
        "energy_history": energy_history,
        # invert_bat / invert_grid: the chosen sensors use the opposite sign
        "options": options,
        "settings": build_settings(source, ctrl or {}, inverters),
        "settings_locked": SETTINGS_LOCKED,
    }


def parse_order(text: str | None, inverters: int) -> list[int]:
    """"1,3,2" -> [1, 3, 2]: which source inverter is shown in each column.

    Anything that is not a complete list of 1..inverters gives the normal order.
    """
    normal = list(range(1, inverters + 1))
    if not text:
        return normal
    try:
        order = [int(x) for x in str(text).replace(";", ",").replace(" ", ",").split(",") if x.strip()]
    except ValueError:
        return normal
    return order if sorted(order) == normal else normal


def parse_names(text: str | None, inverters: int) -> list[str]:
    """"L1, L2, L3" -> ["L1", "L2", "L3"]; missing names become "#n"."""
    names = [x.strip() for x in str(text or "").split(",")]
    return [names[i] if i < len(names) and names[i] else f"#{i + 1}" for i in range(inverters)]


def apply_order(entity_map: dict, order_text: str | None, names_text: str | None) -> dict:
    """Show the inverters in another order and with names (for example by phase).

    Useful when the source numbers them differently from the installation, for example
    Solar Assistant numbering them by the USB port each one is plugged into.
    """
    invs = entity_map.get("inverters", [])
    n = len(invs)
    order = parse_order(order_text, n)
    entity_map["inverters"] = [invs[i - 1] for i in order]
    sets = entity_map.get("settings") or []
    if len(sets) == n:
        entity_map["settings"] = [sets[i - 1] for i in order]
    entity_map["names"] = parse_names(names_text, n)
    entity_map["order"] = order
    return entity_map


def missing(entity_map: dict) -> list[str]:
    """Keys the panel needs most and could not find (for the setup summary)."""
    out = []
    invs = entity_map.get("inverters", [])
    sysm = entity_map.get("system", {})
    if not invs and not sysm.get("pv"):
        out.append("pv")
    if not invs and not sysm.get("load"):
        out.append("load")
    if not sysm.get("soc") and not any(i.get("soc") for i in invs):
        out.append("soc")
    if not entity_map.get("energy", {}).get("pv"):
        out.append("energy_pv")
    return out
