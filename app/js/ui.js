// Pulse prototype: icons, formatting, charts and small helpers. No dependencies.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const ICONS = {
  coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8.5 3v3M12.5 3v3"/>',
  cart: '<path d="M4 9h16l-1.5 9.3a2 2 0 0 1-2 1.7h-9a2 2 0 0 1-2-1.7L4 9z"/><path d="M8 9l3-5.5M16 9l-3-5.5"/>',
  car: '<path d="M5 11l1.5-4a2 2 0 0 1 1.9-1.4h7.2A2 2 0 0 1 17.5 7l1.5 4"/><rect x="3" y="11" width="18" height="6.5" rx="2.2"/><path d="M6.5 17.5v2M17.5 17.5v2M7 14.2h.01M17 14.2h.01"/>',
  ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.8a2.2 2.2 0 0 0 0 4.4V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.8a2.2 2.2 0 0 0 0-4.4V8z"/><path d="M14.5 6.5v2M14.5 11v2M14.5 15.5v2"/>',
  bag: '<path d="M6 8h12l1 11.5H5L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
  home: '<path d="M4 11l8-7 8 7v7a2 2 0 0 1-2 2h-3v-6H9v6H6a2 2 0 0 1-2-2v-7z"/>',
  pie: '<path d="M11 4a8.5 8.5 0 1 0 9 9h-9V4z"/><path d="M15 3.6A8.5 8.5 0 0 1 20.4 9H15V3.6z"/>',
  wallet: '<path d="M4 9V8.5A2.5 2.5 0 0 1 6.5 6H17a2 2 0 0 1 2 2v1"/><rect x="4" y="9" width="16.5" height="10.5" rx="2.6"/><path d="M16.2 14.2h.01"/>',
  chart: '<path d="M4 17l5-6 4 3 7-8"/><path d="M15 6h5v5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16z"/><path d="M10 21h4"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  chevd: '<path d="M6 9l6 6 6-6"/>',
  back: '<path d="M15 5.5L8.5 12l6.5 6.5"/>',
  pulse: '<path d="M2 12h5l2-6 4 12 2-6h7"/>',
  warn: '<path d="M12 8v5M12 16.5h.01"/><circle cx="12" cy="12" r="9"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  plane: '<path d="M3 12.5L21 4l-6.5 17-3-7-8.5-1.5z"/><path d="M11.5 14L21 4"/>',
  laptop: '<rect x="4.5" y="5" width="15" height="10.5" rx="2"/><path d="M2.5 19h19"/>',
  umbrella: '<path d="M3.5 12a8.5 8.5 0 0 1 17 0h-17z"/><path d="M12 12v6.5a2 2 0 0 0 4 0M12 3v.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M3 10.5h18M7 14.5h3"/>',
  repeat: '<path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19M16 3l3 3-3 3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5M8 21l-3-3 3-3"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5a7 7 0 0 1 14 0"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6L12 3z"/><path d="M9 12l2.2 2.2L15.2 10"/>',
  download: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14"/>',
  play: '<path d="M8 5.5v13l11-6.5-11-6.5z"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  split: '<path d="M4 12h5l4-6h7M9 12l4 6h7"/>',
  note: '<path d="M5 5h14v10l-5 5H5V5z"/><path d="M14 20v-5h5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5V7M15.5 3.5V7"/>',
  face: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5V11M15 9.5V11M12 9.5V13h-1M9 15.5a4.5 4.5 0 0 0 6 0"/>',
  del: '<path d="M9 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-6-6 6-6z"/><path d="M12 10l4 4M16 10l-4 4"/>',
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
  bank: '<path d="M4 9.5l8-5 8 5M5.5 9.5v8M10 9.5v8M14 9.5v8M18.5 9.5v8M3.5 19.5h17"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  swap: '<path d="M4 8h14M15 5l3 3-3 3M20 16H6M9 13l-3 3 3 3"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16"/>',
};
const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const fmt = (v, d = 2) => Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const money = (v, d = 2) => '$' + fmt(v, d);
// "$1,284<small>.60</small>": cents set smaller, the way the ad shows the total
const moneyParts = v => { const [a, b] = fmt(v).split('.'); return `$${a}<small>.${b}</small>`; };
const pct = v => Math.round(v * 100) + '%';

