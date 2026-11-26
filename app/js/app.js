// Pulse prototype: navigation, transitions, gestures, sheets, theme. Screens live in screens.js.
const device = $('#device'), view = $('#view'), tabsEl = $('#tabs'), edge = $('#edge');
const Q = new URLSearchParams(location.search);
const EMBED = Q.has('frame'), STILL = Q.has('still');
const stack = []; let busy = false, sheet = null;
const topScreen = () => stack[stack.length - 1];
const EASE = 'cubic-bezier(.22,.9,.24,1)';
const hist = { depth: 0, ignore: 0, on: !EMBED };

/* ---------- building and refreshing screens ---------- */
function build(name, params = {}) {
  const def = SCREENS[name], el = document.createElement('section');
  el.className = 'screen s-' + name; el.dataset.name = name;
  el.innerHTML = def.html(params); view.appendChild(el);
  def.mount && def.mount(el, params);
  const sc = $('.scroll', el);
  if (sc) sc.addEventListener('scroll', () => el.classList.toggle('scrolled', sc.scrollTop > 6), { passive: true });
  return el;
}
function play(el) { el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); $$('[data-count]', el).forEach(n => countUp(n)); }
// Rebuild a screen in place after its data changed. quiet: content stays put, charts redraw.
function refresh(el, quiet) {
  const e = stack.find(s => s.el === el); if (!e) return el;
  const y = $('.scroll', el)?.scrollTop || 0, neo = build(e.name, e.params);
  el.replaceWith(neo); e.el = neo; const sc = $('.scroll', neo); if (sc) sc.scrollTop = y;
  if (quiet) { neo.classList.add('norise'); requestAnimationFrame(() => neo.classList.add('in')); } else play(neo);
  return neo;
}

