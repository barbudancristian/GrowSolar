"""GrowSolar: a solar dashboard panel for Growatt SPF systems in Home Assistant."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.storage import Store

from .const import (
    CONF_BATTERY_KWH,
    CONF_BMS_HOST,
    CONF_BMS_PORT,
    DEFAULT_BMS_PORT,
    CONF_CURRENCY,
    CONF_INVERTERS,
    CONF_MANUAL,
    CONF_HISTORY_UNTIL,
    CONF_NAMES,
    CONF_ORDER,
    CONF_PRICE,
    CONF_PV_KWP,
    CONF_SOURCE,
    CONF_TITLE,
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_URL,
    SOURCE_DONGLE,
    STATIC_URL,
    VERSION,
)
from .mapping import apply_order, build_map

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
PLATFORMS = ["sensor"]


def mqtt_unique_ids(hass: HomeAssistant) -> dict[str, str]:
    """unique_id -> entity_id for every MQTT sensor in the entity registry."""
    reg = er.async_get(hass)
    return {
        e.unique_id: e.entity_id
        for e in reg.entities.values()
        if e.platform == "mqtt" and e.domain == "sensor" and e.disabled_by is None
    }


def mqtt_control_ids(hass: HomeAssistant) -> dict[str, str]:
    """unique_id -> entity_id for the MQTT select, number and button entities (inverter settings)."""
    reg = er.async_get(hass)
    return {
        e.unique_id: e.entity_id
        for e in reg.entities.values()
        if e.platform == "mqtt" and e.domain in ("select", "number", "button") and e.disabled_by is None
    }


def entry_settings(entry: ConfigEntry) -> dict:
    """Settings from the entry, options winning over the original data."""
    return {**entry.data, **entry.options}


async def _register_static(hass: HomeAssistant) -> None:
    if hass.data.get(f"{DOMAIN}_static"):
        return
    path = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(path), cache_headers=True)]
    )
    hass.data[f"{DOMAIN}_static"] = True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register the GrowSolar panel."""
    await _register_static(hass)
    s = entry_settings(entry)
    entity_map = apply_order(
        build_map(
            s[CONF_SOURCE], mqtt_unique_ids(hass), int(s[CONF_INVERTERS]), s.get(CONF_MANUAL),
            mqtt_control_ids(hass),
        ),
        s.get(CONF_ORDER),
        s.get(CONF_NAMES),
    )
    # the Solar Assistant energy counters are remembered: their long-term statistics keep the
    # history before the switch even after the old Solar Assistant entities are deleted
    store = Store(hass, 1, f"{DOMAIN}.energy_history")
    saved = await store.async_load() or {}
    if entity_map.get("energy_history"):
        if saved.get("energy_history") != entity_map["energy_history"]:
            await store.async_save({"energy_history": entity_map["energy_history"]})
    elif s[CONF_SOURCE] == SOURCE_DONGLE and saved.get("energy_history"):
        entity_map["energy_history"] = saved["energy_history"]
    # energy before this moment comes from the Solar Assistant counters (moved to the dongles)
    entity_map["history_until"] = s.get(CONF_HISTORY_UNTIL) if entity_map.get("energy_history") else None
    entity_map["bms"] = await _setup_bms(hass, entry, s)
    title = s.get(CONF_TITLE) or "GrowSolar"
    # the script is served with cache headers: a changed file must get a new URL
    js = Path(__file__).parent / "frontend" / "growsolar-panel.js"
    stamp = int(await hass.async_add_executor_job(lambda: js.stat().st_mtime))
    if PANEL_URL in hass.data.get("frontend_panels", {}):
        frontend.async_remove_panel(hass, PANEL_URL)
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_ELEMENT,
        frontend_url_path=PANEL_URL,
        module_url=f"{STATIC_URL}/growsolar-panel.js?v={VERSION}-{stamp}",
        sidebar_title=title,
        sidebar_icon="mdi:solar-power-variant",
        require_admin=False,
        embed_iframe=False,
        config={
            "version": VERSION,
            "title": title,
            "map": entity_map,
            "battery_kwh": float(s.get(CONF_BATTERY_KWH) or 0),
            "pv_kwp": float(s.get(CONF_PV_KWP) or 0),
            "price": float(s.get(CONF_PRICE) or 0),
            "currency": s.get(CONF_CURRENCY) or "RON",
        },
    )
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    _LOGGER.debug("GrowSolar panel registered with %s", entity_map)
    return True


async def _setup_bms(hass: HomeAssistant, entry: ConfigEntry, s: dict) -> dict | None:
    """PACE BMS over an RS485-to-Ethernet converter: coordinator, sensors and their ids for the panel."""
    host = (s.get(CONF_BMS_HOST) or "").strip()
    hass.data.setdefault(DOMAIN, {}).pop("bms", None)
    if not host:
        return None
    from .bms import PaceBmsCoordinator   # pylint: disable=import-outside-toplevel

    coord = PaceBmsCoordinator(hass, host, int(s.get(CONF_BMS_PORT) or DEFAULT_BMS_PORT))
    hass.data[DOMAIN]["bms"] = coord
    # the sensor platform waits up to 20 s for the first answer, to create one sensor per cell and probe
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    reg = er.async_get(hass)
    ids = {
        e.unique_id[len("growsolar_bms_"):]: e.entity_id
        for e in reg.entities.values()
        if e.platform == DOMAIN and e.unique_id.startswith("growsolar_bms_")
    }
    return {
        "cells": [ids[k] for k in sorted(k for k in ids if k.startswith("cell_") and k[5:].isdigit())],
        "temps": {k[5:]: v for k, v in ids.items() if k.startswith("temp_")},
        **{k: v for k, v in ids.items() if not (k.startswith("cell_") and k[5:].isdigit()) and not k.startswith("temp_")},
    }


async def _async_reload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove the panel and the BMS sensors."""
    frontend.async_remove_panel(hass, PANEL_URL)
    if hass.data.get(DOMAIN, {}).pop("bms", None) is not None:
        return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    return True
