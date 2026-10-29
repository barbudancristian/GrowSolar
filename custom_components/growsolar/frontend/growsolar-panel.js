/*
 * GrowSolar panel for Home Assistant
 * Dashboard, Charts, Totals, Inverters, Battery and Settings views for Growatt SPF systems.
 * Data: DongleGrowatt or Solar Assistant entities, mapped by the integration (panel.config.map).
 *
 * Author: Barbu Dan-Cristian. Visual style after the dashboard by Andrei Cristetiu.
 * SPDX-License-Identifier: MIT
 */
(() => {
const VERSION = '0.3.5';

/* data shared by every panel instance of this page: switching panels and coming back is instant */
const STORE = window.__growsolarStore = window.__growsolarStore || { raw: new Map(), stats: new Map(), memo: new Map() };

/* ------------------------------------------------------------------ texts */
const STR = {
  en: {
    dashboard: 'Dashboard', charts: 'Charts', totals: 'Totals', inverters: 'Inverters', battery: 'Battery',
    vMeters: 'Meters', vFlow: 'Energy flow', fSav: 'Total savings', fMonth: 'Month', fToday: 'Today', fProduces: 'producing', fIdle: 'idle', fImport: 'import', fExport: 'export', fNoGrid: 'no grid', fHome: 'House load', fCharging: 'charging', fDischarging: 'discharging', fRest: 'resting',
    inverter: 'Inverter', solar: 'Solar PV', grid: 'Grid', load: 'Load', mode: 'mode',
    today: 'Today', peak: 'Peak', present: 'present', absent: 'absent', perHour: '%/h', socRate: 'Charge rate',
    cellsTitle: 'Cells · PACE BMS', cHigh: 'Highest', cLow: 'Lowest', cImb: 'Imbalance', cAvg: 'Average', temps: 'Temperatures',
    bmsState: 'BMS state', chgMos: 'Charge MOSFET', dsgMos: 'Discharge MOSFET', noAlarms: 'No alarms', noProt: 'No active protections',
    balancingN: 'balancing', bmsNoAnswer: 'BMS not answering', packV: 'Pack voltage', remFull: 'Remaining / full capacity',
    lgNormal: 'normal', lgEdge: 'near the limit', lgBad: 'below 2.9 V / above 3.6 V', lgHi: 'highest', lgLo: 'lowest', lgBal: 'balancing',
    lgScale: 'Bar scale', lgZoom: 'zoomed so the differences show', t_cells_1: 'Cells 1–4', t_cells_2: 'Cells 5–8', t_cells_3: 'Cells 9–12',
    t_cells_4: 'Cells 13–16', t_mosfet: 'MOSFET', t_ambient: 'Ambient', bmsAddr: 'BMS address · protocol',
    pvToday: 'PV today', yesterday: 'Yesterday', generated: 'Generated', remaining: 'Remaining', tomorrow: 'Tomorrow',
    predicted: 'Predicted', now: 'Now', cloud: 'Cloud cover', overview: 'Overview', last24: 'last 24 hours',
    batteryPower: 'Battery power', soc: 'State of charge', batteryVoltage: 'Battery voltage',
    mppt1v: 'MPPT 1 voltage', mppt1a: 'MPPT 1 current', mppt2v: 'MPPT 2 voltage', mppt2a: 'MPPT 2 current',
    mppt1w: 'MPPT 1 power', mppt2w: 'MPPT 2 power', pvPower: 'PV power', batteryCurrent: 'Battery current',
    batteryTemp: 'Battery temperature', acOutV: 'AC output voltage', invTemp: 'Inverter temperature',
    gridV: 'Grid voltage', gridHz: 'Grid frequency', loadPower: 'Load power', busV: 'Bus voltage',
    total: 'Total', custom: 'Custom', from: 'From', to: 'To', apply: 'Apply',
    last30: 'Last 30 days', last12: 'Last 12 months', batCharged: 'Battery charged', batDischarged: 'Battery discharged',
    gridUsed: 'Grid used', gridExported: 'Grid exported', savings: 'Savings', day: 'Day', month: 'Month',
    deviceMode: 'Device mode', temperature: 'Temperature', loadPct: 'Load percentage', loadVA: 'Load apparent power',
    acOutHz: 'AC output frequency', pvVoltage: 'PV voltage', pvCurrent: 'PV current', batPowerAC: 'Battery power from AC',
    gridPower: 'Grid power', serial: 'Serial number', outPrio: 'Output priority', chgPrio: 'Charger priority',
    capacity: 'Capacity', soh: 'State of health', power: 'Power', current: 'Current', voltage: 'Voltage', cycles: 'Cycles',
    cellV: 'Cell voltage', highest: 'highest', lowest: 'lowest', imbalance: 'imbalance', timeLeft: 'Time left',
    toFull: 'to full', toEmpty: 'to empty', charging: 'charging', discharging: 'discharging', idle: 'idle',
    noData: 'No data', noSetup: 'GrowSolar has no entities yet. Open Settings → Devices & services → GrowSolar → Configure.',
    kwhNote: 'Energy from the long-term statistics of the energy counters.', price: 'Price',
    perInv: 'Inverter', mppt: 'mppt', loading: 'Loading…',
    unzoom: 'Undo zoom', zoomHint: 'Drag across a chart to zoom all charts', csv: 'Download CSV', savMonth: 'Savings this month', savYear: 'Savings this year', savTotal: 'Total savings', since: 'since', byYear: 'By year', year: 'Year',
    settings: 'Settings', firmware: 'Firmware', invClock: 'Inverter clock', mpptTemp: 'MPPT temperature', fan: 'Fan',
    setting: 'Setting', allInv: 'All inverters', applyAll: 'Apply to all', edit: 'Change', cancel: 'Cancel', save: 'Save',
    confirmTitle: 'Change inverter settings?', confirmOk: 'Yes, change', confirmNote: 'The inverters are changed one after the other; each value is checked before the next one is sent.',
    differ: 'settings differ between the inverters', allSame: 'All inverters have the same settings.',
    waiting: 'waiting for the inverter…', confirmed: 'confirmed', notConfirmed: 'not confirmed', unavailable: 'not available',
    syncClock: 'Set the inverter clocks from Home Assistant', syncClockQ: 'Set the clock of every inverter to the current time?',
    readOnly: 'read only', noSettings: 'No setting entities were found. With Solar Assistant they come from its MQTT discovery; with DongleGrowatt from the Growatt-SPF6K-HA package (version 0.2 or newer), after ticking "Allow inverter settings changes" on each dongle. Reload GrowSolar after adding them.',
    bmsChgA: 'BMS charge current limit', bmsChgV: 'BMS charge voltage', bmsCodes: 'BMS status · error · warning',
    chargedToday: 'Charged today', dischargedToday: 'Discharged today', none: 'none', tempNote: 'Temperature: best 15–35 °C; charging only between 0 and 55 °C (BMS limits; EVE LF304 cells: charge −10…65 °C, discharge −35…65 °C).',
    adminOnly: 'Only administrators can change the settings.', log: 'Changes', locked: 'Shown only: changing it here could switch the output off or stop the BMS link.'
  },
  ro: {
    dashboard: 'Dashboard', charts: 'Grafice', totals: 'Totaluri', inverters: 'Invertoare', battery: 'Baterie',
    vMeters: 'Aparate', vFlow: 'Flux energetic', fSav: 'Economie totală', fMonth: 'Luna', fToday: 'Azi', fProduces: 'produce', fIdle: 'inactiv', fImport: 'import', fExport: 'export', fNoGrid: 'fără rețea', fHome: 'Consum casă', fCharging: 'se încarcă', fDischarging: 'se descarcă', fRest: 'repaus',
    inverter: 'Invertor', solar: 'Solar', grid: 'Rețea', load: 'Consum', mode: 'mod',
    today: 'Azi', peak: 'Vârf', present: 'prezentă', absent: 'absentă', perHour: '%/h', socRate: 'Ritm de încărcare',
    cellsTitle: 'Celule · PACE BMS', cHigh: 'Maximă', cLow: 'Minimă', cImb: 'Dezechilibru', cAvg: 'Medie', temps: 'Temperaturi',
    bmsState: 'Stare BMS', chgMos: 'MOS încărcare', dsgMos: 'MOS descărcare', noAlarms: 'Fără alarme', noProt: 'Fără protecții active',
    balancingN: 'echilibrare', bmsNoAnswer: 'BMS-ul nu răspunde', packV: 'Tensiune pachet', remFull: 'Capacitate rămasă / totală',
    lgNormal: 'normal', lgEdge: 'aproape de capăt', lgBad: 'sub 2,9 V / peste 3,6 V', lgHi: 'cea mai mare', lgLo: 'cea mai mică', lgBal: 'se echilibrează',
    lgScale: 'Scala barelor', lgZoom: 'mărită, ca diferențele să se vadă', t_cells_1: 'Celule 1–4', t_cells_2: 'Celule 5–8', t_cells_3: 'Celule 9–12',
    t_cells_4: 'Celule 13–16', t_mosfet: 'MOSFET', t_ambient: 'Mediu', bmsAddr: 'Adresă BMS · protocol',
    pvToday: 'Solar azi', yesterday: 'Ieri', generated: 'Produs', remaining: 'Rămas', tomorrow: 'Mâine',
    predicted: 'Prognoză', now: 'Acum', cloud: 'Nori', overview: 'Privire de ansamblu', last24: 'ultimele 24 de ore',
    batteryPower: 'Putere baterie', soc: 'Stare de încărcare', batteryVoltage: 'Tensiune baterie',
    mppt1v: 'Tensiune MPPT 1', mppt1a: 'Curent MPPT 1', mppt2v: 'Tensiune MPPT 2', mppt2a: 'Curent MPPT 2',
    mppt1w: 'Putere MPPT 1', mppt2w: 'Putere MPPT 2', pvPower: 'Putere solară', batteryCurrent: 'Curent baterie',
    batteryTemp: 'Temperatură baterie', acOutV: 'Tensiune ieșire AC', invTemp: 'Temperatură invertor',
    gridV: 'Tensiune rețea', gridHz: 'Frecvență rețea', loadPower: 'Putere consum', busV: 'Tensiune bus',
    total: 'Total', custom: 'Personalizat', from: 'De la', to: 'Până la', apply: 'Aplică',
    last30: 'Ultimele 30 de zile', last12: 'Ultimele 12 luni', batCharged: 'Încărcat în baterie', batDischarged: 'Descărcat din baterie',
    gridUsed: 'Din rețea', gridExported: 'Spre rețea', savings: 'Economii', day: 'Ziua', month: 'Luna',
    deviceMode: 'Mod de lucru', temperature: 'Temperatură', loadPct: 'Încărcare', loadVA: 'Putere aparentă',
    acOutHz: 'Frecvență ieșire AC', pvVoltage: 'Tensiune PV', pvCurrent: 'Curent PV', batPowerAC: 'Încărcare baterie din AC',
    gridPower: 'Putere rețea', serial: 'Serie', outPrio: 'Prioritate ieșire', chgPrio: 'Prioritate încărcare',
    capacity: 'Capacitate', soh: 'Stare de sănătate', power: 'Putere', current: 'Curent', voltage: 'Tensiune', cycles: 'Cicluri',
    cellV: 'Tensiune celule', highest: 'maximă', lowest: 'minimă', imbalance: 'dezechilibru', timeLeft: 'Timp rămas',
    toFull: 'până la plin', toEmpty: 'până la gol', charging: 'se încarcă', discharging: 'se descarcă', idle: 'repaus',
    noData: 'Fără date', noSetup: 'GrowSolar nu are încă entități. Deschide Setări → Dispozitive și servicii → GrowSolar → Configurează.',
    kwhNote: 'Energia vine din statisticile pe termen lung ale contoarelor de energie.', price: 'Preț',
    perInv: 'Invertor', mppt: 'mppt', loading: 'Se încarcă…',
    unzoom: 'Anulează zoom', zoomHint: 'Trage peste un grafic ca să mărești toate graficele', csv: 'Descarcă CSV', savMonth: 'Economii luna aceasta', savYear: 'Economii anul acesta', savTotal: 'Economii totale', since: 'din', byYear: 'Pe ani', year: 'Anul',
    settings: 'Setări', firmware: 'Firmware', invClock: 'Ceas invertor', mpptTemp: 'Temperatură MPPT', fan: 'Ventilator',
    setting: 'Setare', allInv: 'Toate invertoarele', applyAll: 'Aplică pe toate', edit: 'Schimbă', cancel: 'Renunță', save: 'Salvează',
    confirmTitle: 'Schimbi setările invertoarelor?', confirmOk: 'Da, schimbă', confirmNote: 'Invertoarele se schimbă pe rând; fiecare valoare e verificată înainte să o trimit pe următoarea.',
    differ: 'setări diferă între invertoare', allSame: 'Toate invertoarele au aceleași setări.',
    waiting: 'aștept invertorul…', confirmed: 'confirmat', notConfirmed: 'neconfirmat', unavailable: 'indisponibil',
    syncClock: 'Pune ora din Home Assistant pe invertoare', syncClockQ: 'Pun ora curentă pe ceasul fiecărui invertor?',
    readOnly: 'doar citire', noSettings: 'Nu am găsit entități de setare. Cu Solar Assistant vin din descoperirea lui MQTT; cu DongleGrowatt din pachetul Growatt-SPF6K-HA (versiunea 0.2 sau mai nouă), după ce bifezi „Allow inverter settings changes” pe fiecare dongle. Reîncarcă GrowSolar după ce le adaugi.',
    bmsChgA: 'Limită curent încărcare BMS', bmsChgV: 'Tensiune încărcare BMS', bmsCodes: 'BMS stare · eroare · avertizare',
    chargedToday: 'Încărcat azi', dischargedToday: 'Descărcat azi', none: 'niciuna', tempNote: 'Temperatură: ideal 15–35 °C; încărcare doar între 0 și 55 °C (limite BMS; celulele EVE LF304: încărcare −10…65 °C, descărcare −35…65 °C).',
    adminOnly: 'Doar administratorii pot schimba setările.', log: 'Modificări', locked: 'Doar afișat: schimbarea de aici ar putea opri ieșirea sau legătura cu BMS-ul.'
  }
};

/* labels of the inverter settings: name -> [en, ro] */
const SET_LABEL = {
  output_source_priority: ['Output source priority', 'Prioritate sursă ieșire'],
  charger_source_priority: ['Charger source priority', 'Prioritate sursă încărcare'],
  energy_priority: ['Energy priority (BLU / LBU)', 'Prioritate energie (BLU / LBU)'],
  max_charge_current: ['Max charge current', 'Curent maxim de încărcare'],
  max_grid_charge_current: ['Max grid charge current', 'Curent maxim din rețea'],
  max_generator_charge_current: ['Max generator charge current', 'Curent maxim din generator'],
  battery_absorption_charge_voltage: ['Absorption (bulk) voltage', 'Tensiune de absorbție (bulk)'],
  battery_float_charge_voltage: ['Float voltage', 'Tensiune float'],
  to_grid_battery_capacity: ['Switch to grid at SOC', 'Trecere pe rețea la SOC'],
  back_to_battery_capacity: ['Back to battery at SOC', 'Revenire pe baterie la SOC'],
  shutdown_battery_capacity: ['Battery cut-off at SOC', 'Oprire baterie la SOC'],
  to_grid_battery_voltage: ['Switch to grid at voltage', 'Trecere pe rețea la tensiunea'],
  back_to_battery_voltage: ['Back to battery at voltage', 'Revenire pe baterie la tensiunea'],
  shutdown_battery_voltage: ['Battery cut-off at voltage', 'Oprire baterie la tensiunea'],
  ac_input_range: ['AC input range', 'Interval intrare AC'],
  grid_output_start_hour: ['Grid output from (hour)', 'Ieșire din rețea de la (ora)'],
  grid_output_stop_hour: ['Grid output until (hour)', 'Ieșire din rețea până la (ora)'],
  grid_charge_start_hour: ['Grid charging from (hour)', 'Încărcare din rețea de la (ora)'],
  grid_charge_stop_hour: ['Grid charging until (hour)', 'Încărcare din rețea până la (ora)'],
  power_saving: ['Power saving', 'Economie de energie'],
  buzzer: ['Buzzer', 'Buzzer'],
  overload_restart: ['Overload restart (code)', 'Repornire la suprasarcină (cod)'],
  overtemperature_restart: ['Over-temperature restart (code)', 'Repornire la supratemperatură (cod)'],
  battery_type: ['Battery type', 'Tip baterie'],
  remote_switch: ['Remote switch', 'Pornire / oprire la distanță']
};

/* Growatt images for the DongleGrowatt source. They are not shipped with GrowSolar:
   put them in <config>/www/growsolar/ (served as /local/growsolar/); missing files are simply hidden */
const IMG_LOGO = '/local/growsolar/growatt-logo.png';
const IMG_INV = '/local/growsolar/growatt-inverter.png';
const img = (src, cls) => `<img class="${cls}" src="${src}" alt="" onerror="this.remove()">`;

const COL = { pv: '#ffb02e', load: '#4aa3ff', bat: '#35d07f', grid: '#b284ff', bad: '#ff5d6c', fc: '#ffd166', cloud: '#8fa0c8', v: '#5ad1e6' };
const WX_ICON = { sunny: 'mdi:weather-sunny', 'clear-night': 'mdi:weather-night', partlycloudy: 'mdi:weather-partly-cloudy', cloudy: 'mdi:weather-cloudy',
  rainy: 'mdi:weather-rainy', pouring: 'mdi:weather-pouring', fog: 'mdi:weather-fog', hail: 'mdi:weather-hail', lightning: 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy', windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant', exceptional: 'mdi:alert-circle-outline' };
const INV_COL = ['#ffb02e', '#4aa3ff', '#35d07f', '#b284ff', '#ff7aa8', '#5ad1e6'];

/* ------------------------------------------------------------------ helpers */
const isNum = (v) => typeof v === 'number' && isFinite(v);
const sum = (a) => { const f = a.filter(isNum); return f.length ? f.reduce((x, y) => x + y, 0) : NaN; };
const avg = (a) => { const f = a.filter(isNum); return f.length ? f.reduce((x, y) => x + y, 0) / f.length : NaN; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 86400e3;
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const toMs = (v) => (typeof v === 'number' ? (v > 1e11 ? v : v * 1000) : Date.parse(v));

function fmtNum(v, dec = 0) { return isNum(v) ? v.toFixed(dec) : '–'; }
function fmtW(v) {
  if (!isNum(v)) return '–';
  const a = Math.abs(v);
  return a >= 1000 ? (v / 1000).toFixed(a >= 10000 ? 1 : 2) + ' kW' : Math.round(v) + ' W';
}
/* round a scale end up to a "nice" number and pick a major tick step that divides it */
function niceMax(x) { const e = Math.pow(10, Math.floor(Math.log10(x))); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= x - 1e-9) return m * e; return 10 * e; }
function majorStep(max, lim) {
  for (const s of [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500]) { const n = max / s; if (n <= lim && Math.abs(n - Math.round(n)) < 1e-6) return s; }
  return max / 5;
}
function fmtKwh(v) { return isNum(v) ? (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)) + ' kWh' : '–'; }
function fmtDur(h) {
  if (!isNum(h) || h <= 0) return '–';
  if (h > 99) return '> 99 h';
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  return hh + ' h ' + String(mm).padStart(2, '0') + ' min';
}
function niceStep(range, ticks) {
  const raw = range / Math.max(1, ticks), p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p;
}
function shortNum(v, step) {
  if (step && step < 1) return v.toFixed(Math.min(3, Math.ceil(-Math.log10(step) - 1e-9)));
  const a = Math.abs(v);
  if (a >= 1000) return (v / 1000).toFixed(a >= 10000 ? 0 : 1) + 'k';
  if (a > 0 && a < 1) return v.toFixed(2);
  return String(Math.round(v * 10) / 10);
}

/* Put raw [t, v] points into n buckets: average inside a bucket, and an empty bucket keeps
   the LAST REAL VALUE (Home Assistant stores a state only when it changes). */
function bucketize(points, t0, t1, n) {
  const step = (t1 - t0) / n, s = new Array(n).fill(0), c = new Array(n).fill(0), last = new Array(n).fill(null);
  let before = null;
  for (const [t, v] of points) {
    if (!isNum(v)) continue;
    if (t < t0) { before = v; continue; }
    const i = Math.floor((t - t0) / step);
    if (i >= n) continue;
    s[i] += v; c[i]++; last[i] = v;
  }
  const out = new Array(n).fill(null), now = Date.now();
  let carry = before;
  for (let i = 0; i < n; i++) {
    if (t0 + i * step > now) break;
    if (c[i]) { out[i] = s[i] / c[i]; carry = last[i]; } else out[i] = carry;
  }
  return out;
}
function combine(arrays, how) {
  if (!arrays.length) return null;
  const n = arrays[0].length, out = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    const vals = arrays.map((a) => a[i]).filter((v) => v != null);
    if (!vals.length) continue;
    out[i] = how === 'avg' ? vals.reduce((a, b) => a + b, 0) / vals.length : vals.reduce((a, b) => a + b, 0);
  }
  return out;
}