/* ---------- navigation ---------- */
function chrome() {
  const t = topScreen(), def = SCREENS[t.name], root = SCREENS[stack[0].name];
  tabsEl.classList.toggle('hide', def.bar === false || root.bar === false && stack.length === 1);
  if (root.tab) { $$('[data-tab]', tabsEl).forEach(b => b.classList.toggle('on', b.dataset.tab === root.tab)); placeInd(); }
  device.dataset.aurora = def.aurora || 'home'; device.dataset.screen = t.name;
  edge.hidden = stack.length < 2;
  if (EMBED) try { parent.postMessage({ pulse: 'screen', name: t.name, theme: S.theme }, '*'); } catch (_) {}
}
function placeInd(instant) {
  const on = $('[data-tab].on', tabsEl), ind = $('.ind', tabsEl); if (!on) return;
  ind.style.transition = instant ? 'none' : ''; ind.style.transform = `translateX(${on.offsetLeft + on.offsetWidth / 2 - 24}px)`;
}
function go(name, params = {}) {
  const def = SCREENS[name]; if (!def || busy) return;
  closeSheet();
  if (def.tab || name === 'onboard') return rootSwitch(name, params);
  push(name, params);
}
function rootSwitch(name, params) {
  const cur = topScreen();
  if (cur && stack.length === 1 && cur.name === name) { $('.scroll', cur.el)?.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const old = stack.splice(0), el = build(name, params); stack.push({ name, params, el });
  if (hist.on && hist.depth) { hist.ignore++; history.go(-hist.depth); hist.depth = 0; }
  old.forEach(o => { SCREENS[o.name].leave?.(); o.el.style.pointerEvents = 'none';
    o.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.965)' }], { duration: STILL ? 0 : 200, easing: 'ease-out', fill: 'forwards' }).onfinish = () => o.el.remove(); });
  if (old.length && !STILL) el.animate([{ opacity: 0, transform: 'scale(1.02)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 60, easing: 'ease-out', fill: 'backwards' });
  play(el); chrome();
}
function push(name, params, instant) {
  const prev = topScreen(), el = build(name, params); stack.push({ name, params, el });
  if (hist.on) { history.pushState({ pulse: stack.length }, ''); hist.depth++; }
  const dur = instant || STILL ? 0 : 460; busy = dur > 0;
  el.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: dur, easing: EASE }).onfinish = () => { busy = false; prev.el.style.visibility = 'hidden'; };
  prev.anim = prev.el.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-24%) scale(.95)', opacity: 0 }], { duration: dur, easing: EASE, fill: 'forwards' });
  if (!dur) prev.el.style.visibility = 'hidden';
  play(el); chrome();
}
// Bring the screen underneath back to life (fresh data, visible, no leftover animation).
function revive(prev) { prev.anim?.cancel(); prev.anim = null; prev.el.style.visibility = ''; return refresh(prev.el, true); }
function pop(fromGesture) {
  if (stack.length < 2) return;
  const cur = stack.pop(), prev = topScreen(); SCREENS[cur.name].leave?.();
  if (!fromGesture) {
    const pel = revive(prev); busy = true;
    pel.animate([{ transform: 'translateX(-24%) scale(.95)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: EASE });
    cur.el.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], { duration: 420, easing: EASE, fill: 'forwards' }).onfinish = () => { cur.el.remove(); busy = false; };
  } else cur.el.remove();
  chrome();
}
function back() {
  if (busy || stack.length < 2) return;
  if (hist.on && hist.depth) history.back(); else pop();
}
window.addEventListener('popstate', () => {
  if (hist.ignore) { hist.ignore--; return; }
  if (sheet) closeSheet();
  if (hist.depth) { hist.depth--; pop(hist.gesture); hist.gesture = false; }
});

/* ---------- swipe from the left edge to go back, tracking the finger ---------- */
(function () {
  let cur, pel, w, p = 0, ready = false;
  const set = k => { p = clamp(k); cur.el.style.transform = `translateX(${p * 100}%)`; pel.style.transform = `translateX(${-24 * (1 - p)}%) scale(${.95 + .05 * p})`; pel.style.opacity = p; };
  drag(edge, {
    start() { if (stack.length < 2 || busy || sheet) return false; ready = false; },
    move(dx) { if (!ready) { cur = topScreen(); pel = revive(stack[stack.length - 2]); w = device.clientWidth; ready = true; } set(dx / w); },
    end(dx, dy, vx) {
      if (!ready) return; const done = p > .38 || vx > .45, from = p, t0 = performance.now(), dur = 260; busy = true;
      const step = now => { const k = clamp((now - t0) / dur), e = 1 - Math.pow(1 - k, 3); set(from + ((done ? 1 : 0) - from) * e);
        if (k < 1) return requestAnimationFrame(step);
        busy = false; pel.style.transform = pel.style.opacity = '';
        if (done) { if (hist.on && hist.depth) { hist.gesture = true; history.back(); } else pop(true); }
        else { cur.el.style.transform = ''; const under = stack[stack.length - 2]; under.el.style.visibility = 'hidden'; } };
      requestAnimationFrame(step);
    },
  }, { axis: 'x', slop: 5 });
})();

/* ---------- bottom sheets: rise on a spring, drag down to dismiss ---------- */
function openSheet(name, params = {}) {
  const def = SHEETS[name]; if (!def) return; closeSheet();
  const wrap = document.createElement('div'); wrap.className = 'sheetwrap s-' + name;
  wrap.innerHTML = `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true"><i class="grab"></i><div class="sbody">${def.html(params)}</div></div>`;
  device.appendChild(wrap); sheet = wrap; const sh = $('.sheet', wrap), scrim = $('.scrim', wrap);
  def.mount && def.mount($('.sbody', wrap), params, closeSheet);
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  scrim.addEventListener('click', closeSheet);
  drag(sh, {
    start(e) { if (e.target.closest('input, .keys, .stepper')) return false; },
    move(dx, dy) { const y = Math.max(0, dy); sh.style.transition = 'none'; sh.style.transform = `translateY(${y}px)`; scrim.style.opacity = 1 - clamp(y / 400); },
    end(dx, dy, vx, vy) { sh.style.transition = ''; scrim.style.opacity = ''; if (dy > 120 || vy > .55) closeSheet(); else sh.style.transform = ''; },
  }, { axis: 'y' });
}
function closeSheet() {
  if (!sheet) return; const w = sheet; sheet = null; $('.sheet', w).style.transform = ''; w.classList.remove('open'); w.classList.add('closing'); setTimeout(() => w.remove(), STILL ? 0 : 420);
}

/* ---------- small pieces ---------- */
let toastT;
function toast(msg) {
  let t = $('.toast', device); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); device.appendChild(t); }
  t.innerHTML = `<i>${icon('check')}</i><span>${msg}</span>`; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
// Segmented control with a sliding thumb. cb fires once the thumb has moved.
function seg(el, cb) {
  if (!el) return; const th = document.createElement('i'); th.className = 'thumb'; el.prepend(th);
  const place = anim => { const on = $('button.on', el); if (!on) return; th.style.transition = anim ? '' : 'none'; th.style.width = on.offsetWidth - 8 + 'px'; th.style.transform = `translateX(${on.offsetLeft + 4}px)`; };
  requestAnimationFrame(() => place(false));
  el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.classList.contains('on')) return; $$('button', el).forEach(x => x.classList.toggle('on', x === b)); place(true); setTimeout(() => cb(b.dataset.v, b), STILL ? 0 : 170); });
}
// Theme: the new look spreads out from the control that was tapped.
function setTheme(mode, origin) {
  S.themeMode = mode; try { localStorage.setItem('pulse-theme', mode); } catch (_) {}
  const next = mode === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : mode;
  if (next === S.theme) return;
  const apply = () => { S.theme = next; document.documentElement.dataset.theme = next; $('meta[name="theme-color"]').content = next === 'light' ? '#f1edff' : '#120c2b';
    const t = topScreen(); if (t && t.name !== 'profile') refresh(t.el, true); chrome(); };
  if (!document.startViewTransition || reduceMotion() || STILL) return apply();
  const r = (origin || device).getBoundingClientRect(), x = origin ? r.left + r.width / 2 : r.left + r.width / 2, y = origin ? r.top + r.height / 2 : r.top + r.height * .3;
  const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] }, { duration: 620, easing: 'cubic-bezier(.3,0,.2,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
}

