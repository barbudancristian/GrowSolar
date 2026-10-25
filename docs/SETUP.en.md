# GrowSolar – setup guide

> **Română:** [SETUP.ro.md](SETUP.ro.md)

This guide covers installing GrowSolar, every option in the *Add integration* dialog, the manual entity choice for systems that are not DongleGrowatt or Solar Assistant, and the most common problems.

## Contents

1. [Before you start](#1-before-you-start)
2. [Install](#2-install)
3. [Step 1: data source](#3-step-1-data-source)
4. [Step 2: system](#4-step-2-system)
5. [Step 3: entities (manual source)](#5-step-3-entities-manual-source)
6. [Solar forecast and weather](#6-solar-forecast-and-weather)
7. [Inverter settings](#7-inverter-settings)
8. [Changing the settings later](#8-changing-the-settings-later)
9. [Troubleshooting](#9-troubleshooting)
10. [Remove GrowSolar](#10-remove-growsolar)

## 1. Before you start

GrowSolar only displays data that already exists in Home Assistant. Check three things:

- **Your sensors are in Home Assistant**: solar power, load power, battery power and state of charge at least, and ideally the energy counters (kWh).
- **The recorder stores them.** Charts use the history and *Totals* uses the long-term statistics. If your `configuration.yaml` has a `recorder:` → `exclude:` section, make sure your solar sensors are not excluded (for example by a glob such as `"*.growatt_*"`). Excluded sensors give empty charts.
- **Energy counters have long-term statistics.** They need `device_class: energy` and `state_class: total_increasing` (or `total`). Most integrations set this. You can check in **Developer tools → Statistics**: the sensor must be listed there without errors.

## 2. Install

1. **HACS → ⋮ (top right) → Custom repositories**: repository `https://github.com/barbudancristian/GrowSolar`, type **Integration** → **Add**.
2. Search for **GrowSolar** in HACS → open it → **Download**.
3. **Settings → System → Restart Home Assistant.** Without the restart the integration does not show up.
4. **Settings → Devices & services → + Add integration →** search for **GrowSolar**.

Only one GrowSolar can be set up per Home Assistant. Manual install without HACS: copy `custom_components/growsolar` into `config/custom_components/` and restart.

## 3. Step 1: data source

The first window asks where GrowSolar reads the system from. Under the question it shows how many inverters it found right now for each source.

| Option | When to choose it | What it finds by itself |
| --- | --- | --- |
| **DongleGrowatt** | Growatt inverter(s) with the ShineWiFi-X2 stick flashed with the [Growatt-SPF6K-HA](https://github.com/barbudancristian/Growatt-SPF6K-HA) firmware (one per inverter) and its Home Assistant package. GrowSolar can also change the inverter settings. | Every inverter (`sensor.growatt_1_…`, `growatt_2_…`), with PV1/PV2, battery, output, grid, temperatures, status, settings and energy counters. |
| **Solar Assistant** | No dongles: the inverter(s) are connected by USB cable to Solar Assistant, and Home Assistant gets the data from Solar Assistant over MQTT. | Every inverter and the system totals, the battery (BMS: cells, cycles, health), the daily energy counters, the Solar Assistant prediction and cloud cover. |
| **Choose the sensors myself** | Another inverter brand (not Growatt: Deye, Victron, Huawei, SMA …) or any system whose sensors are already in Home Assistant (other integrations, template sensors). | Nothing; you pick the sensors in step 3. |

With **DongleGrowatt**, the page can also show the Growatt logo (Dashboard, Charts, Totals) and an inverter picture above each inverter (Inverters). The images are not part of GrowSolar: copy `growatt-logo.png` and `growatt-inverter.png` to `<config>/www/growsolar/` (for example with the File editor or Samba add-on) and refresh the page. Without them, nothing is shown.

The first two sources find the sensors by their **unique id**, so it does not matter how you renamed the entities. If a source shows 0 inverters, its sensors are missing or disabled, or they are not MQTT sensors.

## 4. Step 2: system

| Field | What to enter |
| --- | --- |
| **Name in the sidebar** | The title of the page and of the sidebar entry, for example `Solar` or `GrowSolar`. |
| **Number of inverters** | 1 to 6. The proposed value is how many inverters were found. For the manual source leave 1: the manual entities describe the whole system. |
| **Battery capacity (kWh)** | The usable capacity of all batteries together. Example: 304 Ah × 51.2 V ≈ 15.6 kWh. Used for the time to full / empty and the %/h rate. |
| **Solar array size (kWp)** | The panels' total peak power, for example 6 × 600 W = 3.6. Only sets the scale of the solar gauge; 0 = 6 kW per inverter. |
| **Energy price per kWh** | What you pay for 1 kWh from the grid. Used for the savings in *Totals*: (load − energy from grid) × price. |
| **Currency** | Shown next to the savings, for example `RON`, `EUR`. |
| **Inverter order** (optional) | Which inverter of the source goes in each column, for example `1,3,2`. Solar Assistant numbers the inverters by the USB port they are plugged into, so its numbers may not match the phases: if its inverter 3 is on L2, enter `1,3,2`. Empty = the source's order. |
| **Inverter names** (optional) | Names for the columns and chart lines, for example `L1,L2,L3`. Empty = `#1`, `#2`, ... |

For DongleGrowatt and Solar Assistant, setup ends here and the **GrowSolar** page appears in the sidebar. If it does not, refresh the browser (on a phone, close and reopen the app).

## 5. Step 3: entities (manual source)

This window appears only for **Choose the sensors myself**, and later under **Configure**. Every field is optional, but the page is only as complete as the sensors you give it.

The lists only show sensors with the right **device class** (power, energy, voltage, battery). If your sensor is missing from a list, open it in Home Assistant → ⚙ → **Show as** and pick the right class, or ask the integration's author to set it.

### Live values

| Field | Sensor to choose | Unit | Used for |
| --- | --- | --- | --- |
| **Solar power** | Total PV power of all strings and inverters | W | Solar gauge, flow, *PV today*, charts |
| **Load power** | Power used by the house (inverter output) | W | Load gauge, overview, charts |
| **Battery power (+ charging)** | Battery power, **positive while charging** | W | Battery gauge, %/h rate, time left, charts |
| **Grid power (+ import)** | Power taken from the grid, **positive while importing** | W | Grid gauge, overview |
| **Battery state of charge** | SOC | % | Battery tile and page, SOC chart |
| **Battery voltage** | Battery voltage | V | Battery tile and page |
| **Grid voltage** | Grid voltage | V | Grid tile (present / absent) |

**Signs.** GrowSolar expects the battery to be **positive while charging** and the grid **positive while importing**. Many integrations use the opposite for the battery (positive while discharging). Do not build template sensors for this; tick the boxes at the bottom of the window:

- **Battery sensor is positive while discharging (invert)**
- **Grid sensor is negative while importing (invert)**

Quick check: on a sunny day with a full load on solar, the battery tile must say *charging* and the battery power must be positive.

**Units.** Power must be in **W**. If your sensor shows kW, open it → ⚙ → **Unit of measurement** → **W**; Home Assistant converts the value.

### Energy counters (for *Totals*, *PV today* and savings)

| Field | Sensor to choose |
| --- | --- |
| **Solar energy** | Energy produced by the panels (kWh) |
| **Load energy** | Energy used by the house (kWh) |
| **Energy from grid** | Energy taken from the grid (kWh) |
| **Battery energy charged** | Energy put into the battery (kWh) |
| **Battery energy discharged** | Energy taken from the battery (kWh) |

Both kinds of counters work:

- **cumulative** counters that only grow (for example *Total PV energy*);
- **daily** counters that reset at midnight (for example *Today's PV energy*), as long as they have `state_class: total_increasing`.

If you have both, prefer the cumulative one. A *utility_meter* helper also works.

### Weather (cloud forecast)

The weather entity used for the cloud cover after the current hour and the weather icons on the *PV today* chart. Leave it empty to use the first weather entity in Home Assistant (for example `weather.forecast_home` from Met.no).

### Example: a Deye or Sunsynk inverter (Solarman integration)

| Field | Typical sensor |
| --- | --- |
| Solar power | *PV power* (or the sum of *PV1 power* and *PV2 power*) |
| Load power | *Load power* |
| Battery power | *Battery power*, usually positive while discharging → tick **invert** |
| Grid power | *Grid power* or *Total grid power*, check the sign while importing |
| Battery state of charge | *Battery SOC* |
| Solar energy | *Total PV energy* |
| Load energy | *Total load consumption* |
| Energy from grid | *Total energy bought* |
| Battery energy charged / discharged | *Total battery charge* / *Total battery discharge* |

Names differ between integrations and versions; what matters is the meaning and the unit.

### Battery cells (PACE BMS, optional)

If the battery has a PACE BMS, GrowSolar can read it directly through an RS485-to-Ethernet converter (e.g. Waveshare RS485 to POE ETH) and show every cell, the temperatures, MOSFETs, balancing and alarms on the **Battery** page.

1. Wire the converter to the free **RS485** port of the battery (on batteries talking to the inverter over CAN, the one next to CAN): pins 1/8 = B, 2/7 = A. If there is no answer, swap A and B or try one of the parallel RS485 ports.
2. Converter: 9600 baud, 8N1, **TCP Server**, protocol **None** (transparent), static IP.
3. In GrowSolar → **Configure**: the converter address and port (default 4196).

The sensors are `sensor.growsolar_bms_*` (cells, temperatures, voltage, current, capacity, SOC/SOH, cycles, state). On first start GrowSolar finds the protocol version and the BMS address by itself.

## 6. Solar forecast and weather

- **Forecast curve, *Remaining*, *Tomorrow*.** GrowSolar uses the solar forecast that Home Assistant already has in **Settings → Dashboards → Energy → Solar panels → Solar production forecast**: **Solcast** (30-minute steps) or **Forecast.Solar** (hourly). Install the integration you prefer and add it there. Without a forecast, the Solar Assistant prediction is used when that is the source.
- **Cloud cover and icons.** The cloud cover up to now comes from Solar Assistant (if that is the source); after now it comes from the hourly forecast of the weather entity.

## 7. Inverter settings

The **Settings** page shows every inverter setting side by side, one column per inverter, and marks in orange the ones that differ between inverters (parallel inverters should have the same values).

- **Change one inverter:** click its value, pick the new one, **Save**.
- **Change all:** pick the value in the *All inverters* column, **Apply to all**.

Before anything is sent, a window lists the old and new value for each inverter. The inverters are changed **one after the other**: GrowSolar waits until the inverter reports the new value (up to 90 s) before it sends the next one, and **stops** if one inverter does not take it. The *Changes* list shows each step and its result. Only Home Assistant administrators can change settings.

Where the settings come from:

- **Solar Assistant:** the select / number entities from its MQTT discovery (`inverter_N_…`), so the page works as soon as GrowSolar is set up.
- **DongleGrowatt:** the entities of the Growatt-SPF6K-HA package, version 0.2 or newer (`growatt_N_…`). On each dongle, tick **Allow inverter settings changes from Home Assistant** in *Dongle settings*. The dongle accepts only a safe list of settings within the manual's limits and reads each value back; if it refuses, the reason is shown next to *not confirmed*. With the dongle you also get the energy priority (BLU / LBU), the AC input range, the grid hours, the buzzer and a button that sets the inverter clocks.

Battery type and remote on/off are shown but cannot be changed here: a wrong value can stop the BMS link or switch the output off. After you add or remove setting entities, reload GrowSolar (**Settings → Devices & services → GrowSolar → ⋮ → Reload**).

## 8. Changing the settings later

**Settings → Devices & services → GrowSolar → Configure.** The first window has the system settings and shows which sensors were not found. The second window lets you add or replace single sensors, the sign boxes and the weather entity, for every source. The page reloads by itself after **Submit**.

To change the **data source**, delete GrowSolar (⋮ → **Delete**) and add it again.

## 9. Troubleshooting

| What you see | Cause and fix |
| --- | --- |
| No **GrowSolar** in the sidebar | Home Assistant was not restarted after the download, or the browser shows an old page: refresh (Ctrl/Cmd + Shift + R). Check that the item is not hidden: profile → *Change the order and hide items*. |
| “GrowSolar has no entities yet” | The source found nothing. Open **Configure** and choose the sensors, or check the source (see step 1). |
| Live values are fine, **charts are empty** | The sensors are excluded from the recorder (`recorder: exclude:` in `configuration.yaml`). Remove the exclusion and restart; charts fill from then on. |
| ***Totals* empty** | The energy counters have no long-term statistics: check **Developer tools → Statistics** and the `state_class` of the counters. Statistics start the day the sensor was first recorded. |
| **Huge or negative values** in *Totals* | The statistic's sum restarted (typically after the sensor was excluded from the recorder). GrowSolar ignores negative jumps; to fix Home Assistant's own statistics use **Developer tools → Statistics → Adjust sum**. |
| Battery says *charging* while it discharges | Opposite sign: tick **Battery sensor is positive while discharging** in **Configure**. |
| No forecast curve or *Tomorrow* | No solar forecast in the Energy settings (see section 6). |
| No cloud line after now | No weather entity, or it has no hourly forecast. Choose another one in **Configure → Weather**. |
| Savings look wrong | Check **Energy price per kWh** and that **Energy from grid** is set; savings are (load − energy from grid) × price. |

If the problem remains, open an issue on GitHub with a screenshot and the lines about `growsolar` from **Settings → System → Logs**.

## 10. Remove GrowSolar

**Settings → Devices & services → GrowSolar → ⋮ → Delete**, then **HACS → GrowSolar → ⋮ → Remove** and restart. GrowSolar does not create entities or change your data, so nothing else is left behind.
