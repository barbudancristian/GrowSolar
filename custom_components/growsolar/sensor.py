"""Sensors of the PACE BMS read by GrowSolar (cells, temperatures, state)."""
from __future__ import annotations

import asyncio
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
    EntityCategory,
    UnitOfElectricCurrent,
    UnitOfElectricPotential,
    UnitOfPower,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .bms import PaceBmsCoordinator
from .const import DOMAIN
from .pace import TEMP_NAMES, Alarm, Analog

DEFAULT_CELLS = 16
W = UnitOfPower.WATT
V, A, AH, C = UnitOfElectricPotential.VOLT, UnitOfElectricCurrent.AMPERE, "Ah", UnitOfTemperature.CELSIUS
MV = UnitOfElectricPotential.MILLIVOLT


@dataclass
class Spec:
    key: str
    name: str
    value: Callable[[Analog, Alarm | None], Any]
    unit: str | None = None
    dc: SensorDeviceClass | None = None
    precision: int | None = None
    measurement: bool = True
    category: EntityCategory | None = None


def _temp(i: int) -> Callable[[Analog, Alarm | None], Any]:
    return lambda a, _: a.temps[i] if i < len(a.temps) else None


def _cell(i: int) -> Callable[[Analog, Alarm | None], Any]:
    return lambda a, _: a.cells[i] if i < len(a.cells) else None


def _state(a: Analog, al: Alarm | None) -> str:
    if al is None:
        return "ok"
    if al.faults:
        return "fault"
    if al.protections:
        return "protection"
    if al.warnings:
        return "warning"
    return "ok"


TEMP_LABELS = {"cells_1": "temperature cells 1", "cells_2": "temperature cells 2", "cells_3": "temperature cells 3",
               "cells_4": "temperature cells 4", "mosfet": "temperature MOSFET", "ambient": "temperature ambient"}

def _operation(a: Analog, al: Alarm | None) -> str | None:
    """What the BMS says it is doing (status bits when sent, else from the current)."""
    if al is not None and al.charging is not None:
        if al.fully_charged:
            return "full"
        return "charging" if al.charging else "discharging" if al.discharging else "idle"
    return "charging" if a.current > 0.5 else "discharging" if a.current < -0.5 else "idle"


