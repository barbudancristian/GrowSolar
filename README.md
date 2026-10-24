<p align="center"><img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/icon.png" width="96" alt="GrowSolar"></p>

# GrowSolar

A solar dashboard for Home Assistant, made for **Growatt SPF** off-grid inverters (one or several, for example one per phase). It adds a **GrowSolar** page to the sidebar with six views: **Dashboard**, **Charts**, **Totals**, **Inverters**, **Battery** and **Settings**.

> **Română:** [README.ro.md](https://github.com/barbudancristian/GrowSolar/blob/main/README.ro.md)

It reads the data from the sensors you already have in Home Assistant:

- **DongleGrowatt**: the Growatt ShineWiFi-X2 stick with the [Growatt-SPF6K-HA](https://github.com/barbudancristian/Growatt-SPF6K-HA) firmware and its Home Assistant packages;
- **Solar Assistant**: through its MQTT integration;
- **any other sensors** you pick by hand.

The sensors are found automatically by their unique ids, so it does not matter how you renamed them.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/dashboard.png" width="900" alt="GrowSolar dashboard">

*Screenshots show sample data.*

## Views

**Dashboard**: inverter mode, today's solar energy and peak, grid voltage, battery voltage, state of charge and how fast it changes (%/h). Live gauges for load, solar, grid and battery. *PV today* with yesterday, generated, remaining and tomorrow, the power curve against the forecast and the cloud cover. Overview of load, grid and solar for the last 24 hours. Tap the inverter or battery tile to open its page.

**Charts**: 1 h to 30 days, or a custom range, with ‹ › to move back and forward in time. Overview, battery power and state of charge with voltage. MPPT 1 and 2 voltage, current and power for each inverter. Total and per-inverter PV power, battery current and load. Battery voltage and temperature, AC output voltage, inverter temperature, grid voltage and frequency, bus voltage. Hover or tap a chart to read the values; click a legend entry to hide a line.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/charts.png" width="900" alt="Charts">

**Totals**: three sections, each with a filled area chart (bars for the years) next to a table of load, solar, battery charged and discharged, grid used and exported, and the savings at your energy price: one month day by day, one year month by month (‹ › to move to another month or year) and every year since the counters started. Above each chart: the savings of that month, that year and the total since the first recorded month. The download button saves each table as a CSV file (same columns as Solar Assistant's export, in Wh).

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/totals.png" width="900" alt="Totals">

**Inverters**: every value side by side for each inverter, with a total column: mode, temperature, bus voltage, load, AC output, PV per MPPT, battery, grid, priorities and serial number.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/inverters.png" width="900" alt="Inverters">

**Battery**: capacity, state of charge and health, power, current, voltage, time to full or empty, cycles, cell voltages and imbalance, temperature.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/battery.png" width="900" alt="Battery">

**Settings**: every inverter setting side by side, with the ones that differ between inverters marked. Change one inverter, or **Apply to all** for parallel systems: GrowSolar shows what will change, sends it to one inverter at a time, waits until each one confirms the new value and stops if one does not. Works with the Solar Assistant setting entities and with DongleGrowatt (which adds BLU/LBU, AC input range, grid hours, buzzer and clock sync).

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/settings.png" width="900" alt="Settings">

The page works on phones too, and in Romanian or English (from your Home Assistant profile language).

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/mobile.png" width="300" alt="On a phone">

## Install with HACS

1. HACS → **⋮ → Custom repositories** → add `https://github.com/barbudancristian/GrowSolar`, type **Integration**.
2. Search for **GrowSolar** in HACS → **Download**.
3. Restart Home Assistant.
4. **Settings → Devices & services → Add integration → GrowSolar**.

Manual install: copy `custom_components/growsolar` into your `config/custom_components/` folder and restart.

## Setup

Full guide with every option, the manual sensor choice and troubleshooting: **[docs/SETUP.en.md](https://github.com/barbudancristian/GrowSolar/blob/main/docs/SETUP.en.md)**.

1. **Data source**: DongleGrowatt, Solar Assistant or manual. The dialog shows how many inverters it found for each source.
2. **System**: name in the sidebar, number of inverters, battery capacity (kWh), solar array size (kWp, for the solar gauge), energy price and currency.
3. Only for the manual source: choose the sensors (solar, load, battery, grid power, state of charge, energy counters), tick the sign boxes if your battery or grid sensor uses the opposite sign, and optionally a weather entity.

You can change everything later from **Configure**, where you can also add or replace single sensors. The panel reloads by itself.

## Requirements and notes

- Home Assistant 2024.11 or newer, with the **recorder** (on by default).
- *Charts* use the history (up to 3 days) and the 5-minute or hourly statistics (longer ranges). *Totals* use the long-term statistics of the energy counters (`state_class: total_increasing`), so they fill up from the day the counters started.
- Forecast: the dashed curve for the whole day, *Remaining* and *Tomorrow* come from the solar forecast in Home Assistant's Energy settings (**Solcast** or **Forecast.Solar**); without one, from Solar Assistant's own prediction. The cloud cover after the current hour and the weather icons come from a weather entity (the first one found, or the one chosen in Configure).
- Sign convention in the page: battery power positive while charging, grid power positive while importing.
- With DongleGrowatt, *Battery charged* is not available because the inverter has no counter for it. The battery page uses the BMS values (SOH, cycles, cells) from the dongle of the inverter wired to the BMS.
- Only Home Assistant administrators can change inverter settings.
- Everything stays in your Home Assistant. The page uses no internet services and no external libraries.

## Credits and license

Author: **Barbu Dan-Cristian**. The visual style follows the Home Assistant solar dashboard by **Andrei Cristetiu**.

MIT license, see [LICENSE](https://github.com/barbudancristian/GrowSolar/blob/main/LICENSE). Not affiliated with Growatt or Solar Assistant; the names belong to their owners.