/* ------------------------------------------------------------------ styles */
const CSS = `
:host{--bg1:#0b1530;--bg2:#13254f;--card:rgba(255,255,255,.045);--line:rgba(255,255,255,.09);--tx:#eef3ff;--mut:#97a6c8;
  --pv:${COL.pv};--load:${COL.load};--bat:${COL.bat};--grid:${COL.grid};--bad:${COL.bad};
  display:block;min-height:100vh;color:var(--tx);font-family:Inter,'Segoe UI',Roboto,system-ui,sans-serif;
  background:radial-gradient(1200px 700px at 70% -10%,#1c3a7a 0%,transparent 60%),linear-gradient(160deg,var(--bg1),var(--bg2));}
*{box-sizing:border-box}
.wrap{max-width:1500px;margin:0 auto;padding:14px 18px 40px}
header{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:14px}
.menu{background:none;border:0;color:var(--tx);cursor:pointer;padding:6px;display:none}
.menu svg{width:24px;height:24px}
h1{font-size:20px;margin:0;font-weight:650;display:flex;align-items:center;gap:10px;letter-spacing:.2px}
h1 i{width:10px;height:10px;border-radius:50%;background:var(--bat);box-shadow:0 0 0 4px rgba(53,208,127,.18)}
h1 i.off{background:var(--bad);box-shadow:0 0 0 4px rgba(255,93,108,.18)}
nav{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}
nav button,.seg button,.arrow{background:var(--card);border:1px solid var(--line);color:var(--mut);border-radius:10px;padding:7px 13px;font:inherit;font-size:14px;cursor:pointer}
nav button.on,.seg button.on{background:#2c4fa8;border-color:#4a6fd0;color:#fff}
.clock{color:var(--mut);font-variant-numeric:tabular-nums;font-size:14px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.grid2.wide{grid-template-columns:1.1fr 1fr}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;min-width:0}
.card h2{font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);margin:0 0 12px;display:flex;align-items:center;gap:8px}
.card h2 .sp{flex:1}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.tile{display:flex;gap:14px;align-items:center;background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:14px;padding:14px 16px;min-width:0}
.tile.link{cursor:pointer}.tile.link:hover{border-color:#4a6fd0}
.tile .ic{width:64px;height:64px;flex:none;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.04)}
.tile .ic svg{width:46px;height:46px}
.tile .tx{min-width:0;display:flex;flex-direction:column;gap:2px}
.tile b{display:block;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.tile span{display:block;color:var(--tx);font-size:16px;line-height:1.3;font-variant-numeric:tabular-nums}
.tile .big{font-size:27px;font-weight:700;line-height:1.15;letter-spacing:-.01em;white-space:nowrap}
.tile .sub{overflow-wrap:anywhere}
.tile .big small{font-size:15px;font-weight:500;color:var(--mut);margin-left:6px;letter-spacing:0}
.tile .big.txt{font-size:19px;font-weight:650;line-height:1.25;white-space:normal}
.tile .sub{color:var(--mut)}
.tile .red{color:var(--bad)}.tile .grn{color:var(--bat)}
.dots{display:flex;justify-content:center;gap:10px;margin-top:12px}
.dot{width:10px;height:10px;border-radius:50%;border:0;padding:0;background:rgba(255,255,255,.22);cursor:pointer;transition:background .2s,transform .2s}
.dot:hover{background:rgba(255,255,255,.45)}.dot.on{background:var(--tx);transform:scale(1.15)}
.dot:focus-visible{outline:2px solid var(--load);outline-offset:3px}
.flow>svg{display:block;width:100%;max-width:620px;height:auto;margin:14px auto 0}
.flow .fv{font-size:15px;font-weight:700;fill:var(--tx);font-variant-numeric:tabular-nums}
.flow .fl1{font-size:12px;fill:#c9d4ee}.flow .fl2{font-size:11px;fill:var(--mut)}
.flow .fbox{fill:#1c3170;stroke:#4a6fd0;stroke-width:1.5}
.flow .fbt{font-size:13px;font-weight:650;fill:#fff}.flow .fbs{font-size:11px;fill:#c9d4ee;font-variant-numeric:tabular-nums}
.flow .fpct{font-size:10px;font-weight:700;fill:#8ff0bb}
.flow .fsav rect{fill:rgba(53,208,127,.08);stroke:rgba(53,208,127,.45);stroke-width:1.2}
.flow .fsav line{stroke:rgba(255,255,255,.12)}
.flow .fsl{font-size:9.5px;letter-spacing:.12em;fill:#8ff0bb}.flow .fsb{font-size:20px;font-weight:700;fill:#fff;font-variant-numeric:tabular-nums}
.flow .fss{font-size:8.5px;letter-spacing:.1em;fill:var(--mut)}.flow .fsm{font-size:12px;font-weight:650;fill:#fff;font-variant-numeric:tabular-nums}
.fline{stroke:rgba(255,255,255,.18);stroke-width:2.2;stroke-dasharray:2 7;stroke-linecap:round}
.fline.on{animation:fdash .9s linear infinite}.fline.on.rev{animation-direction:reverse}
@keyframes fdash{to{stroke-dashoffset:-9}}
@media (prefers-reduced-motion:reduce){.fline.on{animation:none}}
.gauges{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:18px auto 0;max-width:560px}
.gauge{text-align:center;min-width:0}
.gauge svg{display:block;width:100%;max-width:250px;height:auto;margin:0 auto;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))}
.gauge .needle{transition:transform 1.1s cubic-bezier(.34,1.45,.5,1)}
@media (prefers-reduced-motion:reduce){.gauge .needle{transition:none}}
@media(max-width:600px){.gauges{gap:10px}}
.pvhead{display:grid;grid-template-columns:auto auto 1fr auto auto;gap:14px;align-items:center;margin-bottom:6px}
.pvhead .k{font-size:12px;color:var(--mut)}.pvhead .v{font-size:17px;font-weight:650}
.pvhead .dim .v{color:var(--mut);font-weight:500}
.bar{height:12px;border-radius:7px;background:rgba(255,255,255,.08);overflow:hidden}
.bar>i{display:block;height:100%;background:linear-gradient(90deg,#ffb02e,#ffd166);border-radius:7px}
.arrow{padding:4px 10px}
.chart{position:relative;width:100%}
.chart svg{display:block;width:100%;height:auto;overflow:visible}
.wxrow{position:absolute;top:2px;left:0;right:0;height:28px;pointer-events:none}
.wxrow ha-icon{position:absolute;transform:translateX(-50%);--mdc-icon-size:22px;color:#b9c6e6}
.tip{position:absolute;pointer-events:none;background:#0d1a3a;border:1px solid #33497e;border-radius:10px;padding:7px 10px;font-size:12px;white-space:nowrap;z-index:5;display:none;box-shadow:0 6px 20px rgba(0,0,0,.35)}
.tip div{display:flex;gap:8px;align-items:center}.tip i{width:9px;height:9px;border-radius:2px;display:inline-block}
.tip b{margin-left:auto;padding-left:12px;font-variant-numeric:tabular-nums}
.legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--mut);margin-top:8px}
.legend span{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none}
.legend span.off{opacity:.35}
.legend i{width:14px;height:4px;border-radius:2px;display:inline-block}
.legend i.d{background:repeating-linear-gradient(90deg,var(--c) 0 4px,transparent 4px 7px)!important}
.charts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.charts .full{grid-column:1/-1}
.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.seg{display:flex;gap:4px;flex-wrap:wrap}
.toolbar input{background:var(--card);border:1px solid var(--line);color:var(--tx);border-radius:9px;padding:6px 8px;font:inherit;font-size:13px;color-scheme:dark}
table{width:100%;border-collapse:collapse;color:inherit;font-variant-numeric:tabular-nums;font-size:14px}
th,td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child{text-align:left}
th{color:var(--mut);font-weight:600;font-size:13px}
tr.gap td{border:0;padding:6px 0}
td small{color:var(--mut);margin-left:6px;font-size:11px;background:rgba(255,209,102,.12);border-radius:6px;padding:1px 6px}
.scroll{overflow-x:auto}
.kv{display:grid;grid-template-columns:auto 1fr;gap:10px 22px;font-size:15px}
.kv span:nth-child(odd){color:var(--mut)}
.kv span:nth-child(even){font-variant-numeric:tabular-nums}
.totwrap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:16px;align-items:start}
.tscroll{max-height:345px;overflow:auto;border-left:1px solid var(--line);padding-left:8px}
.tscroll table th{position:sticky;top:0;background:#16295a;z-index:1;white-space:normal;line-height:1.25;vertical-align:bottom}
.tscroll th,.tscroll td{padding:7px 7px;font-size:13px}
.tscroll th small{display:block;margin:2px 0 0;background:none;padding:0;font-weight:400;color:var(--mut)}
.tscroll td.sv{color:#8ff0bb}
.arrow.dl{display:inline-flex;align-items:center;padding:4px 8px}
header{position:relative}
header .brand{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none}
@media (max-width:1250px){header .brand{position:static;transform:none;flex:1;display:flex;justify-content:center}}
.blogo{height:24px;width:auto;display:block}
.toolbar .tlogo{margin-left:auto}
tr.ihead th{vertical-align:bottom}
.invimg{display:block;height:92px;width:auto;margin:0 0 6px auto}
@media (max-width:760px){header .brand,.toolbar .tlogo{display:none}.invimg{height:56px}}
.zsel{fill:rgba(74,163,255,.18);stroke:#4aa3ff;stroke-width:1;pointer-events:none}
.chart .hit{cursor:crosshair;touch-action:pan-y}
.toolbar .hint{color:var(--mut);font-size:12px;opacity:.8}
@media (max-width:700px){.toolbar .hint{display:none}}
.sav{font-size:13px;letter-spacing:0;text-transform:none;color:var(--mut);background:rgba(53,208,127,.1);border:1px solid rgba(53,208,127,.25);border-radius:10px;padding:4px 10px;white-space:nowrap}
.sav:empty{display:none}.sav b{color:#8ff0bb;font-size:15px;margin-left:4px}.sav small{margin-left:6px;font-size:11px}
@media (max-width:900px){.totwrap{grid-template-columns:1fr}.tscroll{border-left:0;padding-left:0;max-height:none}}
.note{color:var(--mut);font-size:13px;margin:10px 0 0;line-height:1.45}
table.sets td.sv.click{cursor:pointer}table.sets td.sv.click:hover{background:rgba(74,111,208,.15)}
table.sets tr.diff td.sv{color:#ffb02e}
table.sets td.all{background:rgba(255,255,255,.025)}
.pend{font-size:12px;color:#ffd166}
.ed{display:inline-flex;gap:6px;align-items:center}
.ed .ctl{background:#0d1a3a;border:1px solid #33497e;color:var(--tx);border-radius:8px;padding:5px 7px;font:inherit;font-size:13px;max-width:210px;color-scheme:dark}
.ed input.ctl{width:84px}.ed .u{color:var(--mut);font-size:12px}
.btn{background:#2c4fa8;border:1px solid #4a6fd0;color:#fff;border-radius:9px;padding:7px 13px;font:inherit;font-size:14px;cursor:pointer}
.btn.sm{padding:4px 9px;font-size:13px}.btn.ghost{background:var(--card);border-color:var(--line);color:var(--mut)}
.slog div{display:grid;grid-template-columns:80px 40px 1fr auto;gap:10px;padding:6px 0;border-bottom:1px solid var(--line);font-size:13px}
.slog .ok b{color:var(--bat)}.slog .bad b{color:var(--bad)}.slog .wait b{color:#ffd166}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:grid;place-items:center;z-index:20}
.modal[hidden]{display:none}
.dlg{background:#13254f;border:1px solid #33497e;border-radius:16px;padding:18px 20px;max-width:460px;width:calc(100% - 32px)}
.dlg h3{margin:0 0 10px;font-size:17px}.dlg ul{padding-left:18px;margin:8px 0}.dlg li{margin:4px 0}
.dlg .row{display:flex;gap:10px;justify-content:flex-end;margin-top:14px}
.bstats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.bst{background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:12px;padding:10px 12px;min-width:0}
.bst b{display:block;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.bst span{display:block;font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;margin-top:2px;white-space:nowrap}
.bst small{font-size:13px;color:var(--mut);font-weight:500;margin-left:4px}
.cells{display:grid;grid-template-columns:repeat(16,1fr);gap:6px;align-items:end}
.cell{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}
.cell .bar{position:relative;width:100%;height:150px;background:rgba(255,255,255,.06);border-radius:7px;overflow:hidden}
.cell .bar i{position:absolute;left:0;right:0;bottom:0;border-radius:7px 7px 0 0}
.cell.hi .bar{outline:2px solid var(--load);outline-offset:-2px}.cell.lo .bar{outline:2px solid var(--pv);outline-offset:-2px}
.cell .v{font-size:12.5px;font-weight:650;font-variant-numeric:tabular-nums}.cell .n{font-size:11.5px;color:var(--mut)}
.cell .bl{font-size:10px;color:var(--grid);font-weight:700;height:12px;letter-spacing:.04em}
.blegend{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:13px;color:var(--mut)}
.blegend i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:6px}
.btemps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.chip{display:flex;align-items:center;gap:7px;padding:7px 12px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid var(--line);font-size:14px}
.chip i{width:9px;height:9px;border-radius:50%;background:var(--bat)}.chip.off i{background:var(--bad)}.chip.mut{color:var(--mut)}.chip.mut i{background:#5d6a8a}
.chip.warn{color:#ffd08a}.chip.warn i{background:var(--pv)}.chip.bad{color:#ffb3bb}.chip.bad i{background:var(--bad)}
@media(max-width:900px){.cells{grid-template-columns:repeat(8,1fr)}.cell .bar{height:110px}.bstats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:420px){.btemps{grid-template-columns:repeat(2,1fr)}.bst span{font-size:20px}}
.hb{display:grid;grid-template-columns:130px 1fr 80px;gap:10px;align-items:center;margin:14px 0}
.hb .t{height:18px;border-radius:9px;background:rgba(255,255,255,.07);position:relative;overflow:hidden}
.hb .t i{position:absolute;top:0;bottom:0;border-radius:9px}
.hb .t .z{position:absolute;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.35)}
.hb span{color:var(--mut);font-size:14px}.hb b{font-variant-numeric:tabular-nums;font-size:14px;text-align:right}
.note{color:var(--mut);font-size:12px;margin-top:10px}
.empty{color:var(--mut);text-align:center;padding:40px 0}
.pill{font-size:12px;border-radius:999px;padding:3px 10px;background:rgba(53,208,127,.14);color:#8ff0bb}
.pill.o{background:rgba(255,176,46,.14);color:#ffd08a}.pill.r{background:rgba(255,93,108,.14);color:#ffb3bb}
footer{color:var(--mut);font-size:12px;text-align:center;margin-top:24px}
@media(max-width:1000px){.grid2,.grid2.wide,.charts{grid-template-columns:1fr}.pvhead{grid-template-columns:1fr 1fr}.pvhead .bar{grid-column:1/-1;order:5}}
@media(max-width:400px){.tiles{grid-template-columns:1fr}}
@media(max-width:600px){.wrap{padding:10px 10px 30px}.tile{padding:10px 12px;gap:10px}.tile .ic{width:44px;height:44px;border-radius:11px}.tile .ic svg{width:32px;height:32px}.tile .big{font-size:22px}.tile .big.txt{font-size:16px}.tile span{font-size:14px}.tile .big small{font-size:13px;margin-left:4px}.menu{display:block}nav{margin-left:0;width:100%}
  .tile .ic{width:46px;height:46px}.tile .ic svg{width:32px;height:32px}.hb{grid-template-columns:96px 1fr 70px}}
`;

/* ------------------------------------------------------------------ icons (own drawings) */
const ICON = {
  inverter: `<svg viewBox="0 0 48 48" fill="none" stroke="#cfe0ff" stroke-width="2.2" stroke-linejoin="round"><rect x="10" y="5" width="28" height="38" rx="4"/><rect x="16" y="23" width="16" height="7" rx="2" fill="#35d07f" stroke="#35d07f"/><path d="M17 36h14M17 12h6" stroke-linecap="round"/><circle cx="31" cy="12" r="2" fill="#cfe0ff" stroke="none"/></svg>`,
  sun: `<svg viewBox="0 0 48 48" fill="none" stroke="#ffb02e" stroke-width="2.4" stroke-linecap="round"><circle cx="24" cy="24" r="8" fill="#ffb02e"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/></svg>`,
  cloudSun: `<svg viewBox="0 0 48 48" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="19" cy="17" r="6" fill="#ffb02e" stroke="#ffb02e"/><path d="M19 4v3M8 17H5M10 8l2 2M28 8l-2 2" stroke="#ffb02e"/><path d="M15 38h20a7 7 0 0 0 0-14 10 10 0 0 0-19 3 6 6 0 0 0-1 11z" fill="#20345f" stroke="#9fb3dd"/></svg>`,
  plug: `<svg viewBox="0 0 48 48" fill="none" stroke="#b284ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6v9M30 6v9M13 15h22v7a11 11 0 0 1-22 0z"/><path d="M24 33v9"/></svg>`,
  plugOff: `<svg viewBox="0 0 48 48" fill="none" stroke="#97a6c8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6v9M30 6v9M13 15h22v7a11 11 0 0 1-22 0z"/><path d="M24 33v9M8 8l32 32" stroke="#ff5d6c"/></svg>`,
  battery: (soc) => { const h = Math.max(0, Math.min(100, isNum(soc) ? soc : 0)) / 100 * 27, c = soc < 20 ? '#ff5d6c' : soc < 40 ? '#ffb02e' : '#35d07f';
    return `<svg viewBox="0 0 48 48" fill="none" stroke="#cfe0ff" stroke-width="2.2" stroke-linejoin="round"><rect x="13" y="8" width="22" height="34" rx="4"/><rect x="19" y="4" width="10" height="4" rx="1" fill="#cfe0ff"/><rect x="16" y="${39 - h}" width="16" height="${h}" rx="2" fill="${c}" stroke="none"/></svg>`; }
};