SPECS = [
    Spec("voltage", "voltage", lambda a, _: round(a.voltage, 2), V, SensorDeviceClass.VOLTAGE, 2),
    Spec("current", "current", lambda a, _: round(a.current, 2), A, SensorDeviceClass.CURRENT, 2),
    Spec("power", "power", lambda a, _: round(a.voltage * a.current), W, SensorDeviceClass.POWER, 0),
    Spec("soc", "state of charge", lambda a, _: a.soc, PERCENTAGE, SensorDeviceClass.BATTERY, 1),
    Spec("soh", "state of health", lambda a, _: a.soh, PERCENTAGE, None, 1),
    Spec("remaining_ah", "remaining capacity", lambda a, _: a.remaining_ah, AH, None, 1),
    Spec("full_ah", "full capacity", lambda a, _: a.full_ah, AH, None, 1),
    Spec("design_ah", "design capacity", lambda a, _: a.design_ah, AH, None, 1, False, EntityCategory.DIAGNOSTIC),
    Spec("cycles", "cycles", lambda a, _: a.cycles, None, None, 0, False),
    Spec("cell_max", "cell voltage highest", lambda a, _: max(a.cells), V, SensorDeviceClass.VOLTAGE, 3),
    Spec("cell_min", "cell voltage lowest", lambda a, _: min(a.cells), V, SensorDeviceClass.VOLTAGE, 3),
    Spec("cell_avg", "cell voltage average", lambda a, _: round(sum(a.cells) / len(a.cells), 3), V, SensorDeviceClass.VOLTAGE, 3),
    Spec("cell_delta", "cell voltage imbalance", lambda a, _: round((max(a.cells) - min(a.cells)) * 1000), MV, SensorDeviceClass.VOLTAGE, 0),
    Spec("cell_max_no", "cell highest number", lambda a, _: a.cells.index(max(a.cells)) + 1, None, None, 0, False),
    Spec("cell_min_no", "cell lowest number", lambda a, _: a.cells.index(min(a.cells)) + 1, None, None, 0, False),
    Spec("state", "state", _state, None, None, None, False),
    Spec("operation", "operation", _operation, None, None, None, False),
    Spec("status_raw", "status bytes", lambda _, al: al.raw if al else None, None, None, None, False, EntityCategory.DIAGNOSTIC),
]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coord: PaceBmsCoordinator | None = hass.data.get(DOMAIN, {}).get("bms")
    if coord is None:
        return
    if not coord.data:
        try:
            await asyncio.wait_for(coord.async_refresh(), 20)
        except asyncio.TimeoutError:
            pass
    a = coord.data["analog"] if coord.data else None
    n_cells = len(a.cells) if a else DEFAULT_CELLS
    n_temps = len(a.temps) if a else len(TEMP_NAMES)
    specs = [s for s in SPECS if not (a and a.design_ah is None and s.key in ("soh", "design_ah"))]
    specs += [Spec(f"cell_{i + 1:02d}", f"cell {i + 1:02d}", _cell(i), V, SensorDeviceClass.VOLTAGE, 3) for i in range(n_cells)]
    for i in range(n_temps):
        key = TEMP_NAMES[i] if i < len(TEMP_NAMES) else f"temp_{i + 1}"
        specs.append(Spec(f"temp_{key}", TEMP_LABELS.get(key, f"temperature {i + 1}"), _temp(i), C, SensorDeviceClass.TEMPERATURE, 1))
    if a:
        # a pack with fewer cells or probes than the defaults: drop the sensors it does not have
        keep = {f"growsolar_bms_{s.key}" for s in specs}
        reg = er.async_get(hass)
        for e in list(reg.entities.values()):
            if e.platform == DOMAIN and e.unique_id.startswith("growsolar_bms_") and e.unique_id not in keep:
                reg.async_remove(e.entity_id)
    async_add_entities(BmsSensor(coord, entry, s) for s in specs)


class BmsSensor(CoordinatorEntity[PaceBmsCoordinator], SensorEntity):
    """One value of the BMS."""

    def __init__(self, coord: PaceBmsCoordinator, entry: ConfigEntry, spec: Spec) -> None:
        super().__init__(coord)
        self.spec = spec
        self._attr_unique_id = f"growsolar_bms_{spec.key}"
        self._attr_has_entity_name = True
        self._attr_name = spec.name[0].upper() + spec.name[1:]      # shown as "PACE BMS Cell 01"
        self.entity_id = f"sensor.growsolar_bms_{spec.key}"
        self._attr_native_unit_of_measurement = spec.unit
        self._attr_device_class = spec.dc
        self._attr_suggested_display_precision = spec.precision
        self._attr_state_class = SensorStateClass.MEASUREMENT if spec.measurement and spec.unit else None
        self._attr_entity_category = spec.category
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "pace_bms")}, name="PACE BMS", manufacturer="PACE",
            model="Battery BMS (RS485)", configuration_url=f"http://{coord.host}",
        )

    @property
    def native_value(self) -> Any:
        d = self.coordinator.data
        if not d:
            return None
        try:
            return self.spec.value(d["analog"], d.get("alarm"))
        except (ValueError, ZeroDivisionError, IndexError):
            return None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        if self.spec.key != "state" or not self.coordinator.data:
            return None
        al: Alarm | None = self.coordinator.data.get("alarm")
        c = self.coordinator
        attrs: dict[str, Any] = {"address": c.adr, "protocol": f"{c.rver or c.ver or 0:#04x}", "current_unit_a": c.scale,
                                 "balancing_reported": c.rver != 0x20}
        if al is not None:
            attrs.update(
                charge_mos=al.charge_mos, discharge_mos=al.discharge_mos, current_limit=al.current_limit,
                balancing=al.balancing, protections=al.protections, faults=al.faults, warnings=al.warnings,
                fully_charged=al.fully_charged, charging=al.charging, discharging=al.discharging,
                heater=al.heater, buzzer=al.buzzer,
            )
        return attrs
