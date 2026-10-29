"""Energy history entered by hand (months and years before the counters existed).

The panel downloads a CSV template, the user fills it in and uploads it; the
values are kept in Home Assistant's storage and shown in Totals next to the
values from the energy statistics.
"""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store

from .const import DOMAIN

ENERGY_KEYS = ["load", "pv", "bat_in", "bat_out", "grid_in", "grid_out"]
STORE_KEY = f"{DOMAIN}.manual_history"

_ROW = vol.Schema({vol.In(ENERGY_KEYS): vol.Any(None, vol.All(vol.Coerce(float), vol.Range(min=0, max=10_000_000)))})
_MONTH = vol.Match(r"^\d{4}-(0[1-9]|1[0-2])$")
_YEAR = vol.Match(r"^\d{4}$")


def _empty() -> dict[str, Any]:
    return {"months": {}, "years": {}}


async def _data(hass: HomeAssistant) -> dict[str, Any]:
    d = hass.data.setdefault(f"{DOMAIN}_manual", {})
    if "store" not in d:
        d["store"] = Store(hass, 1, STORE_KEY)
        d["data"] = await d["store"].async_load() or _empty()
    return d


@callback
def async_register(hass: HomeAssistant) -> None:
    """Register the websocket commands once."""
    if hass.data.get(f"{DOMAIN}_ws"):
        return
    websocket_api.async_register_command(hass, ws_manual_get)
    websocket_api.async_register_command(hass, ws_manual_set)
    hass.data[f"{DOMAIN}_ws"] = True


@websocket_api.websocket_command({vol.Required("type"): "growsolar/manual/get"})
@websocket_api.async_response
async def ws_manual_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Return the values entered by hand."""
    connection.send_result(msg["id"], (await _data(hass))["data"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "growsolar/manual/set",
        vol.Optional("months", default={}): {_MONTH: _ROW},
        vol.Optional("years", default={}): {_YEAR: _ROW},
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_manual_set(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Save uploaded rows. A row replaces what was stored for its month or year;
    a row with every cell empty removes it."""
    d = await _data(hass)
    data = d["data"]
    saved = removed = 0
    for part in ("months", "years"):
        for key, row in msg[part].items():
            values = {k: v for k, v in row.items() if v is not None}
            if values:
                data[part][key] = values
                saved += 1
            elif data[part].pop(key, None) is not None:
                removed += 1
    await d["store"].async_save(data)
    connection.send_result(msg["id"], {"saved": saved, "removed": removed, "data": data})