/* ------------------------------------------------------------------ panel */
class GrowSolarPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._tab = 'dashboard';
    this._range = '24h';
    this._rangeEnd = 0;            // 0 = now
    this._pvDay = 0;               // 0 = today, -1 = yesterday ...
    this._dOff = 0; this._mOff = 0; // totals paging
    this._hidden = {};
    this._cache = {};
    this._ro = new ResizeObserver(() => { clearTimeout(this._rt); this._rt = setTimeout(() => this._redrawAll(), 150); });
  }

  set panel(p) { this._cfg = p.config || {}; this._map = this._cfg.map || { inverters: [], system: {}, energy: {} }; }
  set narrow(n) { this._narrow = n; }
  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (first) { this._build(); this._show(this._tab); }
    const now = Date.now();
    if (now - (this._lastLive || 0) > 1500) { this._lastLive = now; this._live(); }
  }
  connectedCallback() {
    this._timer = setInterval(() => this._tick(), 1000);
    this._ro.observe(this);
  }
  disconnectedCallback() { clearInterval(this._timer); this._ro.disconnect(); }

  /* ---------- small accessors */
  t(k) { const l = ((this._hass && (this._hass.locale?.language || this._hass.language)) || 'en').slice(0, 2); return (STR[l] || STR.en)[k] ?? STR.en[k] ?? k; }
  get lang() { return ((this._hass && (this._hass.locale?.language || this._hass.language)) || 'en').startsWith('ro') ? 'ro-RO' : undefined; }
  num(id) { if (!id || !this._hass) return NaN; const s = this._hass.states[id]; if (!s) return NaN; const v = parseFloat(s.state); return isFinite(v) ? v : NaN; }
  txt(id) { if (!id || !this._hass) return null; const s = this._hass.states[id]; return s && s.state !== 'unknown' && s.state !== 'unavailable' ? s.state : null; }
  get invs() { return this._map.inverters || []; }
  get isDongle() { return this._map.source === 'donglegrowatt'; }
  invName(n) { return (this._map.names || [])[n] || `#${n + 1}`; }
  get sys() { return this._map.system || {}; }
  get en() { return this._map.energy || {}; }
  $(s) { return this.shadowRoot.querySelector(s); }

  /* ---------- entity specs for system values: [ids, how] */
  spec(key) {
    const s = this.sys, inv = this.invs;
    const pick = (k) => inv.map((i) => i[k]).filter(Boolean);
    switch (key) {
      case 'pv': return s.pv ? [[s.pv], 'sum'] : [inv.flatMap((i) => (i.pv ? [i.pv] : [i.pv1, i.pv2])).filter(Boolean), 'sum'];
      case 'load': return s.load ? [[s.load], 'sum'] : [pick('load'), 'sum'];
      case 'bat': return s.bat_w ? [[s.bat_w], 'sum'] : [pick('bat_w'), 'sum'];
      case 'grid': return s.grid_w ? [[s.grid_w], 'sum'] : [pick('grid_w'), 'sum'];
      case 'soc': return s.soc ? [[s.soc], 'avg'] : [pick('soc'), 'avg'];
      case 'batv': return s.bat_v ? [[s.bat_v], 'avg'] : [pick('bat_v'), 'avg'];
      case 'bata': return s.bat_a ? [[s.bat_a], 'sum'] : [pick('bat_a'), 'sum'];
      case 'gridv': return s.grid_v ? [[s.grid_v], 'avg'] : [pick('grid_v'), 'avg'];
      case 'busv': return s.bus_v ? [[s.bus_v], 'avg'] : [pick('bus_v'), 'avg'];
      case 'fc': return s.fc_w ? [[s.fc_w], 'sum'] : [[], 'sum'];
      case 'cloud': return s.cloud ? [[s.cloud], 'avg'] : [[], 'avg'];
      default: return [[], 'sum'];
    }
  }
  /* -1 when the user's sensor has the opposite sign (manual source) */
  keySign(key) {
    const o = this._map.options || {};
    if ((key === 'bat' || key === 'bata') && o.invert_bat && (this.sys.bat_w || this.sys.bat_a)) return -1;
    if (key === 'grid' && o.invert_grid && this.sys.grid_w) return -1;
    return 1;
  }
  liveVal(key) { const [ids, how] = this.spec(key); const v = ids.map((i) => this.num(i)); return (how === 'avg' ? avg(v) : sum(v)) * this.keySign(key); }
  invBatW(i) { // + charging
    if (i.bat_w) return this.num(i.bat_w);
    const v = this.num(i.bat_v), a = this.num(i.bat_a);
    return isNum(v) && isNum(a) ? v * a : NaN;
  }
  invPv(i) { return i.pv ? this.num(i.pv) : sum([this.num(i.pv1), this.num(i.pv2)]); }

  /* ---------- build */
  _build() {
    const tabs = ['dashboard', 'charts', 'totals', 'inverters', 'battery', 'settings'];
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="wrap">
      <header>
        <button class="menu" title="Menu"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg></button>
        <h1><i id="dot"></i><span id="ttl"></span></h1>
        <span class="brand" id="brand"></span>
        <nav>${tabs.map((k) => `<button data-tab="${k}">${this.t(k)}</button>`).join('')}</nav>
        <span class="clock" id="clock"></span>
      </header>
      <main id="main"></main>
      <footer>GrowSolar ${VERSION} · Barbu Dan-Cristian</footer>
    </div>`;
    this.$('#ttl').textContent = this._cfg.title || 'GrowSolar';
    this.shadowRoot.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => this._show(b.dataset.tab)));
    this.$('.menu').addEventListener('click', () => this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true })));
  }

  _show(tab) {
    this._tab = tab;
    const br = this.$('#brand');
    if (br) br.innerHTML = this.isDongle && (tab === 'dashboard' || tab === 'totals') ? img(IMG_LOGO, 'blogo') : '';
    this._charts = [];
    this.shadowRoot.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    const m = this.$('#main');
    if (!this.invs.length && !this.sys.pv && !this.sys.load) { m.innerHTML = `<div class="card empty">${this.t('noSetup')}</div>`; return; }
    if (tab === 'dashboard') this._dashboard(m);
    else if (tab === 'charts') this._chartsView(m);
    else if (tab === 'totals') this._totals(m);
    else if (tab === 'inverters') this._inverters(m);
    else if (tab === 'settings') this._settings(m);
    else this._battery(m);
    this._live();
  }

  _tick() {
    const c = this.$('#clock');
    if (c) c.textContent = new Date().toLocaleTimeString(this.lang, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const now = Date.now();
    if ((this._tab === 'dashboard' || (this._tab === 'charts' && !this._rangeEnd)) && now - (this._lastLoad || 0) > 60000) this._reload();
  }
  _reload() {
    this._lastLoad = Date.now();
    if (this._tab === 'dashboard') { this._loadPvDay(); this._loadOverview(); this._loadSocRate(); }
    else if (this._tab === 'charts') this._loadCharts();
  }

  /* ================================================================= data */
  async ws(msg) { return this._hass.callWS(msg); }
  /* the same request already on its way is not sent twice; a result can be kept for ttl ms */
  wsMemo(msg, ttl = 0) {
    const k = JSON.stringify(msg), now = Date.now(), c = STORE.memo.get(k);
    if (c && (c.p || now - c.t < ttl)) return c.p || Promise.resolve(c.v);
    const p = this.ws(msg).then((v) => { STORE.memo.set(k, { t: Date.now(), v }); return v; },
      (e) => { STORE.memo.delete(k); throw e; });
    STORE.memo.set(k, { t: now, p });
    if (STORE.memo.size > 200) for (const [key, v] of STORE.memo) { if (!v.p && Date.now() - v.t > 3600e3) STORE.memo.delete(key); }
    return p;
  }

  /* {id: [[t, v], ...]} for a time window.
     Fast path: the recorder's 5-minute statistics (288 rows per day instead of thousands of raw
     states), completed with the raw states after the last compiled 5 minutes. Raw history only for
     short windows (<= 2 h) and for entities without statistics. Everything is cached for the whole
     page (across panel switches) and later calls only fetch what is new. */
  async history(ids, t0, t1) {
    ids = [...new Set(ids.filter(Boolean))];
    if (!ids.length) return {};
    const now = Date.now();
    if (t1 - t0 > 3 * DAY) {
      const r = await this.wsMemo({ type: 'recorder/statistics_during_period', start_time: new Date(t0).toISOString(), end_time: new Date(t1).toISOString(),
        statistic_ids: ids, period: t1 - t0 > 20 * DAY ? 'hour' : '5minute', types: ['mean'] }, t1 < now - 3600e3 ? 6 * 3600e3 : 5 * 60e3);
      const out = {};
      for (const id of ids) out[id] = (r[id] || []).map((x) => [toMs(x.start), x.mean]);
      return out;
    }
    if (t1 - t0 <= 2 * 3600e3 || t0 < now - 9.5 * DAY) return this.rawHistory(ids, t0, t1);
    const st = await this.stats5(ids, t0, t1), out = {}, tail = {}, raw = [];
    for (const id of ids) {
      const c = st[id];
      if (!c || !c.pts.length) { raw.push(id); continue; }
      if (c.end < t1) (tail[c.end] = tail[c.end] || []).push(id);
    }
    const parts = await Promise.all([
      raw.length ? this.rawHistory(raw, t0, t1) : {},
      ...Object.entries(tail).map(([from, list]) => this.rawHistory(list, Math.max(t0, +from), t1))
    ]);
    for (const id of ids) {
      const c = st[id];
      if (!c || !c.pts.length) { out[id] = parts[0][id] || []; continue; }
      const pts = c.pts.filter((p) => p[0] < t1);
      const more = parts.slice(1).map((h) => h[id]).find(Boolean) || [];
      out[id] = pts.concat(more.filter((p) => p[0] >= c.end));
    }
    return out;
  }
  /* 5-minute means, cached per entity; only the new 5-minute blocks are asked for */
  async stats5(ids, t0, t1) {
    const now = Date.now(), groups = {}, out = {};
    for (const id of ids) {
      const c = STORE.stats.get(id);
      if (c && c.none && now - c.t < 3600e3) { out[id] = c; continue; }          // no statistics for it
      if (c && !c.none && c.from <= t0) {
        out[id] = c;
        if (c.end < Math.min(t1, now - 330e3) && now - c.t > 45e3) (groups[c.end] = groups[c.end] || []).push(id);
      } else (groups['f' + t0] = groups['f' + t0] || []).push(id);
    }
    await Promise.all(Object.entries(groups).map(async ([k, list]) => {
      const fresh = k[0] === 'f', from = fresh ? t0 : +k;
      const r = await this.wsMemo({ type: 'recorder/statistics_during_period', start_time: new Date(from).toISOString(),
        end_time: new Date(Math.max(t1, now)).toISOString(), statistic_ids: list, period: '5minute', types: ['mean'] });
      for (const id of list) {
        const rows = (r[id] || []).filter((x) => isNum(x.mean)).map((x) => [toMs(x.start), x.mean]);
        const old = fresh ? null : STORE.stats.get(id);
        if (!old && !rows.length) { const c = { none: true, t: Date.now(), pts: [] }; STORE.stats.set(id, c); out[id] = c; continue; }
        const pts = old ? old.pts.concat(rows.filter((p) => p[0] + 150e3 >= old.end).map((p) => [p[0] + 150e3, p[1]])) : rows.map((p) => [p[0] + 150e3, p[1]]);
        const end = rows.length ? rows[rows.length - 1][0] + 300e3 : (old ? old.end : from);
        const c = { from: old ? old.from : from, end, pts, t: Date.now() };
        // two windows loaded at the same time: keep the one that reaches further back
        const cur = STORE.stats.get(id);
        if (fresh && cur && !cur.none && cur.from < c.from && cur.end >= c.end - 300e3) { out[id] = cur; continue; }
        STORE.stats.set(id, c); out[id] = c;
      }
    }));
    return out;
  }
  /* raw states, cached per entity; a later call for the same window only fetches the new states */
  async rawHistory(ids, t0, t1) {
    const now = Date.now(), groups = {}, out = {};
    for (const id of ids) {
      const c = STORE.raw.get(id);
      if (c && c.from <= t0 && c.to >= t0) { if (t1 > c.to + 1000 && !(t1 >= now - 1000 && now - c.t < 3000)) (groups[c.to] = groups[c.to] || []).push(id); }
      else (groups['f' + t0] = groups['f' + t0] || []).push(id);
    }
    await Promise.all(Object.entries(groups).map(async ([k, list]) => {
      const fresh = k[0] === 'f', from = fresh ? t0 : +k, to = Math.min(t1, Date.now());
      const r = await this.wsMemo({ type: 'history/history_during_period', start_time: new Date(from).toISOString(), end_time: new Date(to).toISOString(),
        entity_ids: list, minimal_response: true, no_attributes: true, significant_changes_only: false });
      for (const id of list) {
        const rows = (r[id] || []).map((x) => [((x.lu ?? x.lc) || 0) * 1000, parseFloat(x.s)]);
        const old = fresh ? null : STORE.raw.get(id);
        const c = old ? { from: old.from, to, pts: old.pts.concat(rows.filter((p) => p[0] > old.to)), t: Date.now() } : { from, to, pts: rows, t: Date.now() };
        const cur = STORE.raw.get(id);
        if (fresh && cur && cur.from < c.from && cur.to >= c.to - 5000) continue;
        STORE.raw.set(id, c);
      }
    }));
    for (const id of ids) {
      const c = STORE.raw.get(id); if (!c) { out[id] = []; continue; }
      let i = 0; while (i < c.pts.length && c.pts[i][0] < t0) i++;
      out[id] = c.pts.slice(Math.max(0, i - 1)).filter((p) => p[0] <= t1);
    }
    return out;
  }
  /* daily or monthly change of the energy counters (kWh): {start_ms: {pv, load, ...}} */
  /* moment of the switch from Solar Assistant to the dongles (ms), or 0 */
  get histUntil() {
    const h = this._map.history_until;
    // Safari cannot parse microseconds ("...:53.809769+00:00"): keep milliseconds
    const t = h ? Date.parse(String(h).replace(/(\.\d{3})\d+/, '$1')) : 0;
    return isNum(t) ? t : 0;
  }
  async energyStats(t0, t1, period) {
    const en = this.en, keys = Object.keys(en).filter((k) => en[k] && en[k].length);
    // before the switch the energy comes from Solar Assistant's counters
    const hu = this.histUntil, eh = hu && t0 < hu ? (this._map.energy_history || {}) : {};
    const hkeys = Object.keys(eh).filter((k) => eh[k] && eh[k].length);
    const ids = [...new Set([...keys.flatMap((k) => en[k]), ...hkeys.flatMap((k) => eh[k])])];
    if (!ids.length) return {};
    // closed periods do not change any more: keep them for an hour; the current one for 5 minutes
    const r = await this.wsMemo({ type: 'recorder/statistics_during_period', start_time: new Date(t0).toISOString(), end_time: new Date(t1).toISOString(),
      statistic_ids: ids, period, types: ['change'], units: { energy: 'kWh' } }, t1 <= startOfDay(Date.now()) ? 3600e3 : 5 * 60e3);
    const out = {};
    const add = (k, id, keep) => { for (const row of r[id] || []) {
      const t = toMs(row.start);
      if (!keep(t)) continue;
      const o = (out[t] = out[t] || {});
      // a negative change is not energy: the statistic's sum was restarted (for example after
      // the sensor was excluded from the recorder for a while), so that period is unknown
      if (isNum(row.change) && row.change >= 0) o[k] = (o[k] || 0) + row.change;
    } };
    for (const k of keys) for (const id of en[k]) add(k, id, () => true);
    // Solar Assistant rows that start before the switch; the dongles' counters start at the switch
    for (const k of hkeys) for (const id of eh[k]) add(k, id, (t) => t < hu);
    return out;
  }
  /* energy of one key between two times, from the counters' history (works for both
     cumulative counters and counters that reset at midnight) */
  async energyBetween(key, t0, t1) {
    const ids = this.en[key] || [];
    if (!ids.length) return NaN;
    const h = await this.history(ids, t0, Math.min(t1, Date.now()));
    let total = 0, any = false;
    for (const id of ids) {
      const pts = (h[id] || []).filter((p) => isNum(p[1]));
      if (!pts.length) continue;
      // add every increase; a drop is a counter reset (daily counters reset at midnight),
      // after which the new value itself is energy of the new period
      let e = 0, prev = pts[0][1];
      for (let i = 1; i < pts.length; i++) { const v = pts[i][1]; e += v >= prev ? v - prev : (this._map.energy_daily_reset ? v : 0); prev = v; }
      total += e; any = true;
    }
    return any ? total : NaN;
  }
  /* energy since midnight: counters that reset daily already hold it; cumulative ones need history */
  async energyToday(key) {
    const ids = this.en[key] || [];
    if (!ids.length) return NaN;
    if (this._map.energy_daily_reset) return sum(ids.map((id) => this.num(id)));
    const d0 = startOfDay(Date.now()), hu = this.histUntil;
    let e = await this.energyBetween(key, Math.max(d0, hu || 0), Date.now());
    // switched from Solar Assistant today: add what its counters recorded before the switch
    if (hu > d0 && (this._map.energy_history || {})[key]) {
      try { const st = await this.energyStats(d0, hu, 'hour'); const h = sum(Object.entries(st).filter(([t]) => +t < hu).map(([, o]) => o[key])); if (isNum(h)) e = (isNum(e) ? e : 0) + h; } catch (x) { /* ignore */ }
    }
    return e;
  }
  /* energy of one past day, from history, falling back to the daily statistics */
  async energyDay(key, day0) {
    // the daily statistics are complete even where the detailed history is missing
    try { const st = await this.energyStats(day0, day0 + DAY, 'day'); const row = st[day0] || this._near(st, day0); if (row && isNum(row[key])) return row[key]; } catch (e) { /* ignore */ }
    try { return await this.energyBetween(key, day0, day0 + DAY); } catch (e) { return NaN; }
  }
  /* hourly weather forecast: [{t, cloud, cond}] from the weather entity chosen in the setup,
     or the first weather entity in Home Assistant */
  async weatherForecast() {
    if (this._wxCache && Date.now() - this._wxCache.t < 30 * 60e3) return this._wxCache.v;
    let v = null;
    const id = this.sys.weather || Object.keys(this._hass.states).find((e) => e.startsWith('weather.'));
    const st = id ? this._hass.states[id] : null;
    // not loaded yet (Home Assistant starting): ask again on the next refresh instead of logging an error
    if (!st || st.state === 'unavailable' || st.state === 'unknown') return null;
    if (id) {
      try {
        const r = await this.ws({ type: 'call_service', domain: 'weather', service: 'get_forecasts', service_data: { type: 'hourly' }, target: { entity_id: id }, return_response: true });
        const f = (((r && r.response) || {})[id] || {}).forecast || [];
        v = f.map((x) => ({ t: Date.parse(x.datetime), cloud: x.cloud_coverage, cond: x.condition })).filter((x) => isFinite(x.t));
      } catch (e) { v = null; }
    }
    this._wxCache = { t: Date.now(), v };
    return v;
  }
  async solarForecast() {
    if (this._fcCache && Date.now() - this._fcCache.t < 15 * 60e3) return this._fcCache.v;
    let v = null;
    try {
      const r = await this.ws({ type: 'energy/solar_forecast' });
      const wh = {};
      for (const e of Object.values(r || {})) for (const [k, w] of Object.entries(e.wh_hours || {})) wh[k] = (wh[k] || 0) + w;
      const pts = Object.entries(wh).map(([k, w]) => [Date.parse(k), w]).sort((a, b) => a[0] - b[0]);
      // interval of the forecast (Solcast: 30 min, Forecast.Solar: 1 h)
      let iv = 3600e3; for (let i = 1; i < pts.length; i++) { const d = pts[i][0] - pts[i - 1][0]; if (d > 0) { iv = Math.min(iv, d); } }
      v = pts.length ? pts.map(([t, w]) => [t, w, iv]) : null;
    } catch (e) { v = null; }
    this._fcCache = { t: Date.now(), v };
    return v;
  }

  /* ================================================================= charts */
  /* cfg: {t0, t1, n, series:[{name,color,data,dash,fill,right}], unit, unitR, signed, height} */
  chart(host, cfg) {
    host.classList.add('chart');
    host._cfg = cfg;
    if (!this._charts.includes(host)) this._charts.push(host);
    this._draw(host);
  }
  _draw(host) {
    const cfg = host._cfg, W = Math.max(280, host.clientWidth || 600), H = cfg.height || (W < 500 ? 190 : 230);
    const m = { l: 46, r: cfg.unitR ? 44 : 14, t: cfg.icons && cfg.icons.length ? 36 : 10, b: 26 };
    const vis = cfg.series.filter((s) => !this._hidden[cfg.id + s.name] && s.data);
    const left = vis.filter((s) => !s.right), right = vis.filter((s) => s.right);
    const range = (list, zero) => {
      let lo = Infinity, hi = -Infinity;
      for (const s of list) for (const v of s.data) if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      if (!isFinite(lo)) { lo = 0; hi = 1; }
      if (zero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
      if (hi - lo < 1e-9) { hi += 1; lo -= zero ? 0 : 1; }
      const st = niceStep(hi - lo, 4);
      return [Math.floor(lo / st) * st, Math.ceil(hi / st) * st, st];
    };
    const [lo, hi, st] = range(left, cfg.zero !== false);
    const [rlo, rhi, rst] = right.length ? (cfg.rightRange || range(right, true)) : [0, 1, 1];
    const X = (i) => m.l + (W - m.l - m.r) * i / (cfg.n - 1);
    const XT = (t) => m.l + (W - m.l - m.r) * (t - cfg.t0) / (cfg.t1 - cfg.t0);
    const Y = (v) => m.t + (H - m.t - m.b) * (1 - (v - lo) / (hi - lo));
    const YR = (v) => m.t + (H - m.t - m.b) * (1 - (v - rlo) / (rhi - rlo));
    let o = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    if (cfg.signed && lo < 0) {
      o += `<rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${Y(0) - m.t}" fill="rgba(53,208,127,.07)"/>`;
      o += `<rect x="${m.l}" y="${Y(0)}" width="${W - m.l - m.r}" height="${H - m.b - Y(0)}" fill="rgba(255,93,108,.07)"/>`;
    }
    for (let v = lo; v <= hi + st / 2; v += st) {
      o += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#fff" stroke-opacity="${Math.abs(v) < st / 1e6 ? .25 : .07}"/>`;
      o += `<text x="${m.l - 6}" y="${Y(v) + 4}" text-anchor="end" fill="#8fa0c8" font-size="11">${shortNum(v, st)}</text>`;
    }
    if (right.length) for (let v = rlo; v <= rhi + rst / 2; v += rst) o += `<text x="${W - m.r + 6}" y="${YR(v) + 4}" fill="#8fa0c8" font-size="11">${shortNum(v, rst)}</text>`;
    // x ticks
    const span = cfg.t1 - cfg.t0, hour = 3600e3;
    const steps = [5 * 60e3, 15 * 60e3, 30 * 60e3, hour, 2 * hour, 3 * hour, 6 * hour, 12 * hour, DAY, 2 * DAY, 7 * DAY];
    const xs = steps.find((s) => span / s <= (W < 500 ? 5 : 9)) || 7 * DAY;
    const tz = new Date(cfg.t0).getTimezoneOffset() * 60e3;
    let first = Math.ceil((cfg.t0 - tz) / xs) * xs + tz;
    if (xs >= DAY) first = startOfDay(cfg.t0 + DAY - 1);
    for (let t = first; t <= cfg.t1; t += xs) {
      const d = new Date(t), lbl = xs >= DAY ? d.toLocaleDateString(this.lang, { day: 'numeric', month: 'short' })
        : (d.getHours() === 0 && d.getMinutes() === 0 && span > DAY ? d.toLocaleDateString(this.lang, { day: 'numeric', month: 'short' }) : d.toLocaleTimeString(this.lang, { hour: '2-digit', minute: '2-digit' }));
      o += `<line x1="${XT(t)}" x2="${XT(t)}" y1="${m.t}" y2="${H - m.b}" stroke="#fff" stroke-opacity=".05"/><text x="${XT(t)}" y="${H - 8}" text-anchor="middle" fill="#8fa0c8" font-size="11">${lbl}</text>`;
    }
    if (cfg.marks) for (const mk of cfg.marks) if (mk.t >= cfg.t0 && mk.t <= cfg.t1)
      o += `<line x1="${XT(mk.t)}" x2="${XT(mk.t)}" y1="${m.t}" y2="${H - m.b}" stroke="${mk.color || '#ff5d6c'}" stroke-dasharray="3 3" stroke-opacity=".8"/>`;
    const path = (s, Yf) => {
      let d = '', started = false, fi = -1, li = -1;
      s.data.forEach((v, i) => { if (v == null) { started = false; return; } d += (started ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Yf(v).toFixed(1); started = true; if (fi < 0) fi = i; li = i; });
      return [d, fi, li];
    };
    for (const s of [...right, ...left]) {
      const Yf = s.right ? YR : Y, [d, fi, li] = path(s, Yf);
      if (!d) continue;
      if (s.fill && fi >= 0 && !d.slice(1).includes('M')) {
        const y0 = Yf(Math.max(s.right ? rlo : lo, 0));
        o += `<path d="${d}L${X(li)} ${y0}L${X(fi)} ${y0}Z" fill="${s.color}" opacity=".16"/>`;
      }
      o += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 1.8}" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    }
    o += `<line class="cur" y1="${m.t}" y2="${H - m.b}" stroke="#fff" stroke-opacity=".45" style="display:none"/>`;
    o += `<rect class="hit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/></svg><div class="tip"></div>`;
    host.innerHTML = o;
    if (cfg.icons && cfg.icons.length) {
      // weather icons along the top of the chart (Home Assistant's own icon element)
      const ic = document.createElement('div');
      ic.className = 'wxrow';
      ic.innerHTML = cfg.icons.filter((x) => x.t >= cfg.t0 && x.t <= cfg.t1)
        .map((x) => `<ha-icon icon="${esc(x.icon)}" title="${esc(x.title || '')}" style="left:${(XT(x.t) / W * 100).toFixed(2)}%"></ha-icon>`).join('');
      host.appendChild(ic);
    }
    if (cfg.legend !== false) {
      const lg = document.createElement('div'); lg.className = 'legend';
      lg.innerHTML = cfg.series.filter((s) => s.data).map((s) => `<span data-n="${esc(s.name)}" class="${this._hidden[cfg.id + s.name] ? 'off' : ''}"><i class="${s.dash ? 'd' : ''}" style="--c:${s.color};background:${s.color}"></i>${esc(s.name)}</span>`).join('');
      lg.querySelectorAll('span').forEach((sp) => sp.addEventListener('click', () => { const k = cfg.id + sp.dataset.n; this._hidden[k] = !this._hidden[k]; this._draw(host); }));
      host.appendChild(lg);
    }
    const svg = host.querySelector('svg'), hit = host.querySelector('.hit'), cur = host.querySelector('.cur'), tip = host.querySelector('.tip');
    const move = (ev) => {
      const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width;
      const i = Math.max(0, Math.min(cfg.n - 1, Math.round((x - m.l) / (W - m.l - m.r) * (cfg.n - 1))));
      const rows = vis.filter((s) => s.data[i] != null);
      if (!rows.length) { cur.style.display = 'none'; tip.style.display = 'none'; return; }
      cur.setAttribute('x1', X(i)); cur.setAttribute('x2', X(i)); cur.style.display = '';
      const t = cfg.t0 + (cfg.t1 - cfg.t0) * i / (cfg.n - 1), d = new Date(t);
      const when = span > DAY ? d.toLocaleString(this.lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : d.toLocaleTimeString(this.lang, { hour: '2-digit', minute: '2-digit' });
      tip.innerHTML = `<div style="color:#97a6c8;margin-bottom:3px">${when}</div>` + rows.map((s) => `<div><i style="background:${s.color}"></i>${esc(s.name)}<b>${(s.fmt || ((v) => fmtNum(v, cfg.dec ?? 0) + ' ' + (s.right ? cfg.unitR : cfg.unit)))(s.data[i])}</b></div>`).join('');
      tip.style.display = 'block';
      const px = X(i) / W * r.width, tw = tip.offsetWidth;
      tip.style.left = Math.min(r.width - tw, Math.max(0, px + (px > r.width / 2 ? -tw - 12 : 12))) + 'px';
      tip.style.top = '8px';
      // the same moment on the other charts (to compare them)
      if (cfg.onZoom) for (const h of this._charts || []) if (h !== host && h._showAt) h._showAt(t);
    };
    host._showAt = (t) => {
      if (t == null || t < cfg.t0 || t > cfg.t1) { cur.style.display = 'none'; return; }
      const i = Math.round((t - cfg.t0) / (cfg.t1 - cfg.t0) * (cfg.n - 1));
      cur.setAttribute('x1', X(i)); cur.setAttribute('x2', X(i)); cur.style.display = '';
    };
    hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', () => {
      cur.style.display = 'none'; tip.style.display = 'none';
      if (cfg.onZoom) for (const h of this._charts || []) if (h !== host && h._showAt) h._showAt(null);
    });
    if (cfg.onZoom) {
      // drag across the chart to zoom every chart to that time range
      const toX = (ev) => { const r = svg.getBoundingClientRect(); return Math.max(m.l, Math.min(W - m.r, (ev.clientX - r.left) * W / r.width)); };
      const toT = (x) => cfg.t0 + (cfg.t1 - cfg.t0) * (x - m.l) / (W - m.l - m.r);
      let x0 = null, sel = null;
      hit.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0) return;
        x0 = toX(ev);
        hit.setPointerCapture(ev.pointerId);
        sel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        sel.setAttribute('class', 'zsel'); sel.setAttribute('y', m.t); sel.setAttribute('height', H - m.t - m.b); sel.setAttribute('x', x0); sel.setAttribute('width', 0);
        svg.insertBefore(sel, hit);
      });
      hit.addEventListener('pointermove', (ev) => {
        if (x0 == null || !sel) return;
        const x = toX(ev);
        sel.setAttribute('x', Math.min(x0, x)); sel.setAttribute('width', Math.abs(x - x0));
      });
      const end = (ev) => {
        if (x0 == null) return;
        const x = toX(ev), a = toT(Math.min(x0, x)), b = toT(Math.max(x0, x));
        x0 = null; if (sel) { sel.remove(); sel = null; }
        // a click (no real drag) only shows the values
        if ((b - a) / (cfg.t1 - cfg.t0) > 0.01 && b - a >= 2 * 60e3) cfg.onZoom(a, b);
      };
      hit.addEventListener('pointerup', end);
      hit.addEventListener('pointercancel', () => { x0 = null; if (sel) { sel.remove(); sel = null; } });
    }
  }
  /* grouped bar chart for totals: rows = [{t, label, values:{k:v}}], keys = [{k,name,color}] */
  bars(host, cfg) {
    host.classList.add('chart'); host._bars = cfg; if (!this._charts.includes(host)) this._charts.push(host);
    host._cfg = null; this._drawBars(host);
  }
  _drawBars(host) {
    const cfg = host._bars, W = Math.max(280, host.clientWidth || 600), H = cfg.area ? (W < 500 ? 220 : 300) : (W < 500 ? 200 : 250), m = { l: 46, r: 10, t: 10, b: 26 };
    const keys = cfg.keys.filter((k) => !this._hidden[cfg.id + k.name]);
    let hi = 0; for (const r of cfg.rows) for (const k of keys) if (isNum(r.values[k.k])) hi = Math.max(hi, r.values[k.k]);
    const st = niceStep(hi || 1, 4); hi = Math.ceil((hi || 1) / st) * st;
    const Y = (v) => m.t + (H - m.t - m.b) * (1 - v / hi), gw = (W - m.l - m.r) / Math.max(1, cfg.rows.length), bw = Math.max(2, (gw * 0.8) / Math.max(1, keys.length));
    let o = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    for (let v = 0; v <= hi + st / 2; v += st) o += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#fff" stroke-opacity="${v === 0 ? .25 : .07}"/><text x="${m.l - 6}" y="${Y(v) + 4}" text-anchor="end" fill="#8fa0c8" font-size="11">${shortNum(v)}</text>`;
    const every = Math.ceil(cfg.rows.length / (W < 500 ? 6 : 15));
    const XC = (i) => m.l + i * gw + gw / 2;
    if (cfg.area) {
      // filled areas fading towards the bottom, one line per key (drawn back to front)
      o += '<defs>' + keys.map((k, j) => `<linearGradient id="g_${cfg.id}_${j}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k.color}" stop-opacity=".42"/><stop offset="1" stop-color="${k.color}" stop-opacity=".02"/></linearGradient>`).join('') + '</defs>';
      [...keys].reverse().forEach((k) => {
        const j = keys.indexOf(k);
        const pts = cfg.rows.map((r, i) => [i, r.values[k.k]]).filter(([, v]) => isNum(v));
        if (!pts.length) return;
        const line = pts.map(([i, v], n) => (n ? 'L' : 'M') + XC(i).toFixed(1) + ' ' + Y(Math.max(0, v)).toFixed(1)).join('');
        const a = pts[0][0], b = pts[pts.length - 1][0];
        o += `<path d="${line}L${XC(b).toFixed(1)} ${Y(0)}L${XC(a).toFixed(1)} ${Y(0)}Z" fill="url(#g_${cfg.id}_${j})"/>`;
        o += `<path d="${line}" fill="none" stroke="${k.color}" stroke-width="1.8" stroke-linejoin="round"/>`;
      });
      o += `<line class="cur" y1="${m.t}" y2="${H - m.b}" stroke="#fff" stroke-opacity=".4" style="display:none"/><g class="dots"></g>`;
    }
    cfg.rows.forEach((r, i) => {
      const x0 = m.l + i * gw + gw * 0.1;
      if (!cfg.area) keys.forEach((k, j) => { const v = r.values[k.k]; if (isNum(v) && v > 0) o += `<rect x="${x0 + j * bw}" y="${Y(v)}" width="${Math.max(1, bw - 1)}" height="${Y(0) - Y(v)}" rx="1.5" fill="${k.color}"/>`; });
      if (i % every === 0) o += `<text x="${XC(i)}" y="${H - 8}" text-anchor="middle" fill="#8fa0c8" font-size="11">${esc(r.short)}</text>`;
    });
    o += `<rect class="hit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/></svg><div class="tip"></div>`;
    host.innerHTML = o;
    const lg = document.createElement('div'); lg.className = 'legend';
    lg.innerHTML = cfg.keys.map((k) => `<span data-n="${esc(k.name)}" class="${this._hidden[cfg.id + k.name] ? 'off' : ''}"><i style="background:${k.color}"></i>${esc(k.name)}</span>`).join('');
    lg.querySelectorAll('span').forEach((sp) => sp.addEventListener('click', () => { const k = cfg.id + sp.dataset.n; this._hidden[k] = !this._hidden[k]; this._drawBars(host); }));
    host.appendChild(lg);
    const svg = host.querySelector('svg'), tip = host.querySelector('.tip');
    host.querySelector('.hit').addEventListener('pointermove', (ev) => {
      const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width, i = Math.floor((x - m.l) / gw), row = cfg.rows[i];
      if (!row) { tip.style.display = 'none'; return; }
      tip.innerHTML = `<div style="color:#97a6c8;margin-bottom:3px">${esc(row.label)}</div>` + keys.map((k) => `<div><i style="background:${k.color}"></i>${esc(k.name)}<b>${fmtKwh(row.values[k.k])}</b></div>`).join('');
      tip.style.display = 'block';
      if (cfg.area) {
        const cur = host.querySelector('.cur'), dots = host.querySelector('.dots'), x = m.l + i * gw + gw / 2;
        cur.setAttribute('x1', x); cur.setAttribute('x2', x); cur.style.display = '';
        dots.innerHTML = keys.filter((k) => isNum(row.values[k.k])).map((k) => `<circle cx="${x}" cy="${Y(Math.max(0, row.values[k.k]))}" r="3.5" fill="${k.color}" stroke="#0d1a3a" stroke-width="1.5"/>`).join('');
      }
      const px = (m.l + i * gw + gw / 2) / W * r.width, tw = tip.offsetWidth;
      tip.style.left = Math.min(r.width - tw, Math.max(0, px + (px > r.width / 2 ? -tw - 12 : 12))) + 'px'; tip.style.top = '8px';
    });
    host.querySelector('.hit').addEventListener('pointerleave', () => {
      tip.style.display = 'none';
      if (cfg.area) { host.querySelector('.cur').style.display = 'none'; host.querySelector('.dots').innerHTML = ''; }
    });
  }
  _redrawAll() { for (const h of this._charts || []) if (h.isConnected) (h._bars ? this._drawBars(h) : this._draw(h)); }

  /* series from history: spec key or explicit ids */
  seriesData(h, ids, how, t0, t1, n, scale = 1) {
    const arrs = ids.filter((id) => h[id] && h[id].length).map((id) => bucketize(h[id], t0, t1, n));
    const c = combine(arrs, how);
    return c && scale !== 1 ? c.map((v) => (v == null ? null : v * scale)) : c;
  }

  /* ================================================================= dashboard */
  _dashboard(m) {
    m.innerHTML = `<div class="grid2 wide">
      <section class="card">
        <div class="tiles">
          <div class="tile link" data-go="inverters"><div class="ic">${ICON.inverter}</div><div class="tx"><b>${this.t('inverter')}</b><span class="big txt" id="d_mode">–</span></div></div>
          <div class="tile"><div class="ic" id="d_sunic">${ICON.sun}</div><div class="tx"><b>${this.t('solar')}</b><span class="big" id="d_pvday">–</span><span class="sub" id="d_pvpeak"></span></div></div>
          <div class="tile"><div class="ic" id="d_gridic">${ICON.plug}</div><div class="tx"><b>${this.t('grid')}</b><span class="big" id="d_gridv">–</span><span class="sub" id="d_gridst"></span></div></div>
          <div class="tile link" data-go="battery"><div class="ic" id="d_batic">${ICON.battery(NaN)}</div><div class="tx"><b>${this.t('battery')}</b><span class="big" id="d_soc">–</span><span id="d_rate"></span><span class="sub" id="d_left"></span></div></div>
        </div>
        <div class="dview">
          <div class="gauges" id="d_gauges">
            <div class="gauge" id="g_load"></div><div class="gauge" id="g_pv"></div>
            <div class="gauge" id="g_grid"></div><div class="gauge" id="g_bat"></div>
          </div>
          <div class="flow" id="d_flow">${this._flowSvg()}</div>
          <div class="dots" role="tablist">
            <button class="dot" data-dv="gauges" role="tab" aria-label="${esc(this.t('vMeters'))}" title="${esc(this.t('vMeters'))}"></button>
            <button class="dot" data-dv="flow" role="tab" aria-label="${esc(this.t('vFlow'))}" title="${esc(this.t('vFlow'))}"></button>
          </div>
        </div>
      </section>
      <section class="card">
        <h2><button class="arrow" id="pv_prev">‹</button><span class="sp" style="text-align:center" id="pv_title">${this.t('pvToday')}</span><button class="arrow" id="pv_next">›</button></h2>
        <div class="pvhead">
          <div class="dim"><div class="v" id="pv_y">–</div><div class="k">${this.t('yesterday')}</div></div>
          <div><div class="v" id="pv_g">–</div><div class="k">${this.t('generated')}</div></div>
          <div class="bar"><i id="pv_bar" style="width:0"></i></div>
          <div><div class="v" id="pv_r">–</div><div class="k">${this.t('remaining')}</div></div>
          <div class="dim"><div class="v" id="pv_t">–</div><div class="k" id="pv_tl">${this.t('tomorrow')}</div></div>
        </div>
        <div id="c_pvday"></div>
        <h2 style="margin-top:18px">${this.t('overview')} <span style="text-transform:none;letter-spacing:0">· ${this.t('last24')}</span></h2>
        <div id="c_over"></div>
      </section>
    </div>`;
    m.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => this._show(el.dataset.go)));
    this.$('#pv_prev').addEventListener('click', () => { this._pvDay--; this._loadPvDay(); });
    this.$('#pv_next').addEventListener('click', () => { if (this._pvDay < 0) { this._pvDay++; this._loadPvDay(); } });
    this._reload();
    this._loadSavings();
    // meters or energy flow: two dots below, the choice is remembered in this browser
    let dv = 'gauges';
    try { dv = localStorage.getItem('growsolar_dview') === 'flow' ? 'flow' : 'gauges'; } catch (e) { /* no storage */ }
    const showDv = (v) => {
      this.$('#d_gauges').style.display = v === 'flow' ? 'none' : '';
      this.$('#d_flow').style.display = v === 'flow' ? '' : 'none';
      this.shadowRoot.querySelectorAll('.dots .dot').forEach((b) => { const on = b.dataset.dv === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    };
    showDv(dv);
    this.shadowRoot.querySelectorAll('.dots .dot').forEach((b) => b.addEventListener('click', () => {
      showDv(b.dataset.dv);
      try { localStorage.setItem('growsolar_dview', b.dataset.dv); } catch (e) { /* no storage */ }
    }));
  }
  /* ---------- energy flow: solar on top, grid left, house right, battery below, the inverters in the middle */
  _flowSvg() {
    const T = (k) => this.t(k), n = Math.max(1, this.invs.length);
    const model = this._map.source === 'manual' ? T('inverter') : 'SPF';
    const node = (id, x, y, col, icon) => `<g id="${id}"><circle cx="${x}" cy="${y}" r="40" fill="#0f1e45" stroke="${col}" stroke-width="2.6"/>
      <g transform="translate(${x - 14} ${y - 33}) scale(.58)">${icon}</g>
      <text x="${x}" y="${y + 15}" text-anchor="middle" class="fv" id="${id}_v">–</text></g>`;
    const lbl = (id, x, y, anchor, a, b) => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="fl1">${esc(a)}</text><text x="${x}" y="${y + 14}" text-anchor="${anchor}" class="fl2" id="${id}">${esc(b)}</text>`;
    const tower = `<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="${COL.grid}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6h14M15 15h18M24 6l-8 36M24 6l8 36M18 26l14 8M30 26l-14 8"/></svg>`;
    const house = `<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="${COL.load}" stroke-width="2.6" stroke-linejoin="round"><path d="M8 22L24 8l16 14M13 18v22h22V18"/><path d="M20 40V29h8v11"/></svg>`;
    const sun = ICON.sun.replace('<svg ', '<svg width="48" height="48" ');
    const batt = `<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#cfe0ff" stroke-width="2.4" stroke-linejoin="round"><rect x="8" y="14" width="30" height="20" rx="3"/><rect x="38" y="20" width="4" height="8" rx="1" fill="#cfe0ff"/><rect id="f_battfill" x="11" y="17" width="12" height="14" rx="1.5" fill="${COL.bat}" stroke="none"/></svg>`;
    // ring around the battery node: state of charge
    const R = 47, C = 2 * Math.PI * R;
    return `<svg viewBox="0 0 520 360" role="img" aria-label="Energy flow">
      <g class="fsav"><rect x="6" y="8" width="184" height="98" rx="12"/>
        <text x="22" y="30" class="fsl">${esc(T('fSav').toUpperCase())}</text>
        <text x="22" y="58" class="fsb" id="f_sav">–</text>
        <line x1="22" y1="70" x2="174" y2="70"/>
        <text x="22" y="85" class="fss">${esc(T('fMonth').toUpperCase())}</text><text x="106" y="85" class="fss">${esc(T('fToday').toUpperCase())}</text>
        <text x="22" y="99" class="fsm" id="f_savm">–</text><text x="106" y="99" class="fsm" id="f_savd">–</text></g>
      <line id="l_pv" x1="260" y1="114" x2="260" y2="160" class="fline"/>
      <line id="l_grid" x1="120" y1="182" x2="210" y2="182" class="fline"/>
      <line id="l_home" x1="310" y1="182" x2="400" y2="182" class="fline"/>
      <line id="l_bat" x1="260" y1="204" x2="260" y2="246" class="fline"/>
      ${node('f_pv', 260, 72, COL.pv, sun)}${lbl('f_pvst', 312, 64, 'start', T('solar'), T('fProduces'))}
      ${node('f_grid', 78, 182, COL.grid, tower)}${lbl('f_gridst', 78, 240, 'middle', T('grid'), T('fImport'))}
      ${node('f_home', 442, 182, COL.load, house)}${lbl('f_homest', 442, 240, 'middle', T('fHome'), '')}
      <g><rect x="210" y="160" width="100" height="44" rx="10" class="fbox"/>
        <text x="260" y="178" text-anchor="middle" class="fbt">${n} × ${esc(model)}</text>
        <text x="260" y="195" text-anchor="middle" class="fbs" id="f_box">–</text></g>
      <circle cx="260" cy="294" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/>
      <circle id="f_ring" cx="260" cy="294" r="${R}" fill="none" stroke="${COL.pv}" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="0 ${C.toFixed(1)}" transform="rotate(-90 260 294)"/>
      ${node('f_bat', 260, 294, '#2b3b66', batt)}
      <text x="260" y="324" text-anchor="middle" class="fpct" id="f_soc">–</text>
      ${lbl('f_batst', 316, 290, 'start', T('battery'), T('fRest'))}
    </svg>`;
  }
  _liveFlow(pv, load, grid, bat, soc, gv) {
    const fmtP = (v) => (!isNum(v) ? '–' : Math.abs(v) >= 1000 ? (v / 1000).toFixed(2) + ' kW' : Math.round(v) + ' W');
    const set = (id, v) => { const e = this.$(id); if (e) e.textContent = v; };
    const line = (id, power, forward, col) => {
      const l = this.$(id); if (!l) return;
      const on = isNum(power) && Math.abs(power) > 10;
      l.setAttribute('class', 'fline' + (on ? ' on' + (forward ? '' : ' rev') : ''));
      l.style.stroke = on ? col : '';
    };
    set('#f_pv_v', fmtP(pv)); set('#f_pvst', this.t(pv > 10 ? 'fProduces' : 'fIdle'));
    line('#l_pv', pv, true, COL.pv);
    const gridOff = isNum(gv) && gv < 100;
    set('#f_grid_v', fmtP(grid));
    set('#f_gridst', this.t(gridOff ? 'fNoGrid' : grid > 10 ? 'fImport' : grid < -10 ? 'fExport' : 'fIdle'));
    line('#l_grid', grid, grid >= 0, COL.grid);
    set('#f_home_v', fmtP(load)); line('#l_home', load, true, COL.load);
    set('#f_box', fmtP(load));
    // battery: + while charging (energy goes down to the battery)
    set('#f_bat_v', fmtP(bat));
    set('#f_batst', this.t(bat > 10 ? 'fCharging' : bat < -10 ? 'fDischarging' : 'fRest'));
    line('#l_bat', bat, bat >= 0, bat >= 0 ? COL.bat : COL.pv);
    set('#f_soc', isNum(soc) ? Math.round(soc) + '%' : '');
    const ring = this.$('#f_ring');
    if (ring && isNum(soc)) {
      const C = 2 * Math.PI * 47, p = Math.max(0, Math.min(100, soc)) / 100;
      ring.setAttribute('stroke-dasharray', `${(C * p).toFixed(1)} ${C.toFixed(1)}`);
      ring.setAttribute('stroke', soc < 20 ? COL.bad : soc < 40 ? COL.pv : COL.bat);
    }
    const bf = this.$('#f_battfill');
    if (bf && isNum(soc)) { bf.setAttribute('width', (Math.max(0, Math.min(100, soc)) / 100 * 24).toFixed(1)); bf.setAttribute('fill', soc < 20 ? COL.bad : soc < 40 ? COL.pv : COL.bat); }
  }
  /* savings box: total since the first recorded month, this month and today */
  async _loadSavings() {
    const price = this._cfg.price || 0, cur = this._cfg.currency || '';
    const box = this.$('#d_flow .fsav'); if (!box) return;
    if (!price) { box.style.display = 'none'; return; }
    this._savT = Date.now();
    const sav = (v) => (v && isNum(v.load) ? (v.load - (v.grid_in || 0)) * price : NaN);
    try {
      const now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const months = await this._energyRows(new Date(2015, 0, 1).getTime(), new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime(), 'month');
      let total = 0, any = false, month = NaN;
      for (const r of months) { const x = sav(r.values); if (isNum(x)) { total += x; any = true; if (r.t === m0) month = x; } }
      const today = {};
      for (const k of ['load', 'grid_in']) { try { today[k] = await this.energyToday(k); } catch (e) { today[k] = NaN; } }
      const d = sav(today);
      const f = (v, dec) => (isNum(v) ? v.toFixed(dec) + ' ' + cur : '–');
      const set = (id, v) => { const e = this.$(id); if (e) e.textContent = v; };
      set('#f_sav', any ? f(total, 2) : '–'); set('#f_savm', f(month, 2)); set('#f_savd', f(d, 2));
    } catch (e) { /* keep the dashes */ }
  }
  /* analog panel meter (ST-96 style): pivot bottom-right, 90° scale from the left (min) to the top (max).
     signed meters have zero in the middle (like a cos φ meter): negative values on the lower-left side.
     Below 1 kW the scale switches to W (0–1000 W or ±1000 W), with a little hysteresis. */
  gauge(el, key, label, value, max, signed, sides, kw) {
    if (!el) return;
    const st = (this._gst = this._gst || {});
    const a = Math.abs(isNum(value) ? value : 0), inW = st[key + 'W'] ? a < 1100 : a < 1000;
    st[key + 'W'] = inW;
    // kw: fixed kW scale for this meter, e.g. {full: 10, step: 1, label: 2} = ±10 kW, a long tick every kW, a number every 2 kW
    const k = inW ? 1 : 1000, full = !inW && kw ? kw.full : niceMax((inW ? 1000 : max || 6000) / k);
    const step = !inW && kw ? kw.step : majorStep(full, signed ? 3 : 6);
    const minor = !inW && kw ? step / 2 : step / (full / step <= 3 ? (signed ? 5 : 10) : 5), every = !inW && kw ? kw.label || step : step;
    const lo = signed ? -full : 0, hi = full, cx = 164, cy = 158, r = 116;
    const ang = (v) => 180 - (v - lo) / (hi - lo) * 90;
    const P = (d, rr) => [cx + rr * Math.cos(d * Math.PI / 180), cy - rr * Math.sin(d * Math.PI / 180)];
    const f = (n) => n.toFixed(1), INK = '#141414', COND = "'Roboto Condensed','Arial Narrow',Roboto,sans-serif";
    const sig = [inW, full, signed, label, (sides || []).join()].join('|');
    let svg = el.querySelector('svg');
    if (!svg || svg.dataset.sig !== sig) {
      let o = `<svg viewBox="0 0 200 200" role="img"><rect width="200" height="200" rx="5" fill="#0b0b0b"/>` +
        `<rect x="9" y="9" width="182" height="182" rx="2" fill="#f7f6f1" stroke="#d9d6cc" stroke-width="1.2"/>`;
      const arc = (a0, a1, rr, col, w, op) => { const [x0, y0] = P(a0, rr), [x1, y1] = P(a1, rr);
        return `<path d="M${f(x0)} ${f(y0)}A${rr} ${rr} 0 0 1 ${f(x1)} ${f(y1)}" fill="none" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`; };
      if (signed) o += arc(180, ang(0) + 0.8, r + 3, sides[2], 3, 0.75) + arc(ang(0) - 0.8, 90, r + 3, sides[3], 3, 0.75);
      o += arc(180, 90, r, INK, 1, 1);
      const n = Math.round((hi - lo) / minor), on = (v, s) => Math.abs(v / s - Math.round(v / s)) < 1e-6;
      for (let i = 0; i <= n; i++) {
        const v = lo + i * minor, d = ang(v), maj = on(v, step), L = maj ? 11 : on(v, step / 2) ? 7.5 : 5;
        const [x0, y0] = P(d, r), [x1, y1] = P(d, r + L);
        o += `<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" stroke="${INK}" stroke-width="${maj ? 1.8 : 0.8}"/>`;
        if (maj && on(v, every)) { const [tx, ty] = P(d, r - 13), t = String(+Math.abs(v).toFixed(2));
          o += `<text x="${f(tx)}" y="${f(ty + 4.5)}" text-anchor="middle" font-family="${COND}" font-weight="600" font-size="${t.length > 3 ? 11 : 13}" fill="${INK}">${t}</text>`; }
      }
      o += `<text x="20" y="40" font-family="${COND}" font-weight="600" font-size="27" fill="${INK}">${inW ? 'W' : 'kW'}</text>` +
        `<text x="20" y="53" font-family="Roboto,'Segoe UI',sans-serif" font-weight="700" font-size="8.5" letter-spacing=".8" fill="${INK}">${esc(label)}</text>`;
      if (signed) o += `<text class="sd0" x="86" y="160" font-family="Roboto,sans-serif" font-weight="700" font-size="7" letter-spacing=".6" fill="${sides[2]}" visibility="hidden">${esc(sides[0])}</text>` +
        `<text class="sd1" x="${cx - 6}" y="${cy - r + 38}" text-anchor="end" font-family="Roboto,sans-serif" font-weight="700" font-size="7" letter-spacing=".6" fill="${sides[3]}" visibility="hidden">${esc(sides[1])}</text>`;
      const screw = (x, y) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#c9b27a" stroke="#7a6a3e" stroke-width=".6"/><line x1="${x - 2.4}" y1="${y}" x2="${x + 2.4}" y2="${y}" stroke="#6a5a30" stroke-width=".8"/>`;
      o += screw(182, 104) + screw(108, 180) + `<rect x="18" y="170" width="70" height="15" rx="2" fill="#1d2a1d"/>` +
        `<text class="rd" x="84" y="181.5" text-anchor="end" font-family="ui-monospace,Consolas,monospace" font-size="10" font-weight="700" fill="#9dffb0"></text>` +
        `<text x="128" y="183" font-family="Roboto,sans-serif" font-size="7.5" fill="#333">ST-96</text>` +
        `<g class="needle" style="transform-origin:${cx}px ${cy}px;transform:rotate(${signed ? 45 : 0}deg)">` +
        `<path d="M${cx} ${cy - 1.2}L${cx - r - 4} ${cy - 0.25}L${cx - r - 4} ${cy + 0.25}L${cx} ${cy + 1.2}Z" fill="${INK}"/>` +
        `<path d="M${cx - 30} ${cy - 2.2}L${cx} ${cy - 3}L${cx} ${cy + 3}L${cx - 30} ${cy + 2.2}Z" fill="${INK}"/>` +
        `<path d="M${cx + 2} ${cy - 14}a16 16 0 0 1 14 14l-2 5h-10z" fill="${INK}"/></g>` +
        `<circle cx="${cx}" cy="${cy}" r="9" fill="#111"/><circle cx="${cx}" cy="${cy}" r="5.5" fill="#c8202a"/><circle cx="${cx - 1.5}" cy="${cy - 1.5}" r="1.6" fill="#ff8a8a" opacity=".8"/></svg>`;
      el.innerHTML = o;
      svg = el.querySelector('svg');
      svg.dataset.sig = sig;
      svg.querySelector('.needle').getBoundingClientRect();   // start at rest, then swing to the value
    }
    let v = isNum(value) ? value / k : lo;
    v = Math.max(lo - (hi - lo) * 0.03, Math.min(hi + (hi - lo) * 0.03, v));
    const nd = svg.querySelector('.needle'), rot = `rotate(${(180 - ang(v)).toFixed(2)}deg)`;
    if (nd.style.transform !== rot) requestAnimationFrame(() => { nd.style.transform = rot; });
    svg.querySelector('.rd').textContent = fmtW(value);
    if (signed) {   // name only the direction the power flows now (none around zero)
      const dir = isNum(value) && Math.abs(value) >= 10 ? (value < 0 ? 0 : 1) : -1;
      svg.querySelector('.sd0').setAttribute('visibility', dir === 0 ? 'visible' : 'hidden');
      svg.querySelector('.sd1').setAttribute('visibility', dir === 1 ? 'visible' : 'hidden');
    }
    svg.setAttribute('aria-label', label + ': ' + fmtW(value));
  }
  /* hours until the battery is full (charging) or down to 10 % (discharging), from the battery power */
  batTimeLeft() {
    const soc = this.liveVal('soc'), bw = this.liveVal('bat'), bv = this.liveVal('batv'), ah = this.num(this.sys.capacity_ah);
    const kwh = this._cfg.battery_kwh || (isNum(ah) && isNum(bv) ? ah * bv / 1000 : NaN), minSoc = 10;
    const h = bw > 10 ? (100 - soc) / 100 * kwh * 1000 / bw : bw < -10 ? (soc - minSoc) / 100 * kwh * 1000 / -bw : NaN;
    return { h, full: bw > 0 };
  }
  /* how fast the battery charges or discharges, in % of the capacity per hour, from the battery power */
  socRate() {
    const bw = this.liveVal('bat'), bv = this.liveVal('batv'), ah = this.num(this.sys.capacity_ah);
    const kwh = this._cfg.battery_kwh || (isNum(ah) && isNum(bv) ? ah * bv / 1000 : NaN);
    return isNum(bw) && kwh > 0 ? bw / (kwh * 1000) * 100 : NaN;
  }
  async _loadSocRate() {
    if (isNum(this.socRate())) return;   // shown live from the battery power
    const [ids, how] = this.spec('soc');
    if (!ids.length) return;
    try {
      const t1 = Date.now(), t0 = t1 - 3600e3, h = await this.history(ids, t0 - 60e3, t1);
      const pts = ids.map((id) => (h[id] || []).filter((p) => isNum(p[1]))).filter((p) => p.length);
      if (!pts.length) return;
      const first = avg(pts.map((p) => p[0][1])), last = avg(pts.map((p) => p[p.length - 1][1]));
      const el = this.$('#d_rate'); if (!el) return;
      const r = last - first;
      el.textContent = (r > 0 ? '+' : '') + r.toFixed(1) + ' ' + this.t('perHour');
      el.className = r < 0 ? 'red' : r > 0 ? 'grn' : '';
    } catch (e) { /* ignore */ }
  }
  async _loadPvDay() {
    const day0 = startOfDay(Date.now()) + this._pvDay * DAY, day1 = day0 + DAY, isToday = this._pvDay === 0, now = Date.now();
    const ttl = this.$('#pv_title'); if (!ttl) return;
    ttl.textContent = isToday ? this.t('pvToday') : new Date(day0).toLocaleDateString(this.lang, { weekday: 'long', day: 'numeric', month: 'long' });
    this.$('#pv_next').style.visibility = isToday ? 'hidden' : 'visible';
    const t0 = day0 + 5 * 3600e3, t1 = day0 + 21 * 3600e3, n = 192, step = (t1 - t0) / n;
    const [pvIds, pvHow] = this.spec('pv'), [fcIds] = this.spec('fc'), [clIds] = this.spec('cloud');
    try {
      const [h, gen, yest, fc, wx] = await Promise.all([
        this.history([...pvIds, ...fcIds, ...clIds], t0, Math.min(t1, now)),
        isToday ? this.energyToday('pv') : this.energyDay('pv', day0),
        this.energyDay('pv', day0 - DAY),
        this.solarForecast(),
        isToday ? this.weatherForecast() : Promise.resolve(null)
      ]);
      const pv = this.seriesData(h, pvIds, pvHow, t0, t1, n);
      // forecast for the whole day: Home Assistant's solar forecast (Solcast, Forecast.Solar, ...),
      // otherwise the part of the Solar Assistant prediction recorded so far
      let pred = null, fcToday = NaN, fcTomorrow = NaN, fcLeft = NaN;
      if (fc) {
        const pts = new Array(n).fill(null), add = (x, v) => (isNum(x) ? x : 0) + v;
        for (const [t, wh, iv] of fc) {
          if (t >= day0 && t < day1) {
            fcToday = add(fcToday, wh / 1000);
            if (t + iv > now) fcLeft = add(fcLeft, wh / 1000 * Math.min(1, (t + iv - now) / iv));
          }
          if (t >= day1 && t < day1 + DAY) fcTomorrow = add(fcTomorrow, wh / 1000);
          const i = Math.round((t + iv / 2 - t0) / step);
          if (i >= 0 && i < n) pts[i] = wh * 3600e3 / iv;          // energy per interval -> average W
        }
        let a = -1; for (let i = 0; i < n; i++) if (pts[i] != null) { if (a >= 0) for (let j = a + 1; j < i; j++) pts[j] = pts[a] + (pts[i] - pts[a]) * (j - a) / (i - a); a = i; }
        if (pts.some((v) => v != null)) pred = pts;
      }
      if (!pred && fcIds.length) pred = this.seriesData(h, fcIds, 'sum', t0, t1, n);
      if (isToday && !isNum(fcLeft) && this.sys.fc_left) fcLeft = this.num(this.sys.fc_left);
      // cloud cover: recorded values up to now, the weather forecast after now
      let cloud = clIds.length ? this.seriesData(h, clIds, 'avg', t0, t1, n) : null;
      const icons = [];
      if (wx && wx.length) {
        cloud = cloud || new Array(n).fill(null);
        const fpts = wx.filter((f) => isNum(f.cloud)).map((f) => [f.t, f.cloud]);
        for (let i = 0; i < n; i++) {
          const t = t0 + i * step;
          if (t < now && cloud[i] != null) continue;
          let best = null; for (const [ft, c] of fpts) if (ft <= t + 1800e3) best = c;
          if (best != null && t >= now - 3600e3) cloud[i] = best;
        }
        for (const f of wx) if (f.t >= t0 && f.t <= t1 && new Date(f.t).getHours() % 2 === 0) icons.push({ t: f.t + 1800e3, icon: WX_ICON[f.cond] || 'mdi:weather-cloudy', title: f.cond });
      }
      const peak = pv ? Math.max(0, ...pv.filter((v) => v != null)) : NaN;
      this.$('#pv_g').textContent = fmtKwh(gen);
      this.$('#pv_y').textContent = fmtKwh(yest);
      this.$('#pv_r').textContent = isToday ? fmtKwh(fcLeft) : '–';
      this.$('#pv_t').textContent = isToday ? fmtKwh(fcTomorrow) : fmtKwh(fcToday);
      this.$('#pv_tl').textContent = isToday ? this.t('tomorrow') : this.t('predicted');
      const totalDay = isNum(gen) ? gen + (isToday && isNum(fcLeft) ? fcLeft : 0) : NaN;
      this.$('#pv_bar').style.width = isNum(gen) && totalDay > 0 ? Math.min(100, gen / totalDay * 100) + '%' : '0';
      if (isToday) {
        this.$('#d_pvday').innerHTML = isNum(gen) ? `${esc(fmtKwh(gen))}<small>${esc(this.t('today'))}</small>` : '–';
        this.$('#d_pvpeak').textContent = this.t('peak') + ': ' + fmtW(peak);
      }
      this.chart(this.$('#c_pvday'), { id: 'pvday', t0, t1, n, unit: 'W', unitR: cloud ? '%' : '', rightRange: [0, 100, 50],
        marks: isToday ? [{ t: now }] : [], icons,
        series: [
          { name: this.t('generated'), color: COL.pv, data: pv, fill: true },
          { name: this.t('predicted'), color: COL.fc, data: pred, dash: true },
          { name: this.t('cloud'), color: COL.cloud, data: cloud, right: true, width: 1.2, fmt: (v) => fmtNum(v) + ' %' }
        ] });
    } catch (e) { console.error('GrowSolar pv day', e); }
  }
  async _loadOverview() {
    const t1 = Date.now(), t0 = t1 - DAY, n = 288;
    const sp = ['load', 'grid', 'pv'].map((k) => this.spec(k));
    try {
      const h = await this.history(sp.flatMap((s) => s[0]), t0, t1);
      const el = this.$('#c_over'); if (!el) return;
      this.chart(el, { id: 'over', t0, t1, n, unit: 'W', series: [
        { name: this.t('load'), color: COL.load, data: this.seriesData(h, sp[0][0], 'sum', t0, t1, n), fill: true },
        { name: this.t('grid'), color: COL.grid, data: this.seriesData(h, sp[1][0], 'sum', t0, t1, n, this.keySign('grid')) },
        { name: this.t('solar'), color: COL.pv, data: this.seriesData(h, sp[2][0], 'sum', t0, t1, n), fill: true }
      ] });
    } catch (e) { console.error('GrowSolar overview', e); }
  }

  /* ================================================================= live values */
  _live() {
    if (!this._hass) return;
    const dot = this.$('#dot');
    const anyIds = [...this.spec('load')[0], ...this.spec('pv')[0]];
    const stale = anyIds.length && anyIds.every((id) => !this.txt(id));
    if (dot) dot.className = stale ? 'off' : '';
    if (this._tab === 'dashboard') this._liveDashboard();
    else if (this._tab === 'inverters') this._liveInverters();
    else if (this._tab === 'battery') this._liveBattery();
    else if (this._tab === 'settings') this._liveSettings();
  }
  _liveDashboard() {
    const pv = this.liveVal('pv'), load = this.liveVal('load'), bat = this.liveVal('bat'), grid = this.liveVal('grid');
    const soc = this.liveVal('soc'), bv = this.liveVal('batv'), gv = this.liveVal('gridv');
    const modes = [...new Set(this.invs.map((i) => this.txt(i.mode)).filter(Boolean))];
    const set = (id, v) => { const e = this.$(id); if (e) e.textContent = v; };
    set('#d_mode', modes.length ? modes.join(' / ') + (modes.length === 1 ? '' : '') : '–');
    set('#d_gridv', isNum(gv) ? Math.round(gv) + ' V' : '–');
    const gridOn = isNum(gv) && gv > 100;
    set('#d_gridst', isNum(gv) ? this.t(gridOn ? 'present' : 'absent') : '');
    const gi = this.$('#d_gridic'); if (gi) gi.innerHTML = isNum(gv) && !gridOn ? ICON.plugOff : ICON.plug;
    const se = this.$('#d_soc');
    if (se) se.innerHTML = isNum(soc) ? `${Math.round(soc)} %${isNum(bv) ? `<small>${bv.toFixed(1)} V</small>` : ''}` : '–';
    const tl = this.batTimeLeft();
    set('#d_left', isNum(tl.h) ? this.t('timeLeft') + ': ' + fmtDur(tl.h) + ' ' + this.t(tl.full ? 'toFull' : 'toEmpty') : '');
    const bi = this.$('#d_batic'); if (bi) bi.innerHTML = ICON.battery(soc);
    const rate = this.socRate(), re = this.$('#d_rate');
    if (re && isNum(rate)) { re.textContent = (rate > 0 ? '+' : rate < 0 ? '−' : '') + Math.abs(rate).toFixed(1) + ' ' + this.t('perHour'); re.className = rate < -0.05 ? 'red' : rate > 0.05 ? 'grn' : ''; }
    const n = Math.max(1, this.invs.length), maxP = n * 6000;
    const pvMax = this._cfg.pv_kwp > 0 ? this._cfg.pv_kwp * 1000 : maxP;
    this.gauge(this.$('#g_load'), 'load', 'LOAD', load, maxP);
    this.gauge(this.$('#g_pv'), 'pv', 'SOLAR', pv, pvMax);
    this.gauge(this.$('#g_grid'), 'grid', 'GRID', grid, maxP, true, ['EXPORT', 'IMPORT', '#1f8a4c', '#c8202a']);
    this.gauge(this.$('#g_bat'), 'bat', 'BAT', bat, maxP, true, ['DISCHARGE', 'CHARGE', '#c8202a', '#1f8a4c'], { full: 10, step: 1, label: 2 });
    this._liveFlow(pv, load, grid, bat, soc, gv);
    if (Date.now() - (this._savT || 0) > 600000) this._loadSavings();
  }

  /* ================================================================= charts view */
  _chartsView(m) {
    const ranges = ['1h', '3h', '6h', '12h', '24h', '3d', '7d', '30d'];
    m.innerHTML = `<div class="toolbar">
        <div class="seg">${ranges.map((r) => `<button data-r="${r}" class="${this._range === r ? 'on' : ''}">${r}</button>`).join('')}<button data-r="custom" class="${this._range === 'custom' ? 'on' : ''}">${this.t('custom')}</button></div>
        <button class="arrow" id="r_prev">‹</button><button class="arrow" id="r_next">›</button>
        <span id="r_custom" style="display:${this._range === 'custom' ? 'flex' : 'none'};gap:8px;align-items:center">
          ${this.t('from')} <input type="datetime-local" id="r_from"> ${this.t('to')} <input type="datetime-local" id="r_to"> <button class="arrow" id="r_apply">${this.t('apply')}</button></span>
        <button class="arrow" id="r_unzoom" style="display:${(this._zoomStack || []).length ? '' : 'none'}">↺ ${this.t('unzoom')}</button>
        <span class="clock" id="r_label"></span><span class="hint">${this.t('zoomHint')}</span>${this.isDongle ? `<span class="tlogo">${img(IMG_LOGO, 'blogo')}</span>` : ''}
      </div><div class="charts" id="charts"></div>`;
    this.$('#r_unzoom').addEventListener('click', () => this._unzoom());
    m.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
      this._range = b.dataset.r; this._rangeEnd = 0; this._zoomStack = [];
      const u = this.$('#r_unzoom'); if (u) u.style.display = 'none';
      m.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('on', x === b));
      this.$('#r_custom').style.display = this._range === 'custom' ? 'flex' : 'none';
      if (this._range !== 'custom') this._loadCharts();
    }));
    const span = () => this._rangeMs();
    this.$('#r_prev').addEventListener('click', () => { const [a, b] = this._win(); this._range === 'custom' ? (this._custom = [a - (b - a), a]) : (this._rangeEnd = b - span()); this._loadCharts(); });
    this.$('#r_next').addEventListener('click', () => { const [a, b] = this._win(); if (b >= Date.now()) return; if (this._range === 'custom') this._custom = [b, b + (b - a)]; else { this._rangeEnd = b + span(); if (this._rangeEnd >= Date.now()) this._rangeEnd = 0; } this._loadCharts(); });
    this.$('#r_apply').addEventListener('click', () => {
      const a = Date.parse(this.$('#r_from').value), b = Date.parse(this.$('#r_to').value);
      if (isFinite(a) && isFinite(b) && b > a) { this._custom = [a, b]; this._loadCharts(); }
    });
    this._loadCharts();
  }
  /* zoom all charts to [a, b]; the previous view is kept for "undo zoom" */
  _zoomTo(a, b) {
    this._zoomStack = this._zoomStack || [];
    this._zoomStack.push({ range: this._range, end: this._rangeEnd, custom: this._custom });
    this._range = 'custom'; this._custom = [a, b];
    this._syncRangeUi();
    this._loadCharts();
  }
  _unzoom() {
    const p = (this._zoomStack || []).pop();
    if (!p) return;
    this._range = p.range; this._rangeEnd = p.end; this._custom = p.custom;
    this._syncRangeUi();
    this._loadCharts();
  }
  _syncRangeUi() {
    this.shadowRoot.querySelectorAll('.toolbar .seg button').forEach((x) => x.classList.toggle('on', x.dataset.r === this._range));
    const c = this.$('#r_custom'); if (c) c.style.display = this._range === 'custom' ? 'flex' : 'none';
    const u = this.$('#r_unzoom'); if (u) u.style.display = (this._zoomStack || []).length ? '' : 'none';
    if (this._range === 'custom' && this._custom) {
      const loc = (t) => { const d = new Date(t - new Date(t).getTimezoneOffset() * 60e3); return d.toISOString().slice(0, 16); };
      const f = this.$('#r_from'), to = this.$('#r_to');
      if (f) f.value = loc(this._custom[0]); if (to) to.value = loc(this._custom[1]);
    }
  }
  _rangeMs() { const m = { '1h': 1, '3h': 3, '6h': 6, '12h': 12, '24h': 24, '3d': 72, '7d': 168, '30d': 720 }; return (m[this._range] || 24) * 3600e3; }
  _win() {
    if (this._range === 'custom' && this._custom) return this._custom;
    const t1 = this._rangeEnd || Date.now(); return [t1 - this._rangeMs(), t1];
  }
  _chartDefs() {
    const inv = this.invs, s = this.sys, T = (k) => this.t(k);
    const per = (key, scale) => inv.map((i, n) => ({ ids: i[key] ? [i[key]] : [], name: `${T('perInv')} ${this.invName(n)}`, color: INV_COL[n % 6], how: 'avg', scale }));
    const sysS = (key, name, color, extra) => { const [ids, how] = this.spec(key); return { ids, how, name, color, scale: this.keySign(key), ...extra }; };
    const multi = inv.length > 1;
    const invBat = inv.map((i, n) => ({ ids: i.bat_a ? [i.bat_a] : [], name: `${T('perInv')} ${this.invName(n)}`, color: INV_COL[n % 6], how: 'avg', dash: true }));
    return [
      { id: 'c_over', title: T('overview'), unit: 'W', full: true, series: [sysS('load', T('load'), COL.load, { fill: true }), sysS('grid', T('grid'), COL.grid), sysS('pv', T('solar'), COL.pv, { fill: true })] },
      { id: 'c_bat', title: T('batteryPower'), unit: 'W', signed: true, series: [sysS('bat', T('batteryPower'), '#e9eefc', { fill: false, width: 1.6 })] },
      { id: 'c_soc', title: T('soc'), unit: '%', unitR: 'V', zero: true, series: [sysS('soc', T('soc'), COL.bat, { fill: true }), sysS('batv', T('batteryVoltage'), COL.load, { right: true, width: 1.2 })] },
      { id: 'c_m1v', title: T('mppt1v'), unit: 'V', series: per('pv1_v') },
      { id: 'c_m1a', title: T('mppt1a'), unit: 'A', dec: 1, series: per('pv1_a') },
      { id: 'c_m2v', title: T('mppt2v'), unit: 'V', series: per('pv2_v') },
      { id: 'c_m2a', title: T('mppt2a'), unit: 'A', dec: 1, series: per('pv2_a') },
      { id: 'c_m1w', title: T('mppt1w'), unit: 'W', series: per('pv1') },
      { id: 'c_m2w', title: T('mppt2w'), unit: 'W', series: per('pv2') },
      { id: 'c_pv', title: T('pvPower'), unit: 'W', series: [sysS('pv', T('total'), COL.pv, { fill: true }), ...(multi ? inv.map((i, n) => ({ ids: i.pv ? [i.pv] : [i.pv1, i.pv2].filter(Boolean), how: 'sum', name: `${T('perInv')} ${this.invName(n)}`, color: INV_COL[(n + 1) % 6], dash: true })) : [])] },
      { id: 'c_bata', title: T('batteryCurrent'), unit: 'A', dec: 1, signed: true, series: [sysS('bata', T('total'), '#e9eefc', { fill: true }), ...(multi ? invBat : [])] },
      { id: 'c_batv', title: T('batteryVoltage'), unit: 'V', dec: 1, zero: false, series: multi ? per('bat_v') : [sysS('batv', T('batteryVoltage'), COL.bat)] },
      { id: 'c_batt', title: T('batteryTemp'), unit: '°C', dec: 1, zero: false, series: [{ ids: s.bat_temp ? [s.bat_temp] : [], how: 'avg', name: T('batteryTemp'), color: COL.bat }] },
      { id: 'c_outv', title: T('acOutV'), unit: 'V', zero: false, series: [...(s.out_v ? [{ ids: [s.out_v], how: 'avg', name: T('total'), color: COL.load, fill: true }] : []), ...per('out_v').map((x) => ({ ...x, dash: !!s.out_v }))] },
      { id: 'c_temp', title: T('invTemp'), unit: '°C', dec: 1, zero: false, series: per('temp') },
      { id: 'c_gridv', title: T('gridV'), unit: 'V', zero: false, series: per('grid_v') },
      { id: 'c_gridhz', title: T('gridHz'), unit: 'Hz', dec: 2, zero: false, series: per('grid_hz') },
      { id: 'c_load', title: T('loadPower'), unit: 'W', series: [sysS('load', T('total'), COL.load, { fill: true }), ...(multi ? inv.map((i, n) => ({ ids: i.load ? [i.load] : [], how: 'avg', name: `${T('perInv')} ${this.invName(n)}`, color: INV_COL[(n + 1) % 6], dash: true })) : [])] },
      { id: 'c_bus', title: T('busV'), unit: 'V', zero: false, series: s.bus_v ? [{ ids: [s.bus_v], how: 'avg', name: T('busV'), color: COL.pv, fill: true }] : per('bus_v') }
    ].map((c) => ({ ...c, series: c.series.filter((x) => x.ids && x.ids.length) })).filter((c) => c.series.length);
  }
  async _loadCharts() {
    const box = this.$('#charts'); if (!box) return;
    this._lastLoad = Date.now();
    // short windows: one bucket per minute from the raw states; longer ones: the 5-minute statistics
    const [t0, t1] = this._win(), n = t1 - t0 <= 2 * 3600e3 ? Math.min(600, Math.max(60, Math.round((t1 - t0) / 60e3))) : Math.min(600, Math.max(36, Math.round((t1 - t0) / 300e3)));
    const lbl = this.$('#r_label');
    if (lbl) lbl.textContent = new Date(t0).toLocaleString(this.lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' – ' + new Date(t1).toLocaleString(this.lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const defs = this._chartDefs();
    if (!box.children.length || box.dataset.n !== String(defs.length)) {
      box.dataset.n = defs.length;
      box.innerHTML = defs.map((d) => `<section class="card ${d.full ? 'full' : ''}"><h2>${esc(d.title)}</h2><div id="${d.id}"><div class="empty">${this.t('loading')}</div></div></section>`).join('');
    }
    this._charts = [];
    try {
      const h = await this.history(defs.flatMap((d) => d.series.flatMap((s) => s.ids)), t0, t1);
      for (const d of defs) {
        const el = this.$('#' + d.id); if (!el) continue;
        const series = d.series.map((s) => ({ ...s, data: this.seriesData(h, s.ids, s.how, t0, t1, n, s.scale || 1) }));
        if (!series.some((s) => s.data)) { el.closest('section').style.display = 'none'; continue; }
        el.closest('section').style.display = '';
        this.chart(el, { id: d.id, t0, t1, n, unit: d.unit, unitR: d.unitR, dec: d.dec, signed: d.signed, zero: d.zero, series, onZoom: (a, b) => this._zoomTo(a, b) });
      }
    } catch (e) { console.error('GrowSolar charts', e); }
  }

  /* ================================================================= totals */
  /* Totals: one month by day, one year by month, all years */
  _totals(m) {
    const dl = (id) => `<button class="arrow dl" id="${id}" title="${esc(this.t('csv'))}"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v9.6l3.3-3.3 1.4 1.4L12 17.4l-5.7-5.7 1.4-1.4 3.3 3.3V4a1 1 0 0 1 1-1zM5 19h14v2H5z"/></svg></button>`;
    const card = (p, nav, note) => `<section class="card"${p === 'day' ? '' : ' style="margin-top:14px"'}><h2><span id="${p}_ttl"></span><span class="sp"></span><span class="sav" id="${p}_sav"></span>${dl(p + '_csv')}${nav ? `<button class="arrow" id="${p}_prev">‹</button><button class="arrow" id="${p}_next">›</button>` : ''}</h2>
        <div class="totwrap"><div id="${p}_c"></div><div class="tscroll"><table id="${p}_t"></table></div></div>${note ? `<div class="note">${this.t('kwhNote')}</div>` : ''}</section>`;
    m.innerHTML = card('day', true) + card('month', true) + card('year', false, true);
    for (const p of ['day', 'month', 'year']) this.$(`#${p}_csv`).addEventListener('click', () => this._csv(p));
    this.$('#day_prev').addEventListener('click', () => { this._dOff--; this._loadTotals('day'); });
    this.$('#day_next').addEventListener('click', () => { if (this._dOff < 0) { this._dOff++; this._loadTotals('day'); } });
    this.$('#month_prev').addEventListener('click', () => { this._mOff--; this._loadTotals('month'); });
    this.$('#month_next').addEventListener('click', () => { if (this._mOff < 0) { this._mOff++; this._loadTotals('month'); } });
    this._loadTotals('day'); this._loadTotals('month'); this._loadTotals('year');
  }
  /* energy rows of a period; today and the current month take the live counters (their statistics are not compiled yet) */
  async _energyRows(t0, t1, period) {
    const st = await this.energyStats(t0, t1, period);
    const now = Date.now(), today = startOfDay(now), m0 = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const rows = [];
    if (period === 'day') for (let t = t0; t < t1 && t <= now; t += DAY) { const ts = startOfDay(t + 3600e3); rows.push({ t: ts, values: { ...(st[ts] || this._near(st, ts) || {}) } }); }
    else for (let d = new Date(t0); d.getTime() < t1 && d.getTime() <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) rows.push({ t: d.getTime(), values: { ...(st[d.getTime()] || this._near(st, d.getTime()) || {}) } });
    const cur = rows.find((r) => r.t === (period === 'day' ? today : m0));
    if (cur) {
      const keys = Object.keys(this.en).filter((k) => (this.en[k] || []).length);
      let before = null;
      for (const k of keys) {
        let live; try { live = await this.energyToday(k); } catch (e) { live = NaN; }
        if (!isNum(live)) continue;
        if (period === 'day') cur.values[k] = live;
        else {
          if (!before) before = await this.energyStats(m0, today, 'day').catch(() => ({}));
          let b = 0; for (const row of Object.values(before)) if (isNum(row[k])) b += row[k];
          cur.values[k] = b + live;
        }
      }
    }
    return rows;
  }
  async _loadTotals(period) {
    const now = new Date(), L = this.lang;
    this._charts = (this._charts || []).filter((h) => h.isConnected);
    try {
      let rows, title;
      if (period === 'day') {
        const s0 = new Date(now.getFullYear(), now.getMonth() + this._dOff, 1), e0 = new Date(s0.getFullYear(), s0.getMonth() + 1, 1);
        rows = await this._energyRows(s0.getTime(), e0.getTime(), 'day');
        const name = s0.toLocaleDateString(L, { month: 'long', year: 'numeric' });
        title = name.charAt(0).toUpperCase() + name.slice(1);
        for (const r of rows) { const d = new Date(r.t); r.label = d.toLocaleDateString(L, { weekday: 'short', day: 'numeric', month: 'short' }); r.short = String(d.getDate()); }
      } else if (period === 'month') {
        const y = now.getFullYear() + this._mOff;
        rows = await this._energyRows(new Date(y, 0, 1).getTime(), new Date(y + 1, 0, 1).getTime(), 'month');
        title = String(y);
        for (const r of rows) { const d = new Date(r.t), n = d.toLocaleDateString(L, { month: 'long' }); r.label = n.charAt(0).toUpperCase() + n.slice(1); r.short = d.toLocaleDateString(L, { month: 'short' }); }
      } else {
        // all months with statistics, added up per calendar year
        const months = await this._energyRows(new Date(2015, 0, 1).getTime(), new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime(), 'month');
        const by = {};
        for (const r of months) {
          if (!Object.values(r.values).some(isNum)) continue;
          const y = new Date(r.t).getFullYear(), o = (by[y] = by[y] || { t: new Date(y, 0, 1).getTime(), values: {}, first: r.t });
          for (const [k, v] of Object.entries(r.values)) if (isNum(v)) o.values[k] = (o.values[k] || 0) + v;
        }
        rows = Object.values(by).sort((a, b) => a.t - b.t);
        for (const r of rows) { r.label = String(new Date(r.t).getFullYear()); r.short = r.label; }
        title = this.t('byYear');
      }
      const ttl = this.$(`#${period}_ttl`); if (ttl) ttl.textContent = title;
      this._totRows = this._totRows || {};
      this._totRows[period] = rows;
      const keyset = [{ k: 'load', name: this.t('load'), color: COL.load }, { k: 'pv', name: this.t('solar'), color: COL.pv }, { k: 'grid_in', name: this.t('grid'), color: COL.grid }];
      // a year chart has only a few points: bars read better there
      this.bars(this.$(`#${period}_c`), { id: period, rows, keys: keyset, area: period !== 'year' });
      const price = this._cfg.price || 0, cur = this._cfg.currency || '';
      const cols = [['load', 'load'], ['pv', 'solar'], ['bat_in', 'batCharged'], ['bat_out', 'batDischarged'], ['grid_in', 'gridUsed'], ['grid_out', 'gridExported']];
      // a column is shown when there is a counter for it now or values from the history
      const has = (k) => (this.en[k] || []).length || rows.some((r) => isNum(r.values[k]));
      const shown = cols.filter(([k]) => has(k));
      const sav = (v) => (isNum(v.load) ? (v.load - (v.grid_in || 0)) * price : NaN);
      // energy in kWh without the unit in every cell, so the savings column fits next to the chart
      const kwh = (v) => (isNum(v) ? (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)) : '–');
      const head = { day: 'day', month: 'month', year: 'year' }[period];
      this.$(`#${period}_t`).innerHTML = `<tr><th>${this.t(head)}</th>${shown.map(([, l]) => `<th>${this.t(l)}<small>kWh</small></th>`).join('')}${price && has('load') ? `<th>${this.t('savings')}<small>${esc(cur)}</small></th>` : ''}</tr>` +
        [...rows].reverse().map((r) => { const v = r.values, x = sav(v);
          return `<tr><td>${esc(r.label)}</td>${shown.map(([k]) => `<td>${kwh(v[k])}</td>`).join('')}${price && has('load') ? `<td class="sv">${isNum(x) ? x.toFixed(2) : '–'}</td>` : ''}</tr>`; }).join('');
      // savings of the period shown, above the chart
      const sb = this.$(`#${period}_sav`);
      if (sb) {
        const vals = rows.map((r) => sav(r.values)).filter(isNum), total = vals.reduce((a, b) => a + b, 0);
        let lbl = this.t('savings');
        if (period === 'day') lbl = this._dOff === 0 ? this.t('savMonth') : this.t('savings');
        if (period === 'month') lbl = this._mOff === 0 ? this.t('savYear') : this.t('savings');
        let extra = '';
        if (period === 'year') {
          lbl = this.t('savTotal');
          const first = rows.length ? Math.min(...rows.map((r) => r.first)) : 0;
          if (first) extra = `<small>${esc(this.t('since'))} ${esc(new Date(first).toLocaleDateString(L, { month: 'short', year: 'numeric' }))}</small>`;
        }
        sb.innerHTML = price && vals.length ? `${esc(lbl)} <b>${total.toFixed(2)} ${esc(cur)}</b>${extra}` : '';
      }
    } catch (e) { console.error('GrowSolar totals', e); }
  }
  /* CSV with the same columns as Solar Assistant's export (Wh), oldest row first */
  _csv(period) {
    const rows = (this._totRows || {})[period] || [];
    if (!rows.length) return;
    const cols = [['load', 'Load'], ['pv', 'Solar PV'], ['bat_in', 'Battery charged'], ['bat_out', 'Battery discharged'], ['grid_in', 'Grid used'], ['grid_out', 'Grid exported']];
    const price = this._cfg.price || 0, cur = this._cfg.currency || '';
    const p2 = (n) => String(n).padStart(2, '0');
    const head = ['"Time"', ...cols.map(([, l]) => `"${l} (Wh)"`), ...(price ? [`"Savings (${cur})"`] : [])].join(',');
    const lines = rows.map((r) => {
      const d = new Date(r.t), v = r.values;
      const time = period === 'day' ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` : period === 'month' ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}` : String(d.getFullYear());
      const sav = isNum(v.load) ? ((v.load - (v.grid_in || 0)) * price).toFixed(2) : '';
      return [time, ...cols.map(([k]) => (isNum(v[k]) ? Math.round(v[k] * 1000) : '')), ...(price ? [sav] : [])].join(',');
    });
    const blob = new Blob([head + '\n' + lines.join('\n') + '\n'], { type: 'text/csv' });
    const a = document.createElement('a'), now = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = `GrowSolar_${{ day: 'daily', month: 'monthly', year: 'yearly' }[period]}_totals_${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}.csv`;
    this.shadowRoot.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  _near(st, t) { for (const k of Object.keys(st)) if (Math.abs(+k - t) < 2 * 3600e3) return st[k]; return null; }

  /* ================================================================= inverters */
  _inverters(m) {
    const n = this.invs.length, multi = n > 1, T = (k) => this.t(k);
    const pic = this.isDongle ? img(IMG_INV, 'invimg') : '';
    const head = `<tr class="ihead"><th></th>${multi ? `<th>${T('total')}</th>` : ''}${this.invs.map((_, i) => `<th>${pic}<div>${esc(this.invName(i))}</div></th>`).join('')}</tr>`;
    const rows = [
      ['deviceMode', 'mode'], ['temperature', 'temp'], ['busV', 'bus_v'], [null],
      ['loadPct', 'load_pct'], ['loadPower', 'load'], ['loadVA', 'load_va'], ['acOutV', 'out_v'], ['acOutHz', 'out_hz'], [null],
      ['pvPower', 'pv'], ['pvVoltage', 'pv_v'], ['pvCurrent', 'pv_a'], [null],
      ['batteryVoltage', 'bat_v'], ['batteryCurrent', 'bat_a'], ['batteryPower', 'bat_w'], ['batPowerAC', 'bat_ac_w'], [null],
      ['gridPower', 'grid_w'], ['gridV', 'grid_v'], ['gridHz', 'grid_hz'], [null],
      ['mpptTemp', 'temp_mppt'], ['fan', 'fan'], [null],
      ['outPrio', 'out_prio'], ['chgPrio', 'chg_prio'], ['serial', 'serial'], ['firmware', 'fw'], ['invClock', 'clock']
    ];
    const has = (k) => (k === 'temp_mppt' && this.invs.some((i) => i.temp_mppt1)) || k === 'pv' || k === 'pv_v' || k === 'pv_a' || k === 'bat_w' || k === 'bat_a' || this.invs.some((i) => i[k]) || (k === 'bus_v' && this.sys.bus_v);
    let body = '', pending = false;
    for (const r of rows) {
      if (!r[0]) { if (body) pending = true; continue; }
      if (!has(r[1])) continue;
      if (pending) { body += `<tr class="gap"><td colspan="${n + 2}"></td></tr>`; pending = false; }
      body += `<tr data-k="${r[1]}"><td>${T(r[0])}</td>${multi ? '<td class="tot"></td>' : ''}${this.invs.map(() => '<td></td>').join('')}</tr>`;
    }
    m.innerHTML = `<section class="card"><div class="scroll"><table>${head}${body}</table></div></section>`;
  }
  _liveInverters() {
    const rows = this.shadowRoot.querySelectorAll('tr[data-k]');
    const fmt = { temp: (v) => fmtNum(v, 1) + ' °C', bus_v: (v) => fmtNum(v) + ' V', load_pct: (v) => fmtNum(v) + ' %', load: fmtW, load_va: (v) => fmtNum(v) + ' VA',
      out_v: (v) => fmtNum(v) + ' V', out_hz: (v) => fmtNum(v, 1) + ' Hz', bat_v: (v) => fmtNum(v, 1) + ' V', bat_a: (v) => fmtNum(v, 1) + ' A', bat_w: fmtW, bat_ac_w: fmtW,
      grid_w: fmtW, grid_v: (v) => fmtNum(v) + ' V', grid_hz: (v) => fmtNum(v, 1) + ' Hz' };
    const totalOf = { load: 'sum', load_va: 'sum', bat_w: 'sum', bat_a: 'sum', grid_w: 'sum', bat_ac_w: 'sum', pv: 'sum', load_pct: 'avg', out_v: 'avg', out_hz: 'avg', bat_v: 'avg', grid_v: 'avg', grid_hz: 'avg' };
    for (const tr of rows) {
      const k = tr.dataset.k, tds = [...tr.querySelectorAll('td')].slice(1), tot = tr.querySelector('.tot');
      const cells = tot ? tds.slice(1) : tds;
      const vals = [];
      this.invs.forEach((i, n) => {
        let html = '–', v = NaN;
        if (k === 'mode' || k === 'serial' || k === 'out_prio' || k === 'chg_prio' || k === 'fw' || k === 'clock') html = esc(this.txt(i[k]) ?? '–');
        else if (k === 'temp_mppt') html = `${fmtNum(this.num(i.temp_mppt1), 1)} °C<small>1</small> ${fmtNum(this.num(i.temp_mppt2), 1)} °C<small>2</small>`;
        else if (k === 'fan') html = fmtNum(this.num(i.fan)) + ' %';
        else if (k === 'pv') { v = this.invPv(i); html = fmtW(v) + (i.pv1 || i.pv2 ? `<div style="color:#97a6c8;font-size:12px">${fmtW(this.num(i.pv1))}<small>${this.t('mppt')} 1</small> ${fmtW(this.num(i.pv2))}<small>${this.t('mppt')} 2</small></div>` : ''); }
        else if (k === 'pv_v') html = `${fmtNum(this.num(i.pv1_v))} V<small>1</small> ${fmtNum(this.num(i.pv2_v))} V<small>2</small>`;
        else if (k === 'pv_a') html = `${fmtNum(this.num(i.pv1_a), 1)} A<small>1</small> ${fmtNum(this.num(i.pv2_a), 1)} A<small>2</small>`;
        else if (k === 'bat_w') { v = this.invBatW(i); html = fmtW(v); }
        else if (k === 'bat_a') { v = i.bat_a ? this.num(i.bat_a) : (isNum(this.invBatW(i)) && isNum(this.num(i.bat_v)) ? this.invBatW(i) / this.num(i.bat_v) : NaN); html = fmt.bat_a(v); }
        else if (k === 'bus_v' && !i.bus_v) html = '–';
        else { v = this.num(i[k]); html = (fmt[k] || ((x) => fmtNum(x)))(v); }
        vals.push(v);
        if (cells[n]) cells[n].innerHTML = html;
      });
      if (tot) {
        let tv = NaN;
        if (k === 'bus_v' && this.sys.bus_v) tv = this.num(this.sys.bus_v);
        else if (totalOf[k]) tv = totalOf[k] === 'sum' ? sum(vals) : avg(vals);
        tot.innerHTML = isNum(tv) ? (k === 'pv' ? fmtW(tv) : (fmt[k] || ((x) => fmtNum(x)))(tv)) : '';
      }
    }
  }

  /* ================================================================= settings */
  get sets() { return this._map.settings || []; }
  setLabel(k) { const l = SET_LABEL[k]; return l ? l[this.lang === 'ro-RO' ? 1 : 0] : k.replace(/_/g, ' '); }
  /* setting names present on at least one inverter, in the integration's order */
  setKeys() {
    const order = Object.keys(SET_LABEL), seen = new Set();
    this.sets.forEach((m) => Object.keys(m).forEach((k) => { if (k !== 'sync_clock') seen.add(k); }));
    return [...seen].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  }
  setState(id) { const st = id && this._hass.states[id]; return st && st.state !== 'unavailable' && st.state !== 'unknown' ? st : null; }
  setText(id) {
    const st = this.setState(id); if (!st) return null;
    const u = st.attributes.unit_of_measurement;
    if (id.startsWith('number.')) { const v = parseFloat(st.state); const step = st.attributes.step || 1; return isNum(v) ? (step < 1 ? v.toFixed(1) : String(Math.round(v))) + (u ? ' ' + u : '') : st.state; }
    return st.state;
  }
  sameVal(id, target) {
    const st = this.setState(id); if (!st) return false;
    if (id.startsWith('number.')) return Math.abs(parseFloat(st.state) - parseFloat(target)) < 1e-6;
    return st.state === String(target);
  }
  get isAdmin() { return !!(this._hass.user && this._hass.user.is_admin); }

  _settings(m) {
    const T = (k) => this.t(k), keys = this.setKeys(), n = this.sets.length;
    this._edit = null;
    if (!keys.length) { m.innerHTML = `<section class="card"><div class="empty" style="text-align:left">${esc(T('noSettings'))}</div></section>`; return; }
    const locked = this._map.settings_locked || [];
    const multi = n > 1;
    const head = `<tr><th>${T('setting')}</th>${this.sets.map((_, i) => `<th>${esc(this.invName(i))}</th>`).join('')}${multi && this.isAdmin ? `<th class="all">${T('allInv')}</th>` : ''}</tr>`;
    const body = keys.map((k) => `<tr data-s="${k}"><td>${esc(this.setLabel(k))}${locked.includes(k) ? ` <small title="${esc(T('locked'))}">${T('readOnly')}</small>` : ''}</td>` +
      this.sets.map((_, i) => `<td class="sv" data-i="${i}"></td>`).join('') +
      (multi && this.isAdmin ? `<td class="all">${locked.includes(k) ? '' : this._control(k, null)}</td>` : '') + '</tr>').join('');
    const clocks = this.sets.map((x) => x.sync_clock).filter(Boolean);
    m.innerHTML = `<section class="card"><h2>${T('settings')}<span class="sp"></span><span class="pill" id="s_diff"></span></h2>
      ${this.isAdmin ? '' : `<p class="note">${esc(T('adminOnly'))}</p>`}
      <div class="scroll"><table class="sets">${head}${body}</table></div>
      ${clocks.length && this.isAdmin ? `<p style="margin:14px 0 0"><button class="btn" id="s_clock">${esc(T('syncClock'))}</button></p>` : ''}
      <p class="note">${esc(T('confirmNote'))}</p></section>
      <section class="card" id="s_logc" style="margin-top:14px;display:${this._setLog && this._setLog.length ? 'block' : 'none'}"><h2>${T('log')}</h2><div id="s_log" class="slog"></div></section>
      <div class="modal" id="s_modal" hidden><div class="dlg"><h3 id="s_mt"></h3><div id="s_mb"></div><div class="row"><button class="btn ghost" id="s_no">${T('cancel')}</button><button class="btn" id="s_yes">${T('confirmOk')}</button></div></div></div>`;
    m.querySelectorAll('td.all').forEach((td) => {
      const k = td.parentElement.dataset.s, b = td.querySelector('button');
      if (b) b.addEventListener('click', () => this._askSet(k, null, td.querySelector('.ctl').value));
    });
    m.querySelectorAll('td.sv').forEach((td) => td.addEventListener('click', (e) => {
      if (e.target.closest('.ctl,button')) return;
      const k = td.parentElement.dataset.s, i = +td.dataset.i;
      if (!this.isAdmin || locked.includes(k) || !this.sets[i][k] || this._busy) return;
      this._edit = { k, i };
      td.innerHTML = this._control(k, i) ;
      td.querySelector('button').addEventListener('click', () => this._askSet(k, i, td.querySelector('.ctl').value));
      const c = td.querySelector('.cancel'); if (c) c.addEventListener('click', () => { this._edit = null; this._liveSettings(); });
    }));
    const ck = this.$('#s_clock'); if (ck) ck.addEventListener('click', () => this._askClock());
    this._renderLog();
  }
  /* control for one inverter (i) or for all (i = null) */
  _control(k, i) {
    const ids = i == null ? this.sets.map((x) => x[k]).filter(Boolean) : [this.sets[i][k]];
    const st = ids.map((id) => this._hass.states[id]).find((x) => x && x.attributes);
    if (!st) return '';
    const cur = this.setState(ids[0])?.state;
    let ctl;
    if (st.entity_id.startsWith('select.')) {
      ctl = `<select class="ctl">${(st.attributes.options || []).map((o) => `<option${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    } else {
      const a = st.attributes, v = cur ?? '';
      ctl = `<input class="ctl" type="number" min="${a.min}" max="${a.max}" step="${a.step || 1}" value="${esc(v)}">${a.unit_of_measurement ? `<span class="u">${esc(a.unit_of_measurement)}</span>` : ''}`;
    }
    return `<span class="ed">${ctl}<button class="btn sm">${this.t(i == null ? 'applyAll' : 'save')}</button>${i == null ? '' : `<button class="btn sm ghost cancel">×</button>`}</span>`;
  }
  _liveSettings() {
    const rows = this.shadowRoot.querySelectorAll('tr[data-s]');
    let diff = 0;
    for (const tr of rows) {
      const k = tr.dataset.s, vals = [];
      tr.querySelectorAll('td.sv').forEach((td) => {
        const i = +td.dataset.i;
        if (this._edit && this._edit.k === k && this._edit.i === i) return;
        const id = this.sets[i][k], v = id ? this.setText(id) : null;
        vals.push(v);
        const p = this._pending && this._pending[k + '/' + i];
        td.innerHTML = `${esc(v ?? '–')}${p ? `<div class="pend">→ ${esc(p)}</div>` : ''}`;
        td.classList.toggle('click', !!(this.isAdmin && id && !(this._map.settings_locked || []).includes(k) && !this._busy));
      });
      const known = vals.filter((v) => v != null);
      const differs = known.length > 1 && known.some((v) => v !== known[0]);
      tr.classList.toggle('diff', differs);
      if (differs) diff++;
    }
    const d = this.$('#s_diff');
    if (d) { d.textContent = diff ? `${diff} ${this.t('differ')}` : this.t('allSame'); d.className = 'pill' + (diff ? ' o' : ''); }
  }
  _renderLog() {
    const el = this.$('#s_log'), c = this.$('#s_logc');
    if (!el || !this._setLog) return;
    c.style.display = this._setLog.length ? 'block' : 'none';
    el.innerHTML = this._setLog.slice().reverse().map((r) => `<div class="${r.st}"><span>${esc(r.time)}</span><span>${esc(this.invName(r.i))}</span><span>${esc(r.what)}</span><b>${esc(r.msg)}</b></div>`).join('');
  }
  _modal(title, html, ok) {
    const md = this.$('#s_modal');
    this.$('#s_mt').textContent = title;
    this.$('#s_mb').innerHTML = html;
    md.hidden = false;
    const close = () => { md.hidden = true; this.$('#s_yes').onclick = null; };
    this.$('#s_no').onclick = close;
    this.$('#s_yes').onclick = () => { close(); ok(); };
  }
  _askSet(k, i, value) {
    if (this._busy || value == null || value === '') return;
    const targets = (i == null ? this.sets.map((x, n) => [n, x[k]]) : [[i, this.sets[i][k]]]).filter(([, id]) => id);
    const st = this._hass.states[targets[0][1]];
    if (st && st.entity_id.startsWith('number.')) {
      const v = parseFloat(value), a = st.attributes;
      if (!isNum(v) || v < a.min || v > a.max) return;
    }
    const u = st && st.attributes.unit_of_measurement ? ' ' + st.attributes.unit_of_measurement : '';
    const list = targets.map(([n, id]) => `<li>${esc(this.invName(n))}: ${esc(this.setText(id) ?? '–')} → <b>${esc(value + (id.startsWith('number.') ? u : ''))}</b>${this.sameVal(id, value) ? ' ✓' : ''}</li>`).join('');
    this._modal(this.t('confirmTitle'), `<p><b>${esc(this.setLabel(k))}</b></p><ul>${list}</ul><p class="note">${esc(this.t('confirmNote'))}</p>`,
      () => this._runSet(k, targets.filter(([, id]) => !this.sameVal(id, value)), value));
  }
  _askClock() {
    if (this._busy) return;
    const btns = this.sets.map((x, n) => [n, x.sync_clock]).filter(([, id]) => id);
    this._modal(this.t('confirmTitle'), `<p>${esc(this.t('syncClockQ'))}</p>`, async () => {
      for (const [n, id] of btns) {
        try { await this._hass.callService('button', 'press', { entity_id: id }); this._logSet(n, this.t('invClock'), this.t('confirmed'), 'ok'); }
        catch (e) { this._logSet(n, this.t('invClock'), e.message || String(e), 'bad'); }
      }
    });
  }
  _logSet(i, what, msg, st) {
    this._setLog = this._setLog || [];
    this._setLog.push({ i, what, msg, st, time: new Date().toLocaleTimeString(this.lang, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
    if (this._setLog.length > 50) this._setLog.shift();
    this._renderLog();
  }
  async _runSet(k, targets, value) {
    this._busy = true; this._edit = null; this._pending = {};
    targets.forEach(([n]) => { this._pending[k + '/' + n] = value; });
    this._liveSettings();
    const label = this.setLabel(k);
    for (const [n, id] of targets) {
      const what = `${label}: ${this.setText(id) ?? '–'} → ${value}`;
      if (!this.setState(id)) { this._logSet(n, what, this.t('unavailable'), 'bad'); delete this._pending[k + '/' + n]; continue; }
      this._logSet(n, what, this.t('waiting'), 'wait');
      const row = this._setLog[this._setLog.length - 1];
      try {
        if (id.startsWith('select.')) await this._hass.callService('select', 'select_option', { entity_id: id, option: value });
        else await this._hass.callService('number', 'set_value', { entity_id: id, value: parseFloat(value) });
        const t0 = Date.now();
        while (!this.sameVal(id, value) && Date.now() - t0 < 90000) await new Promise((r) => setTimeout(r, 1000));
        if (this.sameVal(id, value)) { row.msg = this.t('confirmed'); row.st = 'ok'; }
        else {
          const why = this.txt((this.invs[n] || {}).last_set);
          row.msg = this.t('notConfirmed') + (why ? ' · ' + why : ''); row.st = 'bad';
          this._renderLog();
          break;                      // stop: do not change the others when one did not take the value
        }
      } catch (e) { row.msg = e.message || String(e); row.st = 'bad'; this._renderLog(); break; }
      delete this._pending[k + '/' + n];
      this._renderLog();
      this._liveSettings();
    }
    this._pending = {}; this._busy = false;
    if (this._tab === 'settings') this._liveSettings();
  }

  /* ================================================================= battery */
  _battery(m) {
    m.innerHTML = `<div class="grid2"><section class="card"><h2>${this.t('battery')}<span class="sp"></span><span class="pill" id="b_state"></span></h2><div class="kv" id="b_kv"></div></section>
      <section class="card" id="b_bars"></section></div>${this._map.bms ? `
      <section class="card" style="margin-top:14px"><h2>${this.t('cellsTitle')}<span class="sp"></span><span class="pill" id="c_state"></span><span class="pill" id="c_bal" hidden></span></h2><div id="c_body"></div></section>
      <div class="grid2" style="margin-top:14px"><section class="card"><h2>${this.t('temps')}</h2><div class="btemps" id="c_temps"></div></section>
      <section class="card"><h2>${this.t('bmsState')}</h2><div class="chips" id="c_chips"></div><div class="kv" id="c_kv"></div></section></div>` : ''}`;
    this._loadBatE();
  }
  async _loadBatE() {
    const e = {};
    for (const k of ['bat_in', 'bat_out']) { try { e[k] = await this.energyToday(k); } catch (x) { e[k] = NaN; } }
    this._batE = e; this._batEt = Date.now();
    if (this._tab === 'battery') this._liveBattery();
  }
  /* PACE BMS read by GrowSolar over RS485-to-Ethernet: every cell, temperatures, MOSFETs, alarms */
  _liveCells() {
    const b = this._map.bms, body = this.$('#c_body');
    if (!b || !body) return;
    const T = (k) => this.t(k), f3 = (v) => fmtNum(v, 3);
    const v = (b.cells || []).map((id) => this.num(id));
    const st = this._hass && b.state ? this._hass.states[b.state] : null, at = (st && st.attributes) || {};
    const pill = this.$('#c_state'), bp = this.$('#c_bal');
    if (!v.some(isNum)) {
      body.innerHTML = `<div class="note">${esc(T('bmsNoAnswer'))}</div>`;
      if (pill) { pill.textContent = T('bmsNoAnswer'); pill.className = 'pill r'; }
      return;
    }
    const ok = v.filter(isNum), hi = Math.max(...ok), lo = Math.min(...ok), ihi = v.indexOf(hi), ilo = v.indexOf(lo);
    const cur = this.num(b.current), bal = Array.isArray(at.balancing) ? at.balancing : [];
    if (pill) {
      const s = st ? st.state : '';
      pill.textContent = s === 'fault' || s === 'protection' || s === 'warning' ? s : T(cur > 0.3 ? 'charging' : cur < -0.3 ? 'discharging' : 'idle');
      pill.className = 'pill' + (s === 'fault' || s === 'protection' ? ' r' : s === 'warning' || cur < -0.3 ? ' o' : '');
    }
    const balOk = at.balancing_reported !== false;
    if (bp) { bp.hidden = !balOk || !bal.length; bp.textContent = `${T('balancingN')}: ${bal.length}`; }
    const span = Math.max(0.05, hi - lo), b0 = lo - span * 0.6, b1 = hi + span * 0.4;
    const col = (x) => (x < 2.9 || x > 3.6 ? 'var(--bad)' : x < 3.05 || x > 3.45 ? 'var(--pv)' : 'var(--bat)');
    const stat = (k, val, unit) => `<div class="bst"><b>${esc(T(k))}</b><span>${val}<small>${unit}</small></span></div>`;
    body.innerHTML = `<div class="bstats">${stat('cHigh', f3(hi), 'V · #' + (ihi + 1))}${stat('cLow', f3(lo), 'V · #' + (ilo + 1))}` +
      `${stat('cImb', Math.round((hi - lo) * 1000), 'mV')}${stat('cAvg', f3(ok.reduce((a, c) => a + c, 0) / ok.length), 'V')}</div>` +
      `<div class="cells">${v.map((x, i) => `<div class="cell${i === ihi ? ' hi' : ''}${i === ilo ? ' lo' : ''}"><span class="bl">${bal.includes(i + 1) ? 'BAL' : ''}</span>` +
        `<div class="bar"><i style="height:${isNum(x) ? Math.max(6, Math.min(100, (x - b0) / (b1 - b0) * 100)) : 0}%;background:${isNum(x) ? col(x) : 'transparent'}"></i></div>` +
        `<span class="v">${isNum(x) ? f3(x) : '–'}</span><span class="n">#${i + 1}</span></div>`).join('')}</div>` +
      `<div class="blegend"><span><i style="background:var(--bat)"></i>3.05–3.45 V ${esc(T('lgNormal'))}</span><span><i style="background:var(--pv)"></i>${esc(T('lgEdge'))}</span>` +
      `<span><i style="background:var(--bad)"></i>${esc(T('lgBad'))}</span><span><i style="outline:2px solid var(--load);outline-offset:-2px"></i>${esc(T('lgHi'))}</span>` +
      `<span><i style="outline:2px solid var(--pv);outline-offset:-2px"></i>${esc(T('lgLo'))}</span>${balOk ? `<span><b style="color:var(--grid);font-size:11px">BAL</b> ${esc(T('lgBal'))}</span>` : ''}` +
      `<span>${esc(T('lgScale'))}: ${f3(b0)}–${f3(b1)} V (${esc(T('lgZoom'))})</span></div>`;
    const te = this.$('#c_temps');
    if (te) te.innerHTML = Object.entries(b.temps || {}).map(([k, id]) => [k, this.num(id)]).filter(([, x]) => isNum(x))
      .map(([k, x]) => stat('t_' + k, fmtNum(x, 1), '°C')).join('');
    const ch = this.$('#c_chips');
    if (ch) {
      const chip = (cls, txt) => `<span class="chip ${cls}"><i></i>${esc(txt)}</span>`;
      const list = (a) => (Array.isArray(a) ? a : []);
      ch.innerHTML = (at.charge_mos == null ? '' : chip(at.charge_mos ? '' : 'off', `${T('chgMos')} ${at.charge_mos ? 'ON' : 'OFF'}`)) +
        (at.discharge_mos == null ? '' : chip(at.discharge_mos ? '' : 'off', `${T('dsgMos')} ${at.discharge_mos ? 'ON' : 'OFF'}`)) +
        list(at.faults).map((x) => chip('bad', x)).join('') +
        (list(at.protections).length ? list(at.protections).map((x) => chip('bad', x)).join('') : chip('mut', T('noProt'))) +
        (list(at.warnings).length ? list(at.warnings).map((x) => chip('warn', x)).join('') : chip('mut', T('noAlarms')));
    }
    const kv = this.$('#c_kv');
    if (kv) {
      const n = (id, d) => (isNum(this.num(id)) ? fmtNum(this.num(id), d) : null);
      const rows = [[T('packV'), n(b.voltage, 2) && n(b.voltage, 2) + ' V'], [T('current'), n(b.current, 1) && n(b.current, 1) + ' A'],
        [T('remFull'), n(b.remaining_ah, 1) && n(b.full_ah, 1) ? `${n(b.remaining_ah, 1)} / ${n(b.full_ah, 1)} Ah` : null],
        [n(b.soh, 0) ? T('soc') + ' / ' + T('soh') : T('soc'), n(b.soc, 0) ? `${n(b.soc, 0)} %${n(b.soh, 0) ? ` / ${n(b.soh, 0)} %` : ''}` : null], [T('cycles'), n(b.cycles, 0)],
        [T('bmsAddr'), at.address != null ? `${at.address} · ${at.protocol}` : null]].filter((r) => r[1]);
      kv.innerHTML = rows.map(([k, x]) => `<span>${esc(k)}</span><span>${esc(x)}</span>`).join('');
    }
  }
  _liveBattery() {
    const s = this.sys, T = (k) => this.t(k);
    if (Date.now() - (this._batEt || 0) > 60000) { this._batEt = Date.now(); this._loadBatE(); }
    const be = this._batE || {};
    const soc = this.liveVal('soc'), bw = this.liveVal('bat'), bv = this.liveVal('batv');
    let ba = this.liveVal('bata'); if (!isNum(ba) && isNum(bw) && isNum(bv) && bv > 0) ba = bw / bv;
    const ah = this.num(s.capacity_ah), kwh = this._cfg.battery_kwh || (isNum(ah) && isNum(bv) ? ah * bv / 1000 : NaN);
    const h = this.batTimeLeft().h;
    const st = this.$('#b_state');
    if (st) { st.textContent = T(bw > 10 ? 'charging' : bw < -10 ? 'discharging' : 'idle'); st.className = 'pill' + (bw < -10 ? ' o' : ''); }
    const items = [
      [T('capacity'), isNum(ah) ? fmtNum(ah) + ' Ah' + (isNum(kwh) ? ' · ' + kwh.toFixed(1) + ' kWh' : '') : isNum(kwh) ? kwh.toFixed(1) + ' kWh' : null],
      [T('soc'), isNum(soc) ? Math.round(soc) + ' %' : null],
      [T('soh'), s.soh ? fmtNum(this.num(s.soh)) + ' %' : null],
      [T('power'), fmtW(bw)],
      [T('current'), isNum(ba) ? ba.toFixed(1) + ' A' : null],
      [T('voltage'), isNum(bv) ? bv.toFixed(2) + ' V' : null],
      [T('timeLeft'), isNum(h) ? fmtDur(h) + ' ' + T(bw > 0 ? 'toFull' : 'toEmpty') : null],
      [T('socRate'), isNum(this.socRate()) ? (this.socRate() > 0 ? '+' : '') + this.socRate().toFixed(1) + ' %/h' : null],
      [T('cycles'), s.cycles ? fmtNum(this.num(s.cycles)) : null],
      [T('cellV') + ' · ' + T('highest'), s.cell_hi ? fmtNum(this.num(s.cell_hi), 3) + ' V' : null],
      [T('cellV') + ' · ' + T('lowest'), s.cell_lo ? fmtNum(this.num(s.cell_lo), 3) + ' V' : null],
      [T('cellV') + ' · ' + T('imbalance'), s.cell_imb ? fmtNum(this.num(s.cell_imb), 3) + ' V' : null],
      [T('temperature'), isNum(this.num(s.bat_temp)) ? fmtNum(this.num(s.bat_temp), 1) + ' °C' : null],
      [T('chargedToday'), isNum(be.bat_in) ? be.bat_in.toFixed(1) + ' kWh' : null],
      [T('dischargedToday'), isNum(be.bat_out) ? be.bat_out.toFixed(1) + ' kWh' : null],
      [T('bmsChgA'), isNum(this.num(s.bms_chg_a)) ? fmtNum(this.num(s.bms_chg_a)) + ' A' : null],
      [T('bmsChgV'), isNum(this.num(s.bms_chg_v)) ? fmtNum(this.num(s.bms_chg_v), 2) + ' V' : null],
      [T('bmsCodes'), s.bms_status ? [s.bms_status, s.bms_error, s.bms_warning].map((id) => { const v = this.txt(id); return v == null ? '–' : v === '0' && id !== s.bms_status ? T('none') : v; }).join(' · ') : null]
    ].filter((x) => x[1] != null && !/^–/.test(x[1]));
    this._liveCells();
    const kv = this.$('#b_kv'); if (kv) kv.innerHTML = items.map(([k, v]) => `<span>${esc(k)}</span><span>${esc(v)}</span>`).join('');
    const maxW = Math.max(1, this.invs.length) * 6000;
    const bar = (label, v, lo, hi, color, txt, marks) => {
      if (!isNum(v)) return '';
      const z = (0 - lo) / (hi - lo) * 100, p = (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * 100;
      const a = Math.min(z, p), w = Math.abs(p - z);
      const fromZero = lo < 0 && !marks;          // power: grows from 0 both ways; temperature: from the left end
      const tk = (marks || []).map((m) => `<div class="z" style="left:${(m - lo) / (hi - lo) * 100}%" title="${m} °C"></div>`).join('');
      return `<div class="hb"><span>${esc(label)}</span><div class="t">${fromZero ? `<div class="z" style="left:${z}%"></div>` : ''}<i style="left:${fromZero ? a : 0}%;width:${fromZero ? w : p}%;background:${color}"></i>${tk}</div><b>${esc(txt)}</b></div>`;
    };
    // LiFePO4 (EVE LF304): cells 2.5–3.65 V; normal use about 3.0–3.45 V
    const cellCol = (v) => v < 2.9 || v > 3.6 ? COL.bad : v < 3.05 || v > 3.45 ? COL.pv : COL.bat;
    const imbCol = (v) => v > 0.05 ? COL.bad : v > 0.03 ? COL.pv : COL.bat;
    // charging is blocked by the BMS below 0 °C and above 55 °C; 15–35 °C is best for the cells
    const tempCol = (v) => v < 0 || v > 55 ? COL.bad : v < 15 || v > 35 ? COL.pv : COL.bat;
    const bt = this.num(s.bat_temp);
    const bb = this.$('#b_bars');
    if (bb) bb.innerHTML = bar(T('power'), bw, -maxW, maxW, bw >= 0 ? COL.bat : COL.pv, fmtW(bw)) +
      bar(T('soc'), soc, 0, 100, soc < 20 ? COL.bad : soc < 40 ? COL.pv : COL.bat, fmtNum(soc) + ' %') +
      bar(T('voltage'), bv, 40, 60, COL.load, fmtNum(bv, 1) + ' V') +
      (s.cell_hi ? bar(T('cellV') + ' · ' + T('highest'), this.num(s.cell_hi), 2.5, 3.65, cellCol(this.num(s.cell_hi)), fmtNum(this.num(s.cell_hi), 3) + ' V') : '') +
      (s.cell_lo ? bar(T('cellV') + ' · ' + T('lowest'), this.num(s.cell_lo), 2.5, 3.65, cellCol(this.num(s.cell_lo)), fmtNum(this.num(s.cell_lo), 3) + ' V') : '') +
      (s.cell_imb ? bar(T('cellV') + ' · ' + T('imbalance'), this.num(s.cell_imb), 0, 0.1, imbCol(this.num(s.cell_imb)), fmtNum(this.num(s.cell_imb), 3) + ' V') : '') +
      (isNum(bt) ? bar(T('temperature'), bt, -20, 65, tempCol(bt), fmtNum(bt, 1) + ' °C', [0, 15, 35, 55]) : '') +
      (isNum(bt) ? `<p class="note">${esc(T('tempNote'))}</p>` : '');
  }
}

customElements.get('growsolar-panel') || customElements.define('growsolar-panel', GrowSolarPanel);
})();