/* ---------- one click handler for everything declarative ---------- */
device.addEventListener('click', e => {
  const t = e.target.closest('[data-back],[data-tx],[data-sheet],[data-toast],[data-go]'); if (!t || t.disabled) return;
  if (t.dataset.back !== undefined) return back();
  if (t.dataset.tx) return go('tx', { id: t.dataset.tx });
  if (t.dataset.sheet) return openSheet(t.dataset.sheet, { ...t.dataset });
  if (t.dataset.toast) return toast(t.dataset.toast);
  if (t.dataset.go) go(t.dataset.go);
});
// the showcase page drives the embedded prototype with messages
window.addEventListener('message', e => { const m = e.data; if (!m || !m.pulse) return;
  if (m.pulse === 'go' && SCREENS[m.screen]) { if (topScreen()?.name === m.screen && !m.force) return; busy = false; if (!SCREENS[m.screen].tab && m.screen !== 'onboard' && !SCREENS[stack[0].name].tab) rootSwitch('home', {}); go(m.screen, m.params || (m.screen === 'tx' ? { id: S.tx.find(t => t.d === TODAY).id } : {})); }
  if (m.pulse === 'theme') setTheme(m.theme); });
window.addEventListener('resize', () => placeInd(true));

/* ---------- boot ---------- */
(function boot() {
  const html = document.documentElement;
  const framed = EMBED || matchMedia('(min-width: 600px)').matches;
  html.classList.toggle('framed', framed); html.classList.toggle('embed', EMBED); html.classList.toggle('still', STILL);
  let mode = Q.get('theme'); if (!mode) try { mode = localStorage.getItem('pulse-theme'); } catch (_) {}
  mode = mode || 'dark'; S.themeMode = mode; S.theme = mode === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : mode;
  html.dataset.theme = S.theme; $('meta[name="theme-color"]').content = S.theme === 'light' ? '#f1edff' : '#120c2b';
  $$('[data-i]', tabsEl).forEach(b => b.innerHTML = icon(b.dataset.i));
  // the intro plays on a first visit; after that Pulse opens on the dashboard
  let seen = false; try { seen = localStorage.getItem('pulse-seen') === '1'; localStorage.setItem('pulse-seen', '1'); } catch (_) {}
  const start = Q.get('screen') || (seen && !EMBED ? 'home' : 'onboard'), def = SCREENS[start] ? start : 'onboard', params = Object.fromEntries(Q);
  if (SCREENS[def].tab || def === 'onboard') rootSwitch(def, params);
  else { hist.on = false; rootSwitch(def === 'link' ? 'onboard' : 'home', {}); push(def, def === 'tx' && !params.id ? { id: S.tx.find(t => t.d === TODAY).id } : params, true); hist.on = !EMBED; }
  if (Q.get('sheet')) openSheet(Q.get('sheet'), { id: S.tx.find(t => t.d === TODAY).id, key: Q.get('key') || 'food' });
  if (Q.get('page')) { const pg = $('.pages'); if (pg) { pg.style.scrollBehavior = 'auto'; pg.scrollLeft = +Q.get('page') * pg.clientWidth; } }
  requestAnimationFrame(() => placeInd(true));
  document.fonts?.ready.then(() => placeInd(true));
})();