// Count a number up when its screen enters. <b data-count="1284.6" data-pre="$" data-split></b>
function countUp(el, from) {
  const to = parseFloat(el.dataset.count), d = +(el.dataset.dec ?? 2), dur = +(el.dataset.dur || 1300), pre = el.dataset.pre ?? '', suf = el.dataset.suf ?? '';
  const start = from ?? 0, t0 = performance.now() + +(el.dataset.delay || 0), splitIt = el.dataset.split !== undefined;
  const put = v => { const s = fmt(v, d); if (splitIt) { const [a, b] = s.split('.'); el.innerHTML = `${pre}${a}<small>.${b}</small>`; } else el.textContent = pre + s + suf; };
  cancelAnimationFrame(el._raf); put(start);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('still')) return put(to);
  const tick = now => { const k = clamp((now - t0) / dur), e = 1 - Math.pow(1 - k, 4); put(start + (to - start) * e); if (k < 1) el._raf = requestAnimationFrame(tick); else put(to); };
  el._raf = requestAnimationFrame(tick);
}

// ---- donut: stroked circles, round caps, gradient per category. Segments animate through CSS (--len, --off). ----
const GRAD = { food: ['#ff9a6c', '#ff4d6d'], home: ['#a79bff', '#6a58ff'], transport: ['#6ff0cf', '#22b392'], out: ['#ffd067', '#ff9d0a'], other: ['#ffffff', '#cfc6ff'], otherL: ['#c9bfff', '#9d8cff'] };
let _uid = 0;
function donut(segs, o = {}) {
  const size = o.size || 164, w = o.width || 24, r = (size - w) / 2, c = 2 * Math.PI * r, gap = (o.gap ?? 4) / 360 * c, id = 'd' + (++_uid);
  const total = segs.reduce((s, x) => s + x.value, 0) || 1; let acc = 0, out = '';
  const defs = Object.entries(GRAD).map(([k, [a, b]]) => `<linearGradient id="${id}-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('');
  segs.forEach((s, i) => {
    const share = s.value / total, len = Math.max(0.01, share * c - gap - w * 0.9), off = acc * c + gap / 2 + w * 0.45;
    const gk = s.key === 'other' && document.documentElement.dataset.theme === 'light' ? 'otherL' : s.key;
    out += `<circle class="seg seg-${s.key}" data-key="${s.key}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#${id}-${gk})" stroke-width="${w}" stroke-linecap="round" stroke-dashoffset="${-off}" style="--len:${len.toFixed(2)};--c:${c.toFixed(2)};--i:${i};--mid:${((acc + share / 2) * 360).toFixed(2)}"/>`;
    acc += share;
  });
  return `<svg class="donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${defs}</defs><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${w}"/>${out}</svg>`;
}

// ---- progress ring (goals) ----
function ring(p, o = {}) {
  const size = o.size || 92, w = o.width || 11, r = (size - w) / 2, c = 2 * Math.PI * r, id = 'r' + (++_uid);
  return `<svg class="pring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.a || '#ff9a6c'}"/><stop offset="1" stop-color="${o.b || '#ff4d6d'}"/></linearGradient></defs><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${w}"/><circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#${id})" stroke-width="${w}" stroke-linecap="round" style="--len:${(clamp(p) * c).toFixed(2)};--c:${c.toFixed(2)}"/></svg>`;
}

// ---- smooth line through points (Catmull-Rom to bezier) ----
function smooth(pts, t = 0.18) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${(p1[0] + (p2[0] - p0[0]) * t).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) * t).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) * t).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) * t).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

// ---- drag helper: pointer events with velocity. cb: start(e) -> false to ignore, move(dx, dy, e), end(dx, dy, vx, vy) ----
function drag(el, cb, opts = {}) {
  el.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    const x0 = e.clientX, y0 = e.clientY; let lx = x0, ly = y0, lt = performance.now(), vx = 0, vy = 0, active = false, dead = false;
    if (cb.start && cb.start(e) === false) return;
    const move = ev => {
      if (dead) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!active) {
        if (Math.hypot(dx, dy) < (opts.slop ?? 8)) return;
        if (opts.axis === 'x' && Math.abs(dy) > Math.abs(dx)) { dead = true; return; }
        if (opts.axis === 'y' && Math.abs(dx) > Math.abs(dy)) { dead = true; return; }
        active = true; try { el.setPointerCapture(e.pointerId); } catch (_) {}
        el.classList.add('dragging');
      }
      const now = performance.now(), dt = Math.max(1, now - lt);
      vx = (ev.clientX - lx) / dt; vy = (ev.clientY - ly) / dt; lx = ev.clientX; ly = ev.clientY; lt = now;
      cb.move && cb.move(dx, dy, ev);
    };
    const up = ev => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      el.classList.remove('dragging');
      if (active) { cb.end && cb.end(ev.clientX - x0, ev.clientY - y0, vx, vy); el._dragged = performance.now(); }
      else cb.tap && cb.tap(ev);
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
  // a drag should not also fire a click on whatever was under the finger
  el.addEventListener('click', e => { if (el._dragged && performance.now() - el._dragged < 250) { e.stopPropagation(); e.preventDefault(); } }, true);
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
