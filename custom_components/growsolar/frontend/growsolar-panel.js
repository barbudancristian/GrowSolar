/*
 * GrowSolar panel for Home Assistant
 * Dashboard, Charts, Totals, Inverters and Battery views for Growatt SPF systems.
 * Data: DongleGrowatt or Solar Assistant entities, mapped by the integration (panel.config.map).
 *
 * Author: Barbu Dan-Cristian. Visual style after the dashboard by Andrei Cristetiu.
 * SPDX-License-Identifier: MIT
 */
(() => {
const VERSION = '0.1.1';

/* ------------------------------------------------------------------ texts */
const STR = {
  en: {
    dashboard: 'Dashboard', charts: 'Charts', totals: 'Totals', inverters: 'Inverters', battery: 'Battery',
    inverter: 'Inverter', solar: 'Solar PV', grid: 'Grid', load: 'Load', mode: 'mode',
    today: 'Today', peak: 'Peak', present: 'present', absent: 'absent', perHour: '%/h',
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
    perInv: 'Inverter', mppt: 'mppt', loading: 'Loading…'
  },
  ro: {
    dashboard: 'Dashboard', charts: 'Grafice', totals: 'Totaluri', inverters: 'Invertoare', battery: 'Baterie',
    inverter: 'Invertor', solar: 'Solar', grid: 'Rețea', load: 'Consum', mode: 'mod',
    today: 'Azi', peak: 'Vârf', present: 'prezentă', absent: 'absentă', perHour: '%/h',
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
    perInv: 'Invertor', mppt: 'mppt', loading: 'Se încarcă…'
  }
};

const COL = { pv: '#ffb02e', load: '#4aa3ff', bat: '#35d07f', grid: '#b284ff', bad: '#ff5d6c', fc: '#ffd166', cloud: '#8fa0c8', v: '#5ad1e6' };
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
.tile{display:flex;gap:14px;align-items:center;background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:14px;padding:12px;min-width:0}
.tile.link{cursor:pointer}.tile.link:hover{border-color:#4a6fd0}
.tile .ic{width:58px;height:58px;flex:none;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.04)}
.tile .ic svg{width:40px;height:40px}
.tile b{display:block;font-size:15px;margin-bottom:3px}
.tile span{display:block;color:var(--mut);font-size:14px;line-height:1.35}
.tile .red{color:var(--bad)}.tile .grn{color:var(--bat)}
.gauges{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px}
.gauge{text-align:center}
.gauge svg{width:100%;max-width:230px;height:auto}
.gv{font-size:22px;font-weight:700;fill:var(--tx);text-anchor:middle;font-variant-numeric:tabular-nums}
.gl{font-size:13px;fill:var(--mut);text-anchor:middle}
.pvhead{display:grid;grid-template-columns:auto auto 1fr auto auto;gap:14px;align-items:center;margin-bottom:6px}
.pvhead .k{font-size:12px;color:var(--mut)}.pvhead .v{font-size:17px;font-weight:650}
.pvhead .dim .v{color:var(--mut);font-weight:500}
.bar{height:12px;border-radius:7px;background:rgba(255,255,255,.08);overflow:hidden}
.bar>i{display:block;height:100%;background:linear-gradient(90deg,#ffb02e,#ffd166);border-radius:7px}
.arrow{padding:4px 10px}
.chart{position:relative;width:100%}
.chart svg{display:block;width:100%;height:auto;overflow:visible}
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
@media(max-width:600px){.wrap{padding:10px 10px 30px}.tiles{grid-template-columns:1fr}.menu{display:block}nav{margin-left:0;width:100%}
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
  liveVal(key) { const [ids, how] = this.spec(key); const v = ids.map((i) => this.num(i)); return how === 'avg' ? avg(v) : sum(v); }
  invBatW(i) { // + charging
    if (i.bat_w) return this.num(i.bat_w);
    const v = this.num(i.bat_v), a = this.num(i.bat_a);
    return isNum(v) && isNum(a) ? v * a : NaN;
  }
  invPv(i) { return i.pv ? this.num(i.pv) : sum([this.num(i.pv1), this.num(i.pv2)]); }

  /* ---------- build */
  _build() {
    const tabs = ['dashboard', 'charts', 'totals', 'inverters', 'battery'];
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="wrap">
      <header>
        <button class="menu" title="Menu"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg></button>
        <h1><i id="dot"></i><span id="ttl"></span></h1>
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
    this._charts = [];
    this.shadowRoot.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    const m = this.$('#main');
    if (!this.invs.length && !this.sys.pv && !this.sys.load) { m.innerHTML = `<div class="card empty">${this.t('noSetup')}</div>`; return; }
    if (tab === 'dashboard') this._dashboard(m);
    else if (tab === 'charts') this._chartsView(m);
    else if (tab === 'totals') this._totals(m);
    else if (tab === 'inverters') this._inverters(m);
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

  /* {id: [[t, v], ...]} from history (short ranges) or 5-minute / hourly statistics (long ranges) */
  async history(ids, t0, t1) {
    ids = [...new Set(ids.filter(Boolean))];
    if (!ids.length) return {};
    const out = {};
    if (t1 - t0 > 3 * DAY) {
      const r = await this.ws({ type: 'recorder/statistics_during_period', start_time: new Date(t0).toISOString(), end_time: new Date(t1).toISOString(),
        statistic_ids: ids, period: t1 - t0 > 20 * DAY ? 'hour' : '5minute', types: ['mean'] });
      for (const id of ids) out[id] = (r[id] || []).map((x) => [toMs(x.start), x.mean]);
      return out;
    }
    const r = await this.ws({ type: 'history/history_during_period', start_time: new Date(t0).toISOString(), end_time: new Date(t1).toISOString(),
      entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
    for (const id of ids) out[id] = (r[id] || []).map((x) => [((x.lu ?? x.lc) || 0) * 1000, parseFloat(x.s)]);
    return out;
  }
  /* daily or monthly change of the energy counters (kWh): {start_ms: {pv, load, ...}} */
  async energyStats(t0, t1, period) {
    const en = this.en, keys = Object.keys(en).filter((k) => en[k] && en[k].length);
    const ids = [...new Set(keys.flatMap((k) => en[k]))];
    if (!ids.length) return {};
    const r = await this.ws({ type: 'recorder/statistics_during_period', start_time: new Date(t0).toISOString(), end_time: new Date(t1).toISOString(),
      statistic_ids: ids, period, types: ['change'], units: { energy: 'kWh' } });
    const out = {};
    for (const k of keys) for (const id of en[k]) for (const row of r[id] || []) {
      const t = toMs(row.start), o = (out[t] = out[t] || {});
      // a negative change is not energy: the statistic's sum was restarted (for example after
      // the sensor was excluded from the recorder for a while), so that period is unknown
      if (isNum(row.change) && row.change >= 0) o[k] = (o[k] || 0) + row.change;
    }
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
    return this.energyBetween(key, startOfDay(Date.now()), Date.now());
  }
  /* energy of one past day, from history, falling back to the daily statistics */
  async energyDay(key, day0) {
    let v = NaN;
    try { v = await this.energyBetween(key, day0, day0 + DAY); } catch (e) { v = NaN; }
    if (isNum(v) && v > 0) return v;
    try { const st = await this.energyStats(day0, day0 + DAY, 'day'); const row = st[day0] || this._near(st, day0); if (row && isNum(row[key])) return row[key]; } catch (e) { /* ignore */ }
    return v;
  }
  async solarForecast() {
    if (this._fcCache && Date.now() - this._fcCache.t < 15 * 60e3) return this._fcCache.v;
    let v = null;
    try {
      const r = await this.ws({ type: 'energy/solar_forecast' });
      const wh = {};
      for (const e of Object.values(r || {})) for (const [k, w] of Object.entries(e.wh_hours || {})) wh[k] = (wh[k] || 0) + w;
      v = Object.keys(wh).length ? Object.entries(wh).map(([k, w]) => [Date.parse(k), w]).sort((a, b) => a[0] - b[0]) : null;
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
    const m = { l: 46, r: cfg.unitR ? 44 : 14, t: 10, b: 26 };
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
    };
    hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', () => { cur.style.display = 'none'; tip.style.display = 'none'; });
  }
  /* grouped bar chart for totals: rows = [{t, label, values:{k:v}}], keys = [{k,name,color}] */
  bars(host, cfg) {
    host.classList.add('chart'); host._bars = cfg; if (!this._charts.includes(host)) this._charts.push(host);
    host._cfg = null; this._drawBars(host);
  }
  _drawBars(host) {
    const cfg = host._bars, W = Math.max(280, host.clientWidth || 600), H = W < 500 ? 200 : 250, m = { l: 46, r: 10, t: 10, b: 26 };
    const keys = cfg.keys.filter((k) => !this._hidden[cfg.id + k.name]);
    let hi = 0; for (const r of cfg.rows) for (const k of keys) if (isNum(r.values[k.k])) hi = Math.max(hi, r.values[k.k]);
    const st = niceStep(hi || 1, 4); hi = Math.ceil((hi || 1) / st) * st;
    const Y = (v) => m.t + (H - m.t - m.b) * (1 - v / hi), gw = (W - m.l - m.r) / Math.max(1, cfg.rows.length), bw = Math.max(2, (gw * 0.8) / Math.max(1, keys.length));
    let o = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    for (let v = 0; v <= hi + st / 2; v += st) o += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#fff" stroke-opacity="${v === 0 ? .25 : .07}"/><text x="${m.l - 6}" y="${Y(v) + 4}" text-anchor="end" fill="#8fa0c8" font-size="11">${shortNum(v)}</text>`;
    const every = Math.ceil(cfg.rows.length / (W < 500 ? 6 : 15));
    cfg.rows.forEach((r, i) => {
      const x0 = m.l + i * gw + gw * 0.1;
      keys.forEach((k, j) => { const v = r.values[k.k]; if (isNum(v) && v > 0) o += `<rect x="${x0 + j * bw}" y="${Y(v)}" width="${Math.max(1, bw - 1)}" height="${Y(0) - Y(v)}" rx="1.5" fill="${k.color}"/>`; });
      if (i % every === 0) o += `<text x="${m.l + i * gw + gw / 2}" y="${H - 8}" text-anchor="middle" fill="#8fa0c8" font-size="11">${esc(r.short)}</text>`;
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
      const px = (m.l + i * gw + gw / 2) / W * r.width, tw = tip.offsetWidth;
      tip.style.left = Math.min(r.width - tw, Math.max(0, px + (px > r.width / 2 ? -tw - 12 : 12))) + 'px'; tip.style.top = '8px';
    });
    host.querySelector('.hit').addEventListener('pointerleave', () => { tip.style.display = 'none'; });
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
          <div class="tile link" data-go="inverters"><div class="ic">${ICON.inverter}</div><div><b>${this.t('inverter')}</b><span id="d_mode">–</span></div></div>
          <div class="tile"><div class="ic" id="d_sunic">${ICON.sun}</div><div><b>${this.t('solar')}</b><span id="d_pvday">–</span><span id="d_pvpeak">–</span></div></div>
          <div class="tile"><div class="ic" id="d_gridic">${ICON.plug}</div><div><b>${this.t('grid')}</b><span id="d_gridv">–</span><span id="d_gridst"></span></div></div>
          <div class="tile link" data-go="battery"><div class="ic" id="d_batic">${ICON.battery(NaN)}</div><div><b>${this.t('battery')}</b><span id="d_batv">–</span><span id="d_soc">–</span><span id="d_rate"></span></div></div>
        </div>
        <div class="gauges">
          <div class="gauge" id="g_load"></div><div class="gauge" id="g_pv"></div>
          <div class="gauge" id="g_grid"></div><div class="gauge" id="g_bat"></div>
        </div>
      </section>
      <section class="card">
        <h2><button class="arrow" id="pv_prev">‹</button><span class="sp" style="text-align:center" id="pv_title">${this.t('pvToday')}</span><button class="arrow" id="pv_next">›</button></h2>
        <div class="pvhead">
          <div class="dim"><div class="v" id="pv_y">–</div><div class="k">${this.t('yesterday')}</div></div>
          <div><div class="v" id="pv_g">–</div><div class="k">${this.t('generated')}</div></div>
          <div class="bar"><i id="pv_bar" style="width:0"></i></div>
          <div><div class="v" id="pv_r">–</div><div class="k">${this.t('remaining')}</div></div>
          <div class="dim"><div class="v" id="pv_t">–</div><div class="k">${this.t('tomorrow')}</div></div>
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
  }
  gauge(el, label, value, max, color, signed) {
    if (!el) return;
    const r = 80, cx = 100, cy = 98, a0 = Math.PI, frac = isNum(value) ? Math.max(-1, Math.min(1, value / (max || 1))) : 0;
    const pt = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    const arc = (f0, f1, col, w) => {
      const A0 = a0 - f0 * Math.PI, A1 = a0 - f1 * Math.PI, [x0, y0] = pt(A0), [x1, y1] = pt(A1);
      return `<path d="M${x0} ${y0}A${r} ${r} 0 ${Math.abs(f1 - f0) > 1 ? 1 : 0} ${f1 > f0 ? 1 : 0} ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    };
    let o = `<svg viewBox="0 0 200 120">` + arc(0, 1, 'rgba(255,255,255,.08)', 16);
    if (signed) { if (Math.abs(frac) > 0.002) o += frac > 0 ? arc(0.5, 0.5 + frac / 2, color, 16) : arc(0.5 + frac / 2, 0.5, COL.pv, 16); o += `<line x1="${cx}" y1="${cy - r - 10}" x2="${cx}" y2="${cy - r + 10}" stroke="rgba(255,255,255,.35)"/>`; }
    else if (frac > 0.002) o += arc(0, frac, color, 16);
    o += `<text x="100" y="84" class="gv">${fmtW(value)}</text><text x="100" y="106" class="gl">${esc(label)}</text></svg>`;
    el.innerHTML = o;
  }
  async _loadSocRate() {
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
    const day0 = startOfDay(Date.now()) + this._pvDay * DAY, day1 = day0 + DAY, isToday = this._pvDay === 0;
    const ttl = this.$('#pv_title'); if (!ttl) return;
    ttl.textContent = isToday ? this.t('pvToday') : new Date(day0).toLocaleDateString(this.lang, { weekday: 'long', day: 'numeric', month: 'long' });
    this.$('#pv_next').style.visibility = isToday ? 'hidden' : 'visible';
    const t0 = day0 + 5 * 3600e3, t1 = day0 + 21 * 3600e3, n = 192;
    const [pvIds, pvHow] = this.spec('pv'), [fcIds] = this.spec('fc'), [clIds] = this.spec('cloud');
    try {
      const [h, gen, yest, fc] = await Promise.all([
        this.history([...pvIds, ...fcIds, ...clIds], t0, t1),
        isToday ? this.energyToday('pv') : this.energyDay('pv', day0),
        this.energyDay('pv', day0 - DAY),
        this.solarForecast()
      ]);
      const pv = this.seriesData(h, pvIds, pvHow, t0, t1, n);
      let pred = fcIds.length ? this.seriesData(h, fcIds, 'sum', t0, t1, n) : null;
      if (fcIds.length && pred) for (let i = 0; i < n; i++) if (t0 + i * (t1 - t0) / n > Date.now()) pred[i] = null; // only measured part of the SA prediction
      let fcToday = NaN, fcTomorrow = NaN, fcLeft = NaN;
      if (fc) {
        const pts = new Array(n).fill(null);
        for (const [t, w] of fc) {
          if (t >= day0 && t < day1) { fcToday = (isNum(fcToday) ? fcToday : 0) + w / 1000; if (t + 3600e3 > Date.now()) fcLeft = (isNum(fcLeft) ? fcLeft : 0) + w / 1000 * Math.min(1, (t + 3600e3 - Date.now()) / 3600e3); }
          if (t >= day1 && t < day1 + DAY) fcTomorrow = (isNum(fcTomorrow) ? fcTomorrow : 0) + w / 1000;
          const i = Math.round((t + 1800e3 - t0) / ((t1 - t0) / n)); if (i >= 0 && i < n) pts[i] = w;
        }
        // linear fill between the hourly forecast points
        let a = -1; for (let i = 0; i < n; i++) if (pts[i] != null) { if (a >= 0) for (let j = a + 1; j < i; j++) pts[j] = pts[a] + (pts[i] - pts[a]) * (j - a) / (i - a); a = i; }
        if (!pred) pred = pts;
      }
      if (isToday && this.sys.fc_left) fcLeft = this.num(this.sys.fc_left);
      const peak = pv ? Math.max(0, ...pv.filter((v) => v != null)) : NaN;
      this.$('#pv_g').textContent = fmtKwh(gen);
      this.$('#pv_y').textContent = fmtKwh(yest);
      this.$('#pv_r').textContent = isToday ? fmtKwh(fcLeft) : '–';
      this.$('#pv_t').textContent = isToday ? fmtKwh(fcTomorrow) : '–';
      const totalDay = isNum(gen) ? gen + (isToday && isNum(fcLeft) ? fcLeft : 0) : NaN;
      this.$('#pv_bar').style.width = isNum(gen) && totalDay > 0 ? Math.min(100, gen / totalDay * 100) + '%' : '0';
      if (isToday) {
        this.$('#d_pvday').textContent = this.t('today') + ': ' + fmtKwh(gen);
        this.$('#d_pvpeak').textContent = this.t('peak') + ': ' + fmtW(peak);
      }
      const cloud = clIds.length ? this.seriesData(h, clIds, 'avg', t0, t1, n) : null;
      this.chart(this.$('#c_pvday'), { id: 'pvday', t0, t1, n, unit: 'W', unitR: cloud ? '%' : '', rightRange: [0, 100, 50],
        marks: isToday ? [{ t: Date.now() }] : [],
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
        { name: this.t('grid'), color: COL.grid, data: this.seriesData(h, sp[1][0], 'sum', t0, t1, n) },
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
    set('#d_batv', isNum(bv) ? bv.toFixed(1) + ' V' : '–');
    set('#d_soc', isNum(soc) ? Math.round(soc) + ' %' : '–');
    const bi = this.$('#d_batic'); if (bi) bi.innerHTML = ICON.battery(soc);
    const n = Math.max(1, this.invs.length), maxP = n * 6000;
    const pvMax = this._cfg.pv_kwp > 0 ? this._cfg.pv_kwp * 1000 : maxP;
    this.gauge(this.$('#g_load'), this.t('load'), load, maxP, COL.load);
    this.gauge(this.$('#g_pv'), this.t('solar'), pv, pvMax, COL.pv);
    this.gauge(this.$('#g_grid'), this.t('grid'), grid, maxP, COL.grid);
    this.gauge(this.$('#g_bat'), this.t('battery'), bat, maxP, COL.bat, true);
  }

  /* ================================================================= charts view */
  _chartsView(m) {
    const ranges = ['1h', '3h', '6h', '12h', '24h', '3d', '7d', '30d'];
    m.innerHTML = `<div class="toolbar">
        <div class="seg">${ranges.map((r) => `<button data-r="${r}" class="${this._range === r ? 'on' : ''}">${r}</button>`).join('')}<button data-r="custom" class="${this._range === 'custom' ? 'on' : ''}">${this.t('custom')}</button></div>
        <button class="arrow" id="r_prev">‹</button><button class="arrow" id="r_next">›</button>
        <span id="r_custom" style="display:${this._range === 'custom' ? 'flex' : 'none'};gap:8px;align-items:center">
          ${this.t('from')} <input type="datetime-local" id="r_from"> ${this.t('to')} <input type="datetime-local" id="r_to"> <button class="arrow" id="r_apply">${this.t('apply')}</button></span>
        <span class="clock" id="r_label"></span>
      </div><div class="charts" id="charts"></div>`;
    m.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
      this._range = b.dataset.r; this._rangeEnd = 0;
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
  _rangeMs() { const m = { '1h': 1, '3h': 3, '6h': 6, '12h': 12, '24h': 24, '3d': 72, '7d': 168, '30d': 720 }; return (m[this._range] || 24) * 3600e3; }
  _win() {
    if (this._range === 'custom' && this._custom) return this._custom;
    const t1 = this._rangeEnd || Date.now(); return [t1 - this._rangeMs(), t1];
  }
  _chartDefs() {
    const inv = this.invs, s = this.sys, T = (k) => this.t(k);
    const per = (key, scale) => inv.map((i, n) => ({ ids: i[key] ? [i[key]] : [], name: `${T('perInv')} ${n + 1}`, color: INV_COL[n % 6], how: 'avg', scale }));
    const sysS = (key, name, color, extra) => { const [ids, how] = this.spec(key); return { ids, how, name, color, ...extra }; };
    const multi = inv.length > 1;
    const invBat = inv.map((i, n) => ({ ids: i.bat_a ? [i.bat_a] : [], name: `${T('perInv')} ${n + 1}`, color: INV_COL[n % 6], how: 'avg', dash: true }));
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
      { id: 'c_pv', title: T('pvPower'), unit: 'W', series: [sysS('pv', T('total'), COL.pv, { fill: true }), ...(multi ? inv.map((i, n) => ({ ids: i.pv ? [i.pv] : [i.pv1, i.pv2].filter(Boolean), how: 'sum', name: `${T('perInv')} ${n + 1}`, color: INV_COL[(n + 1) % 6], dash: true })) : [])] },
      { id: 'c_bata', title: T('batteryCurrent'), unit: 'A', dec: 1, signed: true, series: [sysS('bata', T('total'), '#e9eefc', { fill: true }), ...(multi ? invBat : [])] },
      { id: 'c_batv', title: T('batteryVoltage'), unit: 'V', dec: 1, zero: false, series: multi ? per('bat_v') : [sysS('batv', T('batteryVoltage'), COL.bat)] },
      { id: 'c_batt', title: T('batteryTemp'), unit: '°C', dec: 1, zero: false, series: [{ ids: s.bat_temp ? [s.bat_temp] : [], how: 'avg', name: T('batteryTemp'), color: COL.bat }] },
      { id: 'c_outv', title: T('acOutV'), unit: 'V', zero: false, series: [...(s.out_v ? [{ ids: [s.out_v], how: 'avg', name: T('total'), color: COL.load, fill: true }] : []), ...per('out_v').map((x) => ({ ...x, dash: !!s.out_v }))] },
      { id: 'c_temp', title: T('invTemp'), unit: '°C', dec: 1, zero: false, series: per('temp') },
      { id: 'c_gridv', title: T('gridV'), unit: 'V', zero: false, series: per('grid_v') },
      { id: 'c_gridhz', title: T('gridHz'), unit: 'Hz', dec: 2, zero: false, series: per('grid_hz') },
      { id: 'c_load', title: T('loadPower'), unit: 'W', series: [sysS('load', T('total'), COL.load, { fill: true }), ...(multi ? inv.map((i, n) => ({ ids: i.load ? [i.load] : [], how: 'avg', name: `${T('perInv')} ${n + 1}`, color: INV_COL[(n + 1) % 6], dash: true })) : [])] },
      { id: 'c_bus', title: T('busV'), unit: 'V', zero: false, series: s.bus_v ? [{ ids: [s.bus_v], how: 'avg', name: T('busV'), color: COL.pv, fill: true }] : per('bus_v') }
    ].map((c) => ({ ...c, series: c.series.filter((x) => x.ids && x.ids.length) })).filter((c) => c.series.length);
  }
  async _loadCharts() {
    const box = this.$('#charts'); if (!box) return;
    this._lastLoad = Date.now();
    const [t0, t1] = this._win(), n = Math.min(600, Math.max(120, Math.round((t1 - t0) / 60e3)));
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
        this.chart(el, { id: d.id, t0, t1, n, unit: d.unit, unitR: d.unitR, dec: d.dec, signed: d.signed, zero: d.zero, series });
      }
    } catch (e) { console.error('GrowSolar charts', e); }
  }

  /* ================================================================= totals */
  _totals(m) {
    m.innerHTML = `<section class="card"><h2>${this.t('last30')}<span class="sp"></span><button class="arrow" id="d_prev">‹</button><button class="arrow" id="d_next">›</button></h2>
        <div id="c_days"></div><div class="scroll"><table id="t_days"></table></div></section>
      <section class="card" style="margin-top:14px"><h2>${this.t('last12')}<span class="sp"></span><button class="arrow" id="m_prev">‹</button><button class="arrow" id="m_next">›</button></h2>
        <div id="c_months"></div><div class="scroll"><table id="t_months"></table></div><div class="note">${this.t('kwhNote')}</div></section>`;
    this.$('#d_prev').addEventListener('click', () => { this._dOff--; this._loadTotals('day'); });
    this.$('#d_next').addEventListener('click', () => { if (this._dOff < 0) { this._dOff++; this._loadTotals('day'); } });
    this.$('#m_prev').addEventListener('click', () => { this._mOff--; this._loadTotals('month'); });
    this.$('#m_next').addEventListener('click', () => { if (this._mOff < 0) { this._mOff++; this._loadTotals('month'); } });
    this._loadTotals('day'); this._loadTotals('month');
  }
  async _loadTotals(period) {
    const now = new Date();
    let t0, t1;
    if (period === 'day') { t1 = startOfDay(Date.now()) + DAY + this._dOff * 30 * DAY; t0 = t1 - 30 * DAY; }
    else { const e = new Date(now.getFullYear(), now.getMonth() + 1 + this._mOff * 12, 1); t1 = e.getTime(); t0 = new Date(e.getFullYear(), e.getMonth() - 12, 1).getTime(); }
    const keyset = [{ k: 'load', name: this.t('load'), color: COL.load }, { k: 'pv', name: this.t('solar'), color: COL.pv }, { k: 'grid_in', name: this.t('grid'), color: COL.grid }];
    this._charts = (this._charts || []).filter((h) => h.isConnected);
    try {
      const st = await this.energyStats(t0, t1, period);
      const rows = [];
      if (period === 'day') for (let t = t0; t < t1 && t <= Date.now(); t += DAY) { const ts = startOfDay(t + 3600e3); rows.push({ t: ts, values: st[ts] || this._near(st, ts) || {} }); }
      else for (let i = 0; i < 12; i++) { const d = new Date(new Date(t0).getFullYear(), new Date(t0).getMonth() + i, 1); if (d.getTime() > Date.now()) break; rows.push({ t: d.getTime(), values: st[d.getTime()] || this._near(st, d.getTime()) || {} }); }
      const today = startOfDay(Date.now());
      const keysAll = Object.keys(this.en).filter((k) => (this.en[k] || []).length);
      const live = {};
      for (const k of keysAll) { try { live[k] = await this.energyToday(k); } catch (e) { live[k] = NaN; } }
      for (const r of rows) {
        const isCur = period === 'day' ? r.t === today : r.t === new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        if (!isCur) continue;
        for (const k of keysAll) {
          if (!isNum(live[k])) continue;
          // the statistics of the current hour are not compiled yet: take today from the counters
          if (period === 'day') r.values[k] = live[k];
          else {
            const st2 = await this.energyStats(r.t, today, 'day').catch(() => ({}));
            let before = 0; for (const row of Object.values(st2)) if (isNum(row[k])) before += row[k];
            r.values[k] = before + live[k];
          }
        }
      }
      for (const r of rows) {
        const d = new Date(r.t);
        r.label = period === 'day' ? d.toLocaleDateString(this.lang, { weekday: 'short', day: 'numeric', month: 'short' }) : d.toLocaleDateString(this.lang, { month: 'long', year: 'numeric' });
        r.short = period === 'day' ? String(d.getDate()) : d.toLocaleDateString(this.lang, { month: 'short' });
      }
      this.bars(this.$(period === 'day' ? '#c_days' : '#c_months'), { id: period, rows, keys: keyset });
      const price = this._cfg.price || 0, cur = this._cfg.currency || '';
      const cols = [['load', 'load'], ['pv', 'solar'], ['bat_in', 'batCharged'], ['bat_out', 'batDischarged'], ['grid_in', 'gridUsed'], ['grid_out', 'gridExported']];
      const has = (k) => (this.en[k] || []).length;
      const shown = cols.filter(([k]) => has(k));
      const tb = this.$(period === 'day' ? '#t_days' : '#t_months');
      tb.innerHTML = `<tr><th>${this.t(period)}</th>${shown.map(([, l]) => `<th>${this.t(l)}</th>`).join('')}${price && has('load') ? `<th>${this.t('savings')}</th>` : ''}</tr>` +
        [...rows].reverse().map((r) => { const v = r.values, sav = isNum(v.load) ? (v.load - (v.grid_in || 0)) * price : NaN;
          return `<tr><td>${esc(r.label)}</td>${shown.map(([k]) => `<td>${fmtKwh(v[k])}</td>`).join('')}${price && has('load') ? `<td>${isNum(sav) ? sav.toFixed(2) + ' ' + esc(cur) : '–'}</td>` : ''}</tr>`; }).join('');
    } catch (e) { console.error('GrowSolar totals', e); }
  }
  _near(st, t) { for (const k of Object.keys(st)) if (Math.abs(+k - t) < 2 * 3600e3) return st[k]; return null; }

  /* ================================================================= inverters */
  _inverters(m) {
    const n = this.invs.length, multi = n > 1, T = (k) => this.t(k);
    const head = `<tr><th></th>${multi ? `<th>${T('total')}</th>` : ''}${this.invs.map((_, i) => `<th>#${i + 1}</th>`).join('')}</tr>`;
    const rows = [
      ['deviceMode', 'mode'], ['temperature', 'temp'], ['busV', 'bus_v'], [null],
      ['loadPct', 'load_pct'], ['loadPower', 'load'], ['loadVA', 'load_va'], ['acOutV', 'out_v'], ['acOutHz', 'out_hz'], [null],
      ['pvPower', 'pv'], ['pvVoltage', 'pv_v'], ['pvCurrent', 'pv_a'], [null],
      ['batteryVoltage', 'bat_v'], ['batteryCurrent', 'bat_a'], ['batteryPower', 'bat_w'], ['batPowerAC', 'bat_ac_w'], [null],
      ['gridPower', 'grid_w'], ['gridV', 'grid_v'], ['gridHz', 'grid_hz'], [null],
      ['outPrio', 'out_prio'], ['chgPrio', 'chg_prio'], ['serial', 'serial']
    ];
    const has = (k) => k === 'pv' || k === 'pv_v' || k === 'pv_a' || k === 'bat_w' || k === 'bat_a' || this.invs.some((i) => i[k]) || (k === 'bus_v' && this.sys.bus_v);
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
        if (k === 'mode' || k === 'serial' || k === 'out_prio' || k === 'chg_prio') html = esc(this.txt(i[k]) ?? '–');
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

  /* ================================================================= battery */
  _battery(m) {
    m.innerHTML = `<div class="grid2"><section class="card"><h2>${this.t('battery')}<span class="sp"></span><span class="pill" id="b_state"></span></h2><div class="kv" id="b_kv"></div></section>
      <section class="card" id="b_bars"></section></div>`;
  }
  _liveBattery() {
    const s = this.sys, T = (k) => this.t(k);
    const soc = this.liveVal('soc'), bw = this.liveVal('bat'), bv = this.liveVal('batv');
    let ba = this.liveVal('bata'); if (!isNum(ba) && isNum(bw) && isNum(bv) && bv > 0) ba = bw / bv;
    const ah = this.num(s.capacity_ah), kwh = this._cfg.battery_kwh || (isNum(ah) && isNum(bv) ? ah * bv / 1000 : NaN);
    const minSoc = 10;
    const h = bw > 10 ? (100 - soc) / 100 * kwh * 1000 / bw : bw < -10 ? (soc - minSoc) / 100 * kwh * 1000 / -bw : NaN;
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
      [T('cycles'), s.cycles ? fmtNum(this.num(s.cycles)) : null],
      [T('cellV') + ' · ' + T('highest'), s.cell_hi ? fmtNum(this.num(s.cell_hi), 3) + ' V' : null],
      [T('cellV') + ' · ' + T('lowest'), s.cell_lo ? fmtNum(this.num(s.cell_lo), 3) + ' V' : null],
      [T('cellV') + ' · ' + T('imbalance'), s.cell_imb ? fmtNum(this.num(s.cell_imb), 3) + ' V' : null],
      [T('temperature'), isNum(this.num(s.bat_temp)) ? fmtNum(this.num(s.bat_temp), 1) + ' °C' : null]
    ].filter((x) => x[1] != null && !/^–/.test(x[1]));
    const kv = this.$('#b_kv'); if (kv) kv.innerHTML = items.map(([k, v]) => `<span>${esc(k)}</span><span>${esc(v)}</span>`).join('');
    const maxW = Math.max(1, this.invs.length) * 6000;
    const bar = (label, v, lo, hi, color, txt) => {
      if (!isNum(v)) return '';
      const z = (0 - lo) / (hi - lo) * 100, p = (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * 100;
      const a = Math.min(z, p), w = Math.abs(p - z);
      return `<div class="hb"><span>${esc(label)}</span><div class="t">${lo < 0 ? `<div class="z" style="left:${z}%"></div>` : ''}<i style="left:${lo < 0 ? a : 0}%;width:${lo < 0 ? w : p}%;background:${color}"></i></div><b>${esc(txt)}</b></div>`;
    };
    const bb = this.$('#b_bars');
    if (bb) bb.innerHTML = bar(T('power'), bw, -maxW, maxW, bw >= 0 ? COL.bat : COL.pv, fmtW(bw)) +
      bar(T('soc'), soc, 0, 100, soc < 20 ? COL.bad : soc < 40 ? COL.pv : COL.bat, fmtNum(soc) + ' %') +
      bar(T('voltage'), bv, 40, 60, COL.load, fmtNum(bv, 1) + ' V') +
      (s.bat_temp ? bar(T('temperature'), this.num(s.bat_temp), 0, 50, COL.pv, fmtNum(this.num(s.bat_temp), 1) + ' °C') : '') +
      (s.cell_imb ? bar(T('cellV') + ' · ' + T('imbalance'), this.num(s.cell_imb), 0, 0.2, COL.grid, fmtNum(this.num(s.cell_imb), 3) + ' V') : '');
  }
}

customElements.get('growsolar-panel') || customElements.define('growsolar-panel', GrowSolarPanel);
})();
