"""Config and options flow for GrowSolar."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers import selector
from homeassistant.util import dt as dt_util

from . import mqtt_unique_ids
from .const import (
    CONF_BATTERY_KWH,
    CONF_BMS_HOST,
    CONF_BMS_PORT,
    DEFAULT_BMS_PORT,
    CONF_CURRENCY,
    CONF_INVERTERS,
    CONF_HISTORY_UNTIL,
    CONF_MANUAL,
    CONF_NAMES,
    CONF_ORDER,
    CONF_PRICE,
    CONF_PRICE_FROM,
    CONF_TARIFFS,
    CONF_PV_KWP,
    CONF_SOURCE,
    CONF_TITLE,
    DOMAIN,
    MAX_INVERTERS,
    SOURCE_DONGLE,
    SOURCE_MANUAL,
    SOURCE_SA,
    SOURCES,
)
from .mapping import build_map, detect_inverters, missing
from .tariff import initial_tariffs, price_at, update_tariffs

# entities the user picks by hand for the "manual" source (all optional)
MANUAL_FIELDS = {
    "pv": "power",
    "load": "power",
    "bat_w": "power",
    "grid_w": "power",
    "soc": "battery",
    "bat_v": "voltage",
    "grid_v": "voltage",
    "energy_pv": "energy",
    "energy_load": "energy",
    "energy_grid_in": "energy",
    "energy_bat_in": "energy",
    "energy_bat_out": "energy",
}


def _settings_schema(defaults: dict, detected: int, price_from: bool = False) -> vol.Schema:
    schema = vol.Schema(
        {
            vol.Required(CONF_TITLE, default=defaults.get(CONF_TITLE, "GrowSolar")): str,
            vol.Required(
                CONF_INVERTERS, default=int(defaults.get(CONF_INVERTERS) or detected or 1)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=1, max=MAX_INVERTERS, step=1, mode="box")
            ),
            vol.Required(
                CONF_BATTERY_KWH, default=float(defaults.get(CONF_BATTERY_KWH) or 10)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=0.5, max=500, step=0.1, mode="box", unit_of_measurement="kWh")
            ),
            vol.Required(
                CONF_PV_KWP, default=float(defaults.get(CONF_PV_KWP) or 0)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=0, max=500, step=0.1, mode="box", unit_of_measurement="kWp")
            ),
            vol.Required(
                CONF_PRICE, default=float(defaults.get(CONF_PRICE) or 1.0)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=0, max=100, step=0.01, mode="box")
            ),
            vol.Required(CONF_CURRENCY, default=defaults.get(CONF_CURRENCY, "RON")): str,
            # optional: show the inverters in another order ("1,3,2") and with names ("L1,L2,L3")
            vol.Optional(CONF_ORDER, description={"suggested_value": defaults.get(CONF_ORDER, "")}): str,
            vol.Optional(CONF_NAMES, description={"suggested_value": defaults.get(CONF_NAMES, "")}): str,
            # optional: PACE BMS behind an RS485-to-Ethernet converter (TCP server, transparent)
            vol.Optional(CONF_BMS_HOST, description={"suggested_value": defaults.get(CONF_BMS_HOST, "")}): str,
            vol.Optional(CONF_BMS_PORT, default=int(defaults.get(CONF_BMS_PORT) or DEFAULT_BMS_PORT)): selector.NumberSelector(
                selector.NumberSelectorConfig(min=1, max=65535, step=1, mode="box")
            ),
        }
    )
    if not price_from:
        return schema
    # a changed price applies from this day on; the savings before it keep the old price
    return schema.extend(
        {vol.Optional(CONF_PRICE_FROM, default=dt_util.now().date().isoformat()): selector.DateSelector()}
    )


def _manual_schema(defaults: dict) -> vol.Schema:
    fields = {}
    for key, dc in MANUAL_FIELDS.items():
        fields[vol.Optional(key, description={"suggested_value": defaults.get(key)})] = (
            selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", device_class=dc))
        )
    # sign of the chosen sensors: GrowSolar expects battery + while charging and grid + while importing
    fields[vol.Optional("invert_bat", default=bool(defaults.get("invert_bat", False)))] = selector.BooleanSelector()
    fields[vol.Optional("invert_grid", default=bool(defaults.get("invert_grid", False)))] = selector.BooleanSelector()
    # weather entity for the cloud forecast on the "PV today" chart (default: the first one found)
    fields[vol.Optional("weather", description={"suggested_value": defaults.get("weather")})] = (
        selector.EntitySelector(selector.EntitySelectorConfig(domain="weather"))
    )
    return vol.Schema(fields)


class GrowSolarConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up GrowSolar."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        uids = mqtt_unique_ids(self.hass)
        found = {s: detect_inverters(s, uids) for s in (SOURCE_DONGLE, SOURCE_SA)}
        if user_input is not None:
            self._data[CONF_SOURCE] = user_input[CONF_SOURCE]
            return await self.async_step_settings()
        default = SOURCE_SA if found[SOURCE_SA] else SOURCE_DONGLE if found[SOURCE_DONGLE] else SOURCE_MANUAL
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SOURCE, default=default): selector.SelectSelector(
                        selector.SelectSelectorConfig(options=SOURCES, translation_key="source", mode=selector.SelectSelectorMode.LIST)
                    )
                }
            ),
            description_placeholders={
                "dongle": str(found[SOURCE_DONGLE]),
                "firmware_url": "https://github.com/barbudancristian/Growatt-SPF6K-HA",
                "sa": str(found[SOURCE_SA]),
            },
        )

    async def async_step_settings(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        source = self._data[CONF_SOURCE]
        detected = detect_inverters(source, mqtt_unique_ids(self.hass))
        if user_input is not None:
            user_input[CONF_INVERTERS] = int(user_input[CONF_INVERTERS])
            user_input[CONF_BMS_PORT] = int(user_input.get(CONF_BMS_PORT) or DEFAULT_BMS_PORT)
            user_input[CONF_TARIFFS] = initial_tariffs(user_input.get(CONF_PRICE))
            self._data.update(user_input)
            if source == SOURCE_MANUAL:
                return await self.async_step_manual()
            return self._finish()
        return self.async_show_form(
            step_id="settings",
            data_schema=_settings_schema({}, detected),
            description_placeholders={"detected": str(detected)},
        )

    async def async_step_manual(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._data[CONF_MANUAL] = {k: v for k, v in user_input.items() if v not in (None, "", [])}
            return self._finish()
        return self.async_show_form(step_id="manual", data_schema=_manual_schema({}))

    def _finish(self) -> ConfigFlowResult:
        if self._data.get(CONF_SOURCE) == SOURCE_DONGLE:
            # Solar Assistant's energy statistics, if any, keep the history before this moment
            self._data[CONF_HISTORY_UNTIL] = dt_util.utcnow().replace(microsecond=0).isoformat()
        return self.async_create_entry(title=self._data.get(CONF_TITLE) or "GrowSolar", data=self._data)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return GrowSolarOptionsFlow()


class GrowSolarOptionsFlow(OptionsFlow):
    """Change the settings or the entities later."""

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        current = {**self.config_entry.data, **self.config_entry.options}
        source = current[CONF_SOURCE]
        uids = mqtt_unique_ids(self.hass)
        detected = detect_inverters(source, uids)
        if user_input is not None:
            user_input[CONF_INVERTERS] = int(user_input[CONF_INVERTERS])
            # an emptied optional field is left out of user_input: clear it
            user_input.setdefault(CONF_ORDER, "")
            user_input.setdefault(CONF_NAMES, "")
            user_input.setdefault(CONF_BMS_HOST, "")
            user_input[CONF_BMS_PORT] = int(user_input.get(CONF_BMS_PORT) or DEFAULT_BMS_PORT)
            # price history: the new price starts on the chosen day, older days keep their price
            today = dt_util.now().date().isoformat()
            start = str(user_input.pop(CONF_PRICE_FROM, None) or today)
            tariffs = update_tariffs(current.get(CONF_TARIFFS), current.get(CONF_PRICE), float(user_input[CONF_PRICE]), start)
            user_input[CONF_TARIFFS] = tariffs
            now_price = price_at(tariffs, today)
            if now_price is not None:
                user_input[CONF_PRICE] = now_price
            self._data = {**current, **user_input}
            return await self.async_step_manual()
        entity_map = build_map(source, uids, int(current.get(CONF_INVERTERS) or 1), current.get(CONF_MANUAL))
        return self.async_show_form(
            step_id="init",
            data_schema=_settings_schema(current, detected, price_from=True),
            description_placeholders={
                "source": source,
                "tariffs": ", ".join(f"{t['from']}: {t['price']}" for t in current.get(CONF_TARIFFS) or initial_tariffs(current.get(CONF_PRICE))),
                "detected": str(detected),
                "missing": ", ".join(missing(entity_map)) or "-",
            },
        )

    async def async_step_manual(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._data[CONF_MANUAL] = {k: v for k, v in user_input.items() if v not in (None, "", [])}
            return self.async_create_entry(data=self._data)
        return self.async_show_form(
            step_id="manual", data_schema=_manual_schema(self._data.get(CONF_MANUAL) or {})
        )
