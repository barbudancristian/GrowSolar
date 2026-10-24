"""Constants for GrowSolar."""

DOMAIN = "growsolar"
VERSION = "0.2.6"

PANEL_URL = "growsolar"
STATIC_URL = "/growsolar_static"
PANEL_ELEMENT = "growsolar-panel"

CONF_SOURCE = "source"
CONF_INVERTERS = "inverters"
CONF_BATTERY_KWH = "battery_kwh"
CONF_PV_KWP = "pv_kwp"
CONF_PRICE = "price"
CONF_CURRENCY = "currency"
CONF_TITLE = "title"
CONF_MANUAL = "manual"
CONF_ORDER = "inverter_order"
CONF_NAMES = "inverter_names"
CONF_HISTORY_UNTIL = "history_until"

SOURCE_DONGLE = "donglegrowatt"
SOURCE_SA = "solar_assistant"
SOURCE_MANUAL = "manual"
SOURCES = [SOURCE_DONGLE, SOURCE_SA, SOURCE_MANUAL]

MAX_INVERTERS = 6
