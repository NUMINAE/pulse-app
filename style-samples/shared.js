// Pulse style samples: shared data, icons, donut builder, count-up
const PULSE = {
  spent: 1284.6, budget: 1800, left: 515.4, daysLeft: 7,
  cats: [
    { key: 'food', name: 'Food', share: 0.34, spent: 436.76, budget: 500, color: '#ff6a4d', icon: 'coffee' },
    { key: 'home', name: 'Home', share: 0.27, spent: 346.84, budget: 450, color: '#7c6cff', icon: 'cart' },
    { key: 'transport', name: 'Transport', share: 0.16, spent: 205.54, budget: 200, color: '#33c7a3', icon: 'car' },
    { key: 'out', name: 'Going out', share: 0.13, spent: 167.0, budget: 250, color: '#ffb020', icon: 'ticket' },
    { key: 'other', name: 'Other', share: 0.10, spent: 128.46, budget: 400, color: '#e9e5ff', icon: 'bag' },
  ],
  tx: [
    { name: 'Coffee', where: 'Lumen Coffee', cat: 'Food and drink', amt: -4.8, time: '8:12', key: 'food', icon: 'coffee' },
    { name: 'Groceries', where: 'Greenway Market', cat: 'Home', amt: -62.1, time: '12:40', key: 'home', icon: 'cart' },
    { name: 'Taxi home', where: 'Yellow Cab', cat: 'Transport', amt: -7.4, time: '18:05', key: 'transport', icon: 'car' },
    { name: 'Cinema, 2 seats', where: 'Moskva Cinema', cat: 'Going out', amt: -12.0, time: '20:30', key: 'out', icon: 'ticket' },
  ],
  // daily spend for November 1 to 23
  days: [38, 52, 21, 64, 47, 96, 71, 33, 45, 58, 29, 62, 118, 74, 41, 36, 55, 49, 27, 88, 63, 31, 86.3],
};

const ICONS = {
  coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8.5 3v3M12.5 3v3"/>',
  cart: '<path d="M4 9h16l-1.5 9.3a2 2 0 0 1-2 1.7h-9a2 2 0 0 1-2-1.7L4 9z"/><path d="M8 9l3-5.5M16 9l-3-5.5"/>',
  car: '<path d="M5 11l1.5-4a2 2 0 0 1 1.9-1.4h7.2A2 2 0 0 1 17.5 7l1.5 4"/><rect x="3" y="11" width="18" height="6.5" rx="2.2"/><path d="M6.5 17.5v2M17.5 17.5v2M7 14.2h.01M17 14.2h.01"/>',
  ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.8a2.2 2.2 0 0 0 0 4.4V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.8a2.2 2.2 0 0 0 0-4.4V8z"/><path d="M14.5 6.5v2M14.5 11v2M14.5 15.5v2"/>',
  bag: '<path d="M6 8h12l1 11.5H5L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
  home: '<path d="M4 11l8-7 8 7v7a2 2 0 0 1-2 2h-3v-6H9v6H6a2 2 0 0 1-2-2v-7z"/>',
  pie: '<path d="M11 4a8.5 8.5 0 1 0 9 9h-9V4z"/><path d="M15 3.6A8.5 8.5 0 0 1 20.4 9H15V3.6z"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="3.5"/><path d="M15.5 12.5H21"/><path d="M7 6V5"/>',
  chart: '<path d="M4 17l5-6 4 3 7-8"/><path d="M15 6h5v5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16z"/><path d="M10 21h4"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  chevd: '<path d="M6 9l6 6 6-6"/>',
  pulse: '<path d="M2 12h5l2-6 4 12 2-6h7"/>',
  warn: '<path d="M12 8v5M12 16.5h.01"/><circle cx="12" cy="12" r="9"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16"/>',
};
const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const money = (v, d = 2) => '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const STATUS = `<div class="status"><span>9:41</span><div class="island"></div><div class="sys">
<svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
<svg viewBox="0 0 17 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 4.2a10 10 0 0 1 14 0M4 7a6.4 6.4 0 0 1 9 0"/><circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none"/></svg>
<svg viewBox="0 0 27 12" fill="none"><rect x=".7" y=".7" width="22.6" height="10.6" rx="3.4" stroke="currentColor" opacity=".45" stroke-width="1.2"/><rect x="2.2" y="2.2" width="17" height="7.6" rx="2" fill="currentColor"/><rect x="24.6" y="4" width="1.8" height="4" rx=".9" fill="currentColor" opacity=".5"/></svg>
</div></div>`;

// Donut as stroked circles. opts: size, width, gap (deg), cap, sweep (ms), delay (ms)
function donut(segs, o = {}) {
  const size = o.size || 200, w = o.width || 30, r = (size - w) / 2, c = 2 * Math.PI * r, gap = (o.gap ?? 3) / 360 * c;
  let acc = 0, out = '';
  segs.forEach((s, i) => {
    const len = Math.max(0.5, s.share * c - gap - (o.cap === 'round' ? w * 0.9 : 0));
    const off = acc * c + gap / 2 + (o.cap === 'round' ? w * 0.45 : 0);
    out += `<circle class="seg seg-${s.key}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${o.stroke ? o.stroke(s, i) : s.color}" stroke-width="${w}" stroke-linecap="${o.cap || 'butt'}" stroke-dasharray="${len} ${c}" stroke-dashoffset="${-off}" style="--len:${len};--c:${c};--i:${i}"/>`;
    acc += s.share;
  });
  return `<svg class="donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">${o.defs || ''}<circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${w}"/>${out}</svg>`;
}

function countUp(el) {
  const to = parseFloat(el.dataset.count), d = +(el.dataset.dec ?? 2), dur = +(el.dataset.dur || 1400), pre = el.dataset.pre ?? '', suf = el.dataset.suf ?? '';
  const t0 = performance.now() + +(el.dataset.delay || 0);
  const fmt = v => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const split = el.dataset.split !== undefined;
  const put = v => { const s = fmt(v); if (split) { const [a, b] = s.split('.'); el.innerHTML = `${pre}${a}<small>.${b}</small>`; } else el.textContent = pre + s + suf; };
  put(0);
  (function tick(now) { const k = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - k, 4); put(to * e); if (k < 1) requestAnimationFrame(tick); else put(to); })(performance.now());
}

function boot() {
  document.querySelectorAll('[data-i]').forEach(el => { el.innerHTML = icon(el.dataset.i) + el.innerHTML; });
  document.querySelectorAll('.screen').forEach(s => { s.insertAdjacentHTML('afterbegin', STATUS); s.insertAdjacentHTML('beforeend', '<div class="home-ind"></div>'); });
  const q = new URLSearchParams(location.search).get('screen');
  const narrow = matchMedia('(max-width: 520px)').matches;
  if (q || narrow) {
    document.body.classList.add('solo');
    const want = q || 'dash';
    document.querySelectorAll('.device').forEach(d => d.classList.toggle('hide', d.dataset.screen !== want));
  }
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { if (document.body.classList.contains('solo')) location.search = '?screen=' + b.dataset.go; }));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add('in');
    document.querySelectorAll('[data-count]').forEach(countUp);
  }));
}
