// Pulse prototype: state, derived numbers, and the twelve screens. Each screen is { html(params), mount(el, params) }.
const D = window.PULSE_DATA;
const TODAY = D.today.d, DIM = D.today.daysInMonth, OCT_TOTAL = 1459.77;
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WDF = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const S = {
  tx: D.tx.map((t, i) => ({ ...t, card: i % 7 < 5 ? 'debit' : 'credit' })),
  cats: D.cats, budgets: Object.fromEntries(D.cats.map(c => [c.key, c.budget])),
  goals: D.goals.map(g => ({ ...g })), subs: D.subs.map(s => ({ ...s, remind: true })), cards: D.cards.map(c => ({ ...c })),
  month: 'nov', theme: 'dark', themeMode: 'dark',
  set: { daily: true, bills: true, over: true, face: true },
};

const sum = a => Math.round(a.reduce((s, v) => s + v, 0) * 100) / 100;
const cat = k => S.cats.find(c => c.key === k);
const wd = d => (d - 1) % 7;                                   // 1 November 2026 is a Sunday
const dayLabel = d => d === TODAY ? 'Today' : d === TODAY - 1 ? 'Yesterday' : `${WD[wd(d)]} ${d} Nov`;
const spent = () => sum(S.tx.map(t => t.amt));
const catTotals = (month = 'nov') => S.cats.map(c => { const rows = S.tx.filter(t => t.cat === c.key); return { ...c, value: month === 'oct' ? c.oct : sum(rows.map(t => t.amt)), count: rows.length, budget: S.budgets[c.key] }; });
const dayTotals = () => Array.from({ length: TODAY }, (_, i) => sum(S.tx.filter(t => t.d === i + 1).map(t => t.amt)));
const budgetTotal = () => sum(Object.values(S.budgets));
const cv = k => `--c:var(--c-${k})`;

const txRow = (t, d, sub) => `<button class="row glass tap rise" style="--d:${d};${cv(t.cat)}" data-tx="${t.id}"><span class="tile">${icon(cat(t.cat).icon)}</span><span class="rt"><b>${t.name}</b><small class="soft">${sub === 'cat' ? cat(t.cat).name : t.at}, ${t.t}</small></span><span class="a num">-${money(t.amt)}</span></button>`;
const navBar = (title, right = '') => `<header class="nav"><button class="round glass" data-back aria-label="Back">${icon('back')}</button><h1>${title}</h1><span class="navr">${right}</span></header>`;
const tubeBar = (p, over) => `<div class="bar ${over ? 'over' : ''}"><i style="--w:${Math.min(100, p * 100).toFixed(1)}%"></i></div>`;

const SCREENS = {};

/* ------------------------------------------------------------------ 1. Onboarding */
SCREENS.onboard = {
  bar: false, aurora: 'onboard',
  html() {
    const codes = [['CARD*4417 POS 0412', '4.80', 4, 14, -6], ['PMT 99812 GRNWY', '62.10', 44, 78, 5], ['TRX 5521 CTYRD', '7.40', 0, 142, 3], ['DEBIT 7731 ORB', '12.00', 62, 206, -5], ['POS 0931 LMN', '5.20', 10, 270, 5]];
    const tx = S.tx.filter(t => t.d === TODAY);
    const cats = catTotals();
    return `<button class="skip link" data-go="home">Skip</button>
    <div class="pages">
      <section class="page"><div class="art a1">${codes.map(([n, a, x, y, r], i) => `<div class="code glass" style="left:${x}px;top:${y}px;--r:${r}deg;--i:${i}"><span class="tile grey">?</span><b>${n}</b><span class="num">-${a}</span></div>`).join('')}</div>
        <h1>Where did my money go?</h1><p class="soft">A bank statement is a wall of codes. Pulse turns it into plain answers.</p></section>
      <section class="page"><div class="art a2"><div class="pcard"><div class="r1"><span class="logo"><i>${icon('pulse')}</i>Pulse</span><span>•••• 4417</span></div><div class="beam"></div></div>
        ${tx.map((t, i) => `<div class="sorted glass" style="--i:${i};${cv(t.cat)}"><span class="tile">${icon(cat(t.cat).icon)}</span><b>${t.name}</b><span class="num">-${fmt(t.amt)}</span></div>`).join('')}</div>
        <h1>Pulse reads your card and sorts every spend.</h1><p class="soft">Link a card once. Every coffee, every taxi, counted and filed for you.</p></section>
      <section class="page"><div class="art a3"><div class="ring">${donut(cats, { size: 236, width: 32, gap: 5 })}<div class="mid"><b class="num">34%</b><span class="soft">on food</span></div></div>
        <div class="tags">${cats.slice(0, 4).map((c, i) => `<span class="tag glass" style="--i:${i};${cv(c.key)}"><i></i>${c.short}</span>`).join('')}</div></div>
        <h1>Know where it goes.</h1><p class="soft">See the month at a glance, set budgets that hold, and catch bills before they land.</p></section>
    </div>
    <div class="obfoot"><div class="dots"><i class="on"></i><i></i><i></i></div><button class="btn primary" data-next>Next</button></div>`;
  },
  mount(el) {
    const pages = $('.pages', el), dots = $$('.dots i', el), btn = $('[data-next]', el); let idx = 0;
    const set = i => { idx = i; dots.forEach((d, n) => d.classList.toggle('on', n === i)); btn.textContent = i === 2 ? 'Link a card' : 'Next'; $$('.page', el).forEach((p, n) => p.classList.toggle('on', n === i)); };
    pages.addEventListener('scroll', () => { const i = Math.round(pages.scrollLeft / pages.clientWidth); if (i !== idx) set(i); }, { passive: true });
    btn.addEventListener('click', () => { if (idx < 2) pages.scrollTo({ left: (idx + 1) * pages.clientWidth, behavior: 'smooth' }); else go('link'); });
    el.style.setProperty('--artz', clamp(Math.min((el.clientHeight - 420) / 330, (el.clientWidth - 40) / 320), .68, 1).toFixed(3));
    requestAnimationFrame(() => set(Math.round(pages.scrollLeft / pages.clientWidth)));
  },
};

/* ------------------------------------------------------------------ 2. Link your card */
SCREENS.link = {
  bar: false, aurora: 'link',
  html() {
    return `${navBar('')}
    <div class="scroll hasnav"><div class="lstep pick">
      <h1 class="big rise">Link a card</h1><p class="soft lead rise" style="--d:1">Pick your bank. Pulse can only read your spends. It can never move money.</p>
      ${D.banks.map((b, i) => `<button class="row glass tap rise" style="--d:${2 + i};--c:${['#ff6a4d', '#7c6cff', '#33c7a3', '#ffb020', '#b9adff'][i]}" data-bank="${b}"><span class="tile">${icon('bank')}</span><span class="rt"><b>${b}</b><small class="soft">${i < 3 ? 'Instant link' : 'Takes about a minute'}</small></span>${icon('chev', 'soft')}</button>`).join('')}
      <p class="fine soft rise" style="--d:8">${icon('lock')}Read-only access. Unlink any time in Profile.</p>
    </div>
    <div class="lstep read" hidden>
      <div class="readcard"><div class="pcard"><div class="r1"><span class="logo"><i>${icon('pulse')}</i>Pulse</span><span>•••• 4417</span></div><div class="r2"><small>Northwind Bank</small><b>Everyday debit</b></div><div class="beam"></div></div></div>
      <h1 class="big">Reading your card</h1>
      <ul class="steps">
        <li><i>${icon('check')}</i><span>Connected to <b class="bankname">Northwind Bank</b></span></li>
        <li><i>${icon('check')}</i><span><b class="num cnt">0</b> spends found in November</span></li>
        <li><i>${icon('check')}</i><span>Sorted into 5 categories</span></li>
      </ul>
      <div class="sortchips">${S.cats.map((c, i) => `<span class="tag glass" style="--i:${i};${cv(c.key)}"><i></i>${c.short}</span>`).join('')}</div>
      <button class="btn primary full" data-done disabled>See my November</button>
    </div></div>`;
  },
  mount(el) {
    const pick = $('.pick', el), read = $('.read', el);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-bank]'); if (!b) return;
      $('.bankname', el).textContent = b.dataset.bank; $('.r2 small', el).textContent = b.dataset.bank;
      pick.classList.add('out');
      setTimeout(() => { pick.hidden = true; read.hidden = false; requestAnimationFrame(() => read.classList.add('go')); run(); }, 320);
    });
    const run = () => {
      const li = $$('.steps li', el), cnt = $('.cnt', el), n = S.tx.length, quick = reduceMotion() ? 0.05 : 1;
      setTimeout(() => li[0].classList.add('ok'), 700 * quick);
      setTimeout(() => { li[1].classList.add('ok'); cnt.dataset.count = n; cnt.dataset.dec = 0; cnt.dataset.dur = 1100; countUp(cnt); }, 1300 * quick);
      setTimeout(() => { li[2].classList.add('ok'); read.classList.add('filed'); }, 2700 * quick);
      setTimeout(() => { read.classList.add('done'); $('[data-done]', el).disabled = false; }, 3400 * quick);
    };
    $('[data-done]', el).addEventListener('click', () => go('home'));
  },
};

/* ------------------------------------------------------------------ 3. Dashboard */
SCREENS.home = {
  tab: 'home', aurora: 'home',
  html() {
    const total = spent(), cats = catTotals(), top = cats.reduce((a, b) => b.value > a.value ? b : a), left = budgetTotal() - total;
    const less = (OCT_TOTAL - total) / OCT_TOTAL, g = S.goals[0];
    // today as the ad shows it, morning first; anything added by hand goes on top
    const today = S.tx.filter(t => t.d === TODAY).sort((a, b) => (b.id[0] === 'n') - (a.id[0] === 'n') || parseInt(a.t) * 60 + +a.t.split(':')[1] - parseInt(b.t) * 60 - +b.t.split(':')[1]);
    const perDay = Math.max(0, left) / (DIM - TODAY), nextBill = S.subs[0];
    return `<div class="scroll">
      <div class="top rise"><button class="ava" data-go="profile" aria-label="Profile">M</button><div class="who"><small class="soft">Good evening</small><b>${D.user.name}</b></div><button class="round glass" data-sheet="notif" aria-label="Notifications">${icon('bell')}<i class="dot"></i></button></div>
      <div class="hero rise" style="--d:1"><div class="lbl soft">Spent in November</div><div class="amt num" data-count="${total}" data-pre="$" data-split>${moneyParts(total)}</div>
        <span class="chip ${less >= 0 ? 'good' : 'bad'}">${icon(less >= 0 ? 'down' : 'up')}${Math.abs(Math.round(less * 100))}% ${less >= 0 ? 'less' : 'more'} than October</span></div>
      <button class="ringcard glass tap rise" style="--d:2" data-go="categories" aria-label="Categories"><div class="ring">${donut(cats)}<div class="mid"><b class="num" data-count="${Math.round(top.value / total * 100)}" data-dec="0" data-suf="%" data-delay="450">${Math.round(top.value / total * 100)}%</b><span class="soft">on ${top.short.toLowerCase()}</span></div></div>
        <ul class="legend">${cats.map(c => `<li style="${cv(c.key)}"><i></i><span>${c.short}</span><b class="num">${Math.round(c.value / total * 100)}%</b></li>`).join('')}</ul></button>
      <div class="duo rise" style="--d:3">
        <button class="mini glass tap" data-go="budgets"><small class="soft">Left to spend</small><b class="num big">${moneyParts(Math.abs(left))}</b>${tubeBar(total / budgetTotal(), left < 0)}<small class="soft">${left >= 0 ? `${money(Math.floor(perDay), 0)} a day for ${DIM - TODAY} days` : 'Over budget'}</small></button>
        <button class="mini glass tap" data-go="subs"><small class="soft">Next bill</small><b class="big2">${nextBill.name}</b><span class="when">${icon('cal')}in ${DIM - TODAY + nextBill.day} days</span><small class="soft num">${money(nextBill.amt)}</small></button>
      </div>
      <div class="sec rise" style="--d:4"><h2>Today</h2><button class="link" data-go="transactions">See all</button></div>
      ${today.slice(0, 5).map((t, i) => txRow(t, 5 + i, 'cat')).join('')}
      <div class="sec rise" style="--d:9"><h2>Worth a look</h2></div>
      <button class="wide glass tap rise" style="--d:10" data-go="goals"><div class="gring">${ring(g.saved / g.target, { size: 64, width: 9 })}<b class="num">${Math.round(g.saved / g.target * 100)}%</b></div><span class="rt"><b>${g.name}</b><small class="soft">${money(g.saved, 0)} of ${money(g.target, 0)}, on track for ${g.by}</small></span>${icon('chev', 'soft')}</button>
      <button class="wide glass tap rise" style="--d:11" data-go="insights"><span class="tile" style="--c:var(--c-home)">${icon('spark')}</span><span class="rt"><b>${insightDay().title}</b><small class="soft">${insightDay().short}</small></span>${icon('chev', 'soft')}</button>
    </div>`;
  },
};

/* ------------------------------------------------------------------ 4. Categories */
SCREENS.categories = {
  tab: 'categories', aurora: 'categories',
  html() {
    const cats = catTotals(S.month), total = sum(cats.map(c => c.value)), mName = S.month === 'oct' ? 'October' : 'November';
    return `<div class="scroll">
      <div class="bhead rise"><h1>Categories</h1><div class="segc glass" data-seg="month"><button data-v="oct" class="${S.month === 'oct' ? 'on' : ''}">Oct</button><button data-v="nov" class="${S.month === 'nov' ? 'on' : ''}">Nov</button></div></div>
      <div class="bigring rise" style="--d:1"><div class="spin">${donut(cats, { size: 272, width: 36, gap: 5 })}</div><i class="notch"></i>
        <div class="mid"><span class="tile"></span><small class="soft nm"></small><b class="num val"></b><small class="soft sh"></small></div></div>
      <p class="hint soft rise" style="--d:2">${icon('swap')}Turn the ring or tap a slice</p>
      <div class="catlist">${cats.map((c, i) => { const d = c.oct ? (catTotals('nov')[i].value - c.oct) / c.oct : 0;
        return `<button class="crow glass tap rise" style="--d:${3 + i};${cv(c.key)}" data-cat="${c.key}"><span class="tile">${icon(c.icon)}</span><span class="rt"><b>${c.name}</b><small class="soft">${S.month === 'oct' ? 'October total' : c.count + ' spends'}</small><span class="bar"><i style="--w:${(c.value / cats[0].value * 100).toFixed(1)}%"></i></span></span><span class="cr"><b class="num">${money(c.value)}</b>${S.month === 'nov' ? `<small class="${d <= 0 ? 'goodt' : 'badt'}">${icon(d <= 0 ? 'down' : 'up')}${Math.abs(Math.round(d * 100))}%</small>` : `<small class="soft">${Math.round(c.value / total * 100)}%</small>`}</span></button>`; }).join('')}</div>
      <p class="fine soft rise" style="--d:9">${mName} total ${money(total)}. Arrows compare with October.</p>
    </div>`;
  },
  mount(el) {
    const cats = catTotals(S.month), total = sum(cats.map(c => c.value)), spin = $('.spin', el), ringEl = $('.bigring', el), mid = $('.mid', ringEl);
    let sel = -1, rot = 0;
    const mids = $$('.seg', el).map(s => parseFloat(s.style.getPropertyValue('--mid')));
    const select = (i, animate = true) => {
      sel = i; const c = cats[i];
      // shortest way round so the slice lands under the notch
      let target = -mids[i]; while (target - rot > 180) target -= 360; while (target - rot < -180) target += 360; rot = target;
      spin.style.transition = animate ? '' : 'none'; spin.style.transform = `rotate(${rot}deg)`;
      $$('.seg', el).forEach((s, n) => s.classList.toggle('dim', n !== i));
      $$('.crow', el).forEach((r, n) => r.classList.toggle('sel', n === i));
      mid.classList.remove('swap'); void mid.offsetWidth; mid.classList.add('swap');
      $('.tile', mid).innerHTML = icon(c.icon); $('.tile', mid).style.cssText = cv(c.key);
      $('.nm', mid).textContent = c.name; $('.val', mid).innerHTML = moneyParts(c.value); $('.sh', mid).textContent = `${Math.round(c.value / total * 100)}% of ${S.month === 'oct' ? 'October' : 'November'}`;
    };
    select(0, false);
    // turn the ring with a finger; it settles on the nearest slice
    let a0 = 0, r0 = 0; const ang = e => { const b = ringEl.getBoundingClientRect(); return Math.atan2(e.clientY - b.top - b.height / 2, e.clientX - b.left - b.width / 2) * 180 / Math.PI; };
    drag(ringEl, {
      start(e) { a0 = ang(e); r0 = rot; },
      move(dx, dy, e) { let d = ang(e) - a0; if (d > 180) d -= 360; if (d < -180) d += 360; rot = r0 + d; spin.style.transition = 'none'; spin.style.transform = `rotate(${rot}deg)`; },
      end() { const top = ((-rot % 360) + 360) % 360; let best = 0, bd = 999; mids.forEach((m, i) => { const d = Math.min(Math.abs(m - top), 360 - Math.abs(m - top)); if (d < bd) { bd = d; best = i; } }); select(best); },
      tap(e) { const k = e.target.closest?.('.seg')?.dataset.key; if (k) select(cats.findIndex(c => c.key === k)); },
    }, { slop: 6 });
    seg($('.segc', el), v => { S.month = v; refresh(el, true); });
    el.addEventListener('click', e => { const r = e.target.closest('[data-cat]'); if (r) go('transactions', { cat: r.dataset.cat }); });
  },
  leave() { S.month = 'nov'; },
};

/* ------------------------------------------------------------------ 5. Transactions */
SCREENS.transactions = {
  aurora: 'transactions',
  html(p = {}) {
    return `${navBar('Transactions')}
    <div class="scroll hasnav">
      <label class="search glass rise">${icon('search')}<input type="search" placeholder="Search ${S.tx.length} spends" autocomplete="off" enterkeyhint="search"></label>
      <div class="chips rise" style="--d:1"><button class="fchip glass ${!p.cat ? 'on' : ''}" data-f="">All</button>${S.cats.map(c => `<button class="fchip glass ${p.cat === c.key ? 'on' : ''}" data-f="${c.key}" style="${cv(c.key)}"><i></i>${c.short}</button>`).join('')}</div>
      <div class="txlist"></div>
    </div>`;
  },
  mount(el, p = {}) {
    const list = $('.txlist', el), input = $('input', el); let f = p.cat || '', q = '';
    const draw = first => {
      const rows = S.tx.filter(t => (!f || t.cat === f) && (!q || (t.name + ' ' + t.at + ' ' + cat(t.cat).name).toLowerCase().includes(q)));
      const days = [...new Set(rows.map(t => t.d))]; let n = 2;
      list.innerHTML = rows.length ? `<div class="tally rise" style="--d:2"><span class="soft">${rows.length} spends</span><b class="num">-${money(sum(rows.map(t => t.amt)))}</b></div>` + days.map(d => { const r = rows.filter(t => t.d === d);
        return `<div class="day rise" style="--d:${Math.min(++n, 12)}"><b>${dayLabel(d)}</b><span class="num soft">-${money(sum(r.map(t => t.amt)))}</span></div>` + r.map(t => txRow(t, Math.min(++n, 12))).join(''); }).join('')
        : `<div class="empty rise"><span class="tile grey">${icon('search')}</span><b>No spends match</b><small class="soft">Try a place, a category or a shorter word.</small></div>`;
      if (!first) { list.classList.remove('swap'); void list.offsetWidth; list.classList.add('swap'); }
    };
    draw(true);
    input.addEventListener('input', () => { q = input.value.trim().toLowerCase(); draw(); });
    $('.chips', el).addEventListener('click', e => { const b = e.target.closest('.fchip'); if (!b) return; f = b.dataset.f; p.cat = f; $$('.fchip', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const on = $('.fchip.on', el); if (on) requestAnimationFrame(() => on.scrollIntoView({ inline: 'center', block: 'nearest' }));
  },
};

/* ------------------------------------------------------------------ 6. Transaction detail */
SCREENS.tx = {
  bar: false, aurora: 'tx',
  html(p) {
    const t = S.tx.find(x => x.id === p.id), c = cat(t.cat), same = S.tx.filter(x => x.at === t.at), card = S.cards.find(x => x.key === t.card);
    const per = Array.from({ length: TODAY }, (_, i) => sum(same.filter(x => x.d === i + 1).map(x => x.amt))), mx = Math.max(...per, 1);
    return `${navBar('', `<button class="round glass" data-toast="Receipt saved to Files" aria-label="Save receipt">${icon('download')}</button>`)}
    <div class="scroll hasnav">
      <div class="txhero rise" style="${cv(t.cat)}"><span class="tile xl">${icon(c.icon)}</span><h1>${t.name}</h1><div class="soft at">${t.at}</div><div class="amt num">-${moneyParts(t.amt)}</div>
        <button class="chip catchip" data-sheet="pickcat" data-id="${t.id}"><i></i>${c.name}${icon('chevd')}</button></div>
      <div class="glass info rise" style="--d:1">
        <div><span class="soft">${icon('cal')}Date</span><b>${t.d === TODAY ? 'Today' : WDF[wd(t.d)]}, ${t.d} November</b></div>
        <div><span class="soft">${icon('clock')}Time</span><b class="num">${t.t}</b></div>
        <div><span class="soft">${icon('card')}Card</span><b>${card.bank} •• ${card.last4}</b></div>
        <div><span class="soft">${icon('spark')}Sorted</span><b>${t.moved ? 'By you' : t.sub ? 'By Pulse, as a subscription' : 'By Pulse'}</b></div>
      </div>
      <div class="glass place rise" style="--d:2;${cv(t.cat)}"><h2>${t.at} in November</h2>
        <div class="pstats"><div><b class="num">${same.length}</b><small class="soft">${same.length === 1 ? 'visit' : 'visits'}</small></div><div><b class="num">${money(sum(same.map(x => x.amt)))}</b><small class="soft">in total</small></div><div><b class="num">${money(sum(same.map(x => x.amt)) / same.length)}</b><small class="soft">on average</small></div></div>
        <div class="vbars">${per.map((v, i) => `<i class="${i + 1 === t.d ? 'cur' : ''} ${v ? '' : 'nil'}" style="--h:${v ? Math.max(14, v / mx * 100) : 6}%;--i:${i}"></i>`).join('')}</div>
        <div class="vaxis soft"><span>1 Nov</span><span>${TODAY} Nov</span></div></div>
      <div class="acts rise" style="--d:3"><button class="act glass tap" data-sheet="split" data-id="${t.id}">${icon('split')}Split</button><button class="act glass tap ${t.rec || t.sub ? 'on' : ''}" data-rec="${t.id}">${icon('repeat')}Recurring</button><button class="act glass tap" data-toast="Thanks. Pulse will check this spend.">${icon('warn')}Report</button></div>
    </div>`;
  },
  mount(el, p) {
    el.addEventListener('click', e => { const b = e.target.closest('[data-rec]'); if (!b) return; const t = S.tx.find(x => x.id === p.id); t.rec = !(t.rec || t.sub); t.sub = false; b.classList.toggle('on', t.rec); toast(t.rec ? 'Marked as recurring' : 'No longer recurring'); });
  },
};

/* ------------------------------------------------------------------ 7. Budgets */
SCREENS.budgets = {
  tab: 'budgets', aurora: 'budgets',
  html() {
    const total = spent(), b = budgetTotal(), left = b - total, cats = catTotals(), perDay = Math.max(0, left) / (DIM - TODAY);
    return `<div class="scroll">
      <div class="bhead rise"><h1>Budgets</h1><span class="chip plain glass">${icon('cal')}${DIM - TODAY} days left</span></div>
      <div class="left glass rise" style="--d:1"><div class="lbl soft">${left >= 0 ? 'Left to spend' : 'Over budget by'}</div><div class="amt num" data-count="${Math.abs(left)}" data-pre="$" data-split>${moneyParts(Math.abs(left))}</div>
        <div class="tube ${left < 0 ? 'over' : ''}"><i style="--w:${Math.min(100, total / b * 100).toFixed(1)}%"></i><em style="left:${(TODAY / DIM * 100).toFixed(1)}%"></em></div>
        <div class="facts"><span>${money(total)} of ${money(b, 0)}</span><span class="soft">${left >= 0 ? `${money(Math.floor(perDay), 0)} a day for ${DIM - TODAY} days` : 'Ease off this week'}</span></div></div>
      <div class="sec rise" style="--d:2"><h2>By category</h2><span class="soft small">Tap to change</span></div>
      ${cats.map((c, i) => { const over = c.value > c.budget;
        return `<button class="brow glass tap rise ${over ? 'over' : ''}" style="--d:${3 + i};${cv(c.key)}" data-sheet="editbudget" data-key="${c.key}"><span class="tile">${icon(c.icon)}</span><span class="rt"><span class="l1"><b>${c.name}</b><span class="num">${over ? 'Over by ' + money(c.value - c.budget) : money(c.value) + ` <em>of ${money(c.budget, 0)}</em>`}</span></span>${tubeBar(c.value / c.budget, over)}</span></button>`; }).join('')}
      <button class="wide glass tap rise" style="--d:9" data-go="subs"><span class="tile" style="--c:var(--c-out)">${icon('repeat')}</span><span class="rt"><b>Subscriptions and bills</b><small class="soft">${S.subs.length} found, ${money(sum(S.subs.map(s => s.amt)))} a month</small></span>${icon('chev', 'soft')}</button>
      <button class="wide glass tap rise" style="--d:10" data-go="goals"><span class="tile" style="--c:var(--c-transport)">${icon('target')}</span><span class="rt"><b>Savings goals</b><small class="soft">${money(sum(S.goals.map(g => g.saved)), 0)} saved across ${S.goals.length} goals</small></span>${icon('chev', 'soft')}</button>
    </div>`;
  },
};

/* ------------------------------------------------------------------ 8. Insights */
function insightDay() {
  const days = dayTotals(), by = Array.from({ length: 7 }, () => []); days.forEach((v, i) => by[wd(i + 1)].push(v));
  const avg = by.map(a => a.length ? sum(a) / a.length : 0), mx = avg.indexOf(Math.max(...avg)), usual = sum(days) / days.length;
  return { idx: mx, avg, title: `${WDF[mx]}s cost you most`, short: `${money(avg[mx], 0)} on average, ${money(avg[mx] - usual, 0)} above a usual day`, usual };
}
SCREENS.insights = {
  tab: 'insights', aurora: 'insights',
  html() {
    const days = dayTotals(), total = spent(), last7 = days.slice(-7), mx7 = Math.max(...last7), pace = total / TODAY * DIM, b = budgetTotal();
    const iday = insightDay(), coffees = S.tx.filter(t => t.name === 'Coffee'), cats = catTotals(), overCat = cats.filter(c => c.value > c.budget)[0];
    const places = Object.values(S.tx.reduce((m, t) => { (m[t.at] ||= { at: t.at, cat: t.cat, n: 0, v: 0 }); m[t.at].n++; m[t.at].v += t.amt; return m; }, {})).sort((a, b) => b.v - a.v).slice(0, 5);
    // cumulative: November so far against October
    const W = 318, H = 150, X = d => 4 + (d - 1) / (DIM - 1) * (W - 8), Y = v => H - 8 - v / Math.max(b, pace, OCT_TOTAL) * (H - 22);
    let a = 0; const nov = days.map((v, i) => [X(i + 1), Y(a += v)]); a = 0; const oct = D.octDays.slice(0, DIM).map((v, i) => [X(i + 1), Y(a += v)]);
    const [tx, ty] = nov[nov.length - 1];
    const cards = [
      { c: 'home', i: 'cal', t: iday.title, s: iday.short + '.', bars: iday.avg },
      { c: 'food', i: 'coffee', t: `${coffees.length} coffees, ${money(sum(coffees.map(t => t.amt)))}`, s: `That is ${money(sum(coffees.map(t => t.amt)) / coffees.length)} a cup. Brewing at home three days a week would save about ${money(sum(coffees.map(t => t.amt)) / coffees.length * 12, 0)} a month.` },
      overCat ? { c: overCat.key, i: 'warn', t: `${overCat.name} is over budget`, s: `${money(overCat.value - overCat.budget)} past your ${money(overCat.budget, 0)} limit with ${DIM - TODAY} days to go. Taxis make up most of it.` } : { c: 'transport', i: 'check', t: 'Every budget is holding', s: 'Nothing is over its limit this month.' },
    ];
    return `<div class="scroll">
      <div class="bhead rise"><h1>Insights</h1><span class="chip plain glass">${icon('spark')}Updated today</span></div>
      <div class="glass pacecard rise" style="--d:1"><div class="l1"><div><small class="soft">On pace for</small><b class="num big" data-count="${pace}" data-pre="$" data-dec="0">${money(pace, 0)}</b></div><span class="chip ${pace <= b ? 'good' : 'bad'}">${icon(pace <= b ? 'check' : 'warn')}${money(Math.abs(b - pace), 0)} ${pace <= b ? 'under' : 'over'} budget</span></div>
        <div class="linechart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a4d" stop-opacity=".38"/><stop offset="1" stop-color="#ff6a4d" stop-opacity="0"/></linearGradient></defs>
          <path class="budgetline" d="M0 ${Y(b)}H${W}"/>
          <path class="octline" pathLength="1" d="${smooth(oct)}"/>
          <path class="area" d="${smooth(nov)}L${tx} ${H}L${nov[0][0]} ${H}Z" fill="url(#lg)"/>
          <path class="fore" d="M${tx} ${ty}L${X(DIM)} ${Y(pace)}"/>
          <path class="novline" pathLength="1" d="${smooth(nov)}"/>
          <circle class="halo" cx="${tx}" cy="${ty}" r="6"/><circle class="now" cx="${tx}" cy="${ty}" r="6"/></svg>
          <span class="tagb" style="top:${Y(b) / H * 100}%">Budget ${money(b, 0)}</span></div>
        <div class="lkey"><span><i class="k1"></i>November</span><span><i class="k2"></i>October</span><span><i class="k3"></i>Forecast</span></div></div>
      <div class="glass weekcard rise" style="--d:2"><div class="l1"><div><small class="soft wlab">Today</small><b class="num big wval">${money(last7[6])}</b></div><small class="soft">Last 7 days</small></div>
        <div class="bars">${last7.map((v, i) => `<button class="bcol ${i === 6 ? 'on' : ''}" data-v="${v}" data-l="${dayLabel(TODAY - 6 + i)}"><span><i style="--h:${Math.max(6, v / mx7 * 100).toFixed(1)}%;--i:${i}"></i></span><small>${WD[wd(TODAY - 6 + i)]}</small></button>`).join('')}</div></div>
      <div class="sec rise" style="--d:3"><h2>Pulse noticed</h2><div class="dots cdots"><i class="on"></i><i></i><i></i></div></div>
      <div class="carousel rise" style="--d:4">${cards.map(k => `<article class="icard glass" style="${cv(k.c)}"><span class="tile">${icon(k.i)}</span><b>${k.t}</b><p class="soft">${k.s}</p>${k.bars ? `<div class="wbars">${k.bars.map((v, i) => `<span class="${i === iday.idx ? 'hi' : ''}"><i style="--h:${(v / Math.max(...k.bars) * 100).toFixed(0)}%"></i><small>${WD[i][0]}</small></span>`).join('')}</div>` : ''}</article>`).join('')}</div>
      <div class="sec rise" style="--d:5"><h2>Where it went</h2></div>
      <div class="glass places rise" style="--d:6">${places.map(p => `<div class="prow" style="${cv(p.cat)}"><span class="l1"><b>${p.at}</b><span class="num">${money(p.v)}</span></span><span class="bar"><i style="--w:${(p.v / places[0].v * 100).toFixed(1)}%"></i></span><small class="soft">${p.n} ${p.n === 1 ? 'spend' : 'spends'}, ${cat(p.cat).name.toLowerCase()}</small></div>`).join('')}</div>
    </div>`;
  },
  mount(el) {
    $('.bars', el).addEventListener('click', e => { const b = e.target.closest('.bcol'); if (!b) return; $$('.bcol', el).forEach(x => x.classList.toggle('on', x === b)); $('.wlab', el).textContent = b.dataset.l; const v = $('.wval', el), from = parseFloat(v.dataset.count || v.textContent.replace(/[$,]/g, '')); v.dataset.count = b.dataset.v; v.dataset.pre = '$'; v.dataset.dur = 450; countUp(v, from); });
    const car = $('.carousel', el), dots = $$('.cdots i', el);
    car.addEventListener('scroll', () => { const i = Math.round(car.scrollLeft / (car.firstElementChild.offsetWidth + 12)); dots.forEach((d, n) => d.classList.toggle('on', n === i)); }, { passive: true });
  },
};

/* ------------------------------------------------------------------ 9. Subscriptions and bills */
SCREENS.subs = {
  aurora: 'subs',
  html() {
    const total = sum(S.subs.map(s => s.amt)), until = s => DIM - TODAY + s.day;
    const strip = Array.from({ length: 14 }, (_, i) => { const day = TODAY + 1 + i, dec = day > DIM, n = dec ? day - DIM : day; return { n, w: WD[(wd(TODAY) + 1 + i) % 7], subs: S.subs.filter(s => dec && s.day === n) }; });
    return `${navBar('Subscriptions and bills')}
    <div class="scroll hasnav">
      <div class="subhero rise"><div class="lbl soft">Pulse found ${S.subs.length} regular payments</div><div class="amt num" data-count="${total}" data-pre="$" data-split>${moneyParts(total)}</div><div class="soft per">a month, ${money(total * 12, 0)} a year</div></div>
      <div class="glass stripcard rise" style="--d:1"><h2>Next two weeks</h2><div class="strip">${strip.map(d => `<span class="sday ${d.subs.length ? 'has' : ''}" ${d.subs.length ? `style="--c:${d.subs[0].color}"` : ''}><small>${d.w[0]}</small><b class="num">${d.n}</b><i></i></span>`).join('')}</div></div>
      <div class="sec rise" style="--d:2"><h2>Coming up</h2><span class="soft small">Remind me</span></div>
      ${S.subs.map((s, i) => `<div class="srow glass rise" style="--d:${3 + i};--c:${s.color}"><span class="tile">${s.name[0]}</span><span class="rt"><b>${s.name}</b><small class="soft">${s.what}</small><small class="soft">${s.day} Dec, in ${until(s)} days</small>${s.note ? `<small class="badt">${icon('up')}${s.note}</small>` : ''}</span><span class="cr"><b class="num">${money(s.amt)}</b><button class="switch ${s.remind ? 'on' : ''}" role="switch" aria-checked="${s.remind}" aria-label="Remind me about ${s.name}" data-sub="${i}"><i></i></button></span></div>`).join('')}
      <p class="fine soft rise" style="--d:9">${icon('spark')}Pulse spots a payment as regular after it repeats twice.</p>
    </div>`;
  },
  mount(el) {
    el.addEventListener('click', e => { const b = e.target.closest('[data-sub]'); if (!b) return; const s = S.subs[+b.dataset.sub]; s.remind = !s.remind; b.classList.toggle('on', s.remind); b.setAttribute('aria-checked', s.remind); toast(s.remind ? `Reminder on for ${s.name}` : `Reminder off for ${s.name}`); });
  },
};

/* ------------------------------------------------------------------ 10. Savings goals */
SCREENS.goals = {
  aurora: 'goals',
  html() {
    const saved = sum(S.goals.map(g => g.saved)), target = sum(S.goals.map(g => g.target));
    const tone = { '#ff6a4d': ['#ff9a6c', '#ff4d6d'], '#7c6cff': ['#a79bff', '#6a58ff'], '#33c7a3': ['#6ff0cf', '#22b392'] };
    return `${navBar('Savings goals')}
    <div class="scroll hasnav">
      <div class="subhero rise"><div class="lbl soft">Saved so far</div><div class="amt num gtotal" data-count="${saved}" data-pre="$" data-split>${moneyParts(saved)}</div><div class="soft per">of ${money(target, 0)} across ${S.goals.length} goals</div></div>
      ${S.goals.map((g, i) => { const p = g.saved / g.target, [a, b] = tone[g.color];
        return `<div class="goal glass rise" style="--d:${1 + i};--c:${g.color}" data-goal="${i}"><div class="gring big">${ring(p, { size: 96, width: 12, a, b })}<span class="gi">${icon(g.icon)}</span></div>
          <div class="gbody"><b class="gn">${g.name}</b><div class="gv"><b class="num gsaved">${money(g.saved, 0)}</b><span class="soft"> of ${money(g.target, 0)}</span></div><small class="soft gnote">${p >= 1 ? 'Goal reached' : `${money(g.weekly, 0)} a week gets you there by ${g.by}`}</small></div>
          <button class="btn small ${p >= 1 ? 'done' : ''}" data-add="${i}">${p >= 1 ? icon('check') + 'Done' : icon('plus') + money(g.weekly, 0)}</button></div>`; }).join('')}
      <div class="glass tip rise" style="--d:5"><span class="tile" style="--c:var(--c-transport)">${icon('spark')}</span><p><b>You are ${money(Math.max(0, budgetTotal() - spent() / TODAY * DIM), 0)} under budget this month.</b><span class="soft"> Move it to a goal on 30 November and Japan comes two weeks sooner.</span></p></div>
    </div>`;
  },
  mount(el) {
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-add]'); if (!b || b.classList.contains('done')) return;
      const i = +b.dataset.add, g = S.goals[i], card = b.closest('.goal'), was = g.saved, add = Math.min(g.weekly, g.target - g.saved);
      g.saved += add; S.cards.find(c => c.key === 'savings').balance += add; S.cards.find(c => c.key === 'debit').balance -= add;
      const arc = $('.arc', card), c = parseFloat(arc.style.getPropertyValue('--c')); arc.style.setProperty('--len', (clamp(g.saved / g.target) * c).toFixed(2));
      const sv = $('.gsaved', card); sv.dataset.count = g.saved; sv.dataset.pre = '$'; sv.dataset.dec = 0; sv.dataset.dur = 700; countUp(sv, was);
      const tot = $('.gtotal', el), prev = parseFloat(tot.dataset.count); tot.dataset.count = sum(S.goals.map(x => x.saved)); tot.dataset.dur = 700; countUp(tot, prev);
      card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump');
      if (g.saved >= g.target) { b.classList.add('done'); b.innerHTML = icon('check') + 'Done'; $('.gnote', card).textContent = 'Goal reached'; }
      toast(`${money(add, 0)} moved to ${g.name}`);
    });
  },
};

/* ------------------------------------------------------------------ 11. Cards and accounts */
SCREENS.cards = {
  aurora: 'cards',
  html() {
    return `${navBar('Cards and accounts', `<button class="round glass" data-go="link" aria-label="Link a card">${icon('plus')}</button>`)}
    <div class="scroll hasnav">
      <div class="deck rise">${S.cards.map((c, i) => `<div class="bcard ${c.tone}" data-i="${i}"><div class="r1"><b>${c.bank}</b><span class="logo"><i>${icon('pulse')}</i></span></div><div class="r2"><span class="chipg"></span><span class="num">•••• ${c.last4}</span></div><div class="r3"><small>${c.kind}</small><b class="num">${c.balance < 0 ? '-' : ''}${money(c.balance)}</b></div></div>`).join('')}</div>
      <div class="dots ddots rise" style="--d:1">${S.cards.map((c, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
      <div class="cdetail"></div>
    </div>`;
  },
  mount(el) {
    const deck = $('.deck', el), cards = $$('.bcard', el), dots = $$('.ddots i', el), det = $('.cdetail', el); let idx = -1;
    const show = i => {
      if (i === idx) return; idx = i; const c = S.cards[i], rows = S.tx.filter(t => t.card === c.key), sp = sum(rows.map(t => t.amt));
      dots.forEach((d, n) => d.classList.toggle('on', n === i));
      det.innerHTML = (c.key === 'savings'
        ? `<div class="duo"><div class="mini glass"><small class="soft">In goals</small><b class="num big">${money(sum(S.goals.map(g => g.saved)), 0)}</b><small class="soft">${S.goals.length} goals</small></div><div class="mini glass"><small class="soft">Added in November</small><b class="num big">$180</b><small class="soft">4 transfers</small></div></div><button class="wide glass tap" data-go="goals"><span class="tile" style="--c:var(--c-transport)">${icon('target')}</span><span class="rt"><b>Savings goals</b><small class="soft">Japan trip is 65% there</small></span>${icon('chev', 'soft')}</button>`
        : `<div class="duo"><div class="mini glass"><small class="soft">Spent in November</small><b class="num big">${moneyParts(sp)}</b><small class="soft">${rows.length} spends</small></div><div class="mini glass"><small class="soft">${c.limit ? 'Credit used' : 'Share of spending'}</small><b class="num big">${c.limit ? Math.round(-c.balance / c.limit * 100) : Math.round(sp / spent() * 100)}%</b>${tubeBar(c.limit ? -c.balance / c.limit : sp / spent())}</div></div>
           <div class="sec"><h2>Latest on this card</h2><button class="link" data-go="transactions">See all</button></div>${rows.slice(0, 3).map((t, n) => txRow(t, n)).join('')}`)
        + `<p class="fine soft">${icon('lock')}Pulse reads this card. It cannot pay or move money.</p>`;
      det.classList.remove('swap'); void det.offsetWidth; det.classList.add('swap');
    };
    const tilt = () => { const mid = deck.scrollLeft + deck.clientWidth / 2; let best = 0, bd = 1e9;
      cards.forEach((c, i) => { const d = (c.offsetLeft + c.offsetWidth / 2 - mid) / deck.clientWidth; c.style.transform = `perspective(900px) rotateY(${clamp(d, -1, 1) * -30}deg) scale(${1 - Math.min(.12, Math.abs(d) * .15)})`; c.style.opacity = 1 - Math.min(.45, Math.abs(d) * .6); if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; } });
      show(best); };
    deck.addEventListener('scroll', tilt, { passive: true }); requestAnimationFrame(tilt);
    deck.addEventListener('click', e => { const c = e.target.closest('.bcard'); if (c) deck.scrollTo({ left: c.offsetLeft - (deck.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' }); });
  },
};

/* ------------------------------------------------------------------ 12. Profile and settings */
SCREENS.profile = {
  aurora: 'profile',
  html() {
    const sw = (k, label, sub, ic) => `<div class="setrow"><span class="tile sm" style="--c:var(--c-home)">${icon(ic)}</span><span class="rt"><b>${label}</b><small class="soft">${sub}</small></span><button class="switch ${S.set[k] ? 'on' : ''}" role="switch" aria-checked="${S.set[k]}" aria-label="${label}" data-set="${k}"><i></i></button></div>`;
    return `${navBar('Profile')}
    <div class="scroll hasnav">
      <div class="phead rise"><span class="ava xl">M</span><div><h1>${D.user.full}</h1><small class="soft">${D.user.email}</small></div></div>
      <div class="glass setcard rise" style="--d:1"><h2>Appearance</h2><div class="segc wide3" data-seg="theme"><button data-v="dark" class="${S.themeMode === 'dark' ? 'on' : ''}">${icon('moon')}Dark</button><button data-v="light" class="${S.themeMode === 'light' ? 'on' : ''}">${icon('sun')}Light</button><button data-v="auto" class="${S.themeMode === 'auto' ? 'on' : ''}">Auto</button></div></div>
      <button class="wide glass tap rise" style="--d:2" data-go="cards"><span class="tile" style="--c:var(--c-food)">${icon('card')}</span><span class="rt"><b>Cards and accounts</b><small class="soft">${S.cards.length} linked, read-only</small></span>${icon('chev', 'soft')}</button>
      <div class="glass setcard rise" style="--d:3"><h2>Notifications</h2>${sw('daily', 'Daily summary', 'Every evening at 8', 'bell')}${sw('bills', 'Bill reminders', 'Two days before a payment', 'cal')}${sw('over', 'Over-budget alerts', 'The moment a limit is crossed', 'warn')}</div>
      <div class="glass setcard rise" style="--d:4"><h2>Security and data</h2>${sw('face', 'Unlock with Face ID', 'Ask every time Pulse opens', 'face')}
        <button class="setrow tap" data-export><span class="tile sm" style="--c:var(--c-transport)">${icon('download')}</span><span class="rt"><b>Export November</b><small class="soft">${S.tx.length} spends as a CSV file</small></span>${icon('chev', 'soft')}</button>
        <div class="setrow"><span class="tile sm" style="--c:var(--c-out)">${icon('globe')}</span><span class="rt"><b>Currency</b><small class="soft">US dollar</small></span><b class="soft">USD</b></div></div>
      <button class="wide glass tap rise" style="--d:5" data-go="onboard"><span class="tile" style="--c:var(--c-out)">${icon('play')}</span><span class="rt"><b>Replay the intro</b><small class="soft">See how Pulse reads a card</small></span>${icon('chev', 'soft')}</button>
      <p class="fine soft center rise" style="--d:6">Pulse 1.0, a concept app designed and built by Numinae Studio.</p>
    </div>`;
  },
  mount(el) {
    seg($('[data-seg="theme"]', el), (v, btn) => setTheme(v, btn));
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-set]'); if (b) { const k = b.dataset.set; S.set[k] = !S.set[k]; b.classList.toggle('on', S.set[k]); b.setAttribute('aria-checked', S.set[k]); return; }
      if (e.target.closest('[data-export]')) {
        const csv = 'Date,Time,Name,Place,Category,Amount\n' + S.tx.map(t => `2026-11-${String(t.d).padStart(2, '0')},${t.t},"${t.name}","${t.at}",${cat(t.cat).name},-${t.amt.toFixed(2)}`).join('\n');
        try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'pulse-november-2026.csv'; a.click(); toast('Saved pulse-november-2026.csv'); } catch (_) { toast('Export is not available here'); }
      }
    });
  },
};

/* ------------------------------------------------------------------ Sheets */
const SHEETS = {
  notif: { html() {
    const over = catTotals().filter(c => c.value > c.budget)[0], s = S.subs[0];
    const items = [over && ['warn', over.key, `${over.name} is over budget`, `${money(over.value - over.budget)} past the limit`, 'budgets'], ['cal', 'out', `${s.name} in ${DIM - TODAY + s.day} days`, `${money(s.amt)} from Northwind •• 4417`, 'subs'], ['spark', 'home', 'Your week in one line', `${money(sum(dayTotals().slice(-7)))} spent, mostly on food`, 'insights']].filter(Boolean);
    return `<h2>Notifications</h2>${items.map(([i, c, t, d, to]) => `<button class="row glass tap" style="${cv(c)}" data-go="${to}"><span class="tile">${icon(i)}</span><span class="rt"><b>${t}</b><small class="soft">${d}</small></span>${icon('chev', 'soft')}</button>`).join('')}`; } },

  pickcat: { html(p) { const t = S.tx.find(x => x.id === p.id);
      return `<h2>Move ${t.name} to</h2><div class="catgrid">${S.cats.map(c => `<button class="cpick glass tap ${c.key === t.cat ? 'on' : ''}" style="${cv(c.key)}" data-k="${c.key}"><span class="tile">${icon(c.icon)}</span><b>${c.name}</b></button>`).join('')}</div><p class="fine soft">${icon('spark')}Pulse will remember this for ${t.at}.</p>`; },
    mount(el, p, close) { el.addEventListener('click', e => { const b = e.target.closest('.cpick'); if (!b) return; const t = S.tx.find(x => x.id === p.id), k = b.dataset.k;
      if (k !== t.cat) { S.tx.filter(x => x.at === t.at).forEach(x => { x.cat = k; x.moved = true; }); toast(`${t.at} moved to ${cat(k).name}`); }
      close(); refresh(topScreen().el, true); }); } },

  split: { html(p) { const t = S.tx.find(x => x.id === p.id);
      return `<h2>Split ${t.name}</h2><div class="stepper"><button class="round glass" data-d="-1" aria-label="Fewer people">−</button><div><b class="num ppl">2</b><small class="soft">people</small></div><button class="round glass" data-d="1" aria-label="More people">+</button></div>
      <div class="glass sres"><span class="soft">Your share</span><b class="num share">${money(t.amt / 2)}</b></div><button class="btn primary full" data-ok>Ask for ${money(t.amt / 2)} back</button>`; },
    mount(el, p, close) { const t = S.tx.find(x => x.id === p.id); let n = 2;
      const draw = () => { $('.ppl', el).textContent = n; $('.share', el).textContent = money(t.amt / n); $('[data-ok]', el).textContent = `Ask for ${money(t.amt - t.amt / n)} back`; };
      el.addEventListener('click', e => { const d = e.target.closest('[data-d]'); if (d) { n = clamp(n + +d.dataset.d, 2, 6); draw(); } if (e.target.closest('[data-ok]')) { close(); toast(`Request for ${money(t.amt - t.amt / n)} is ready to share`); } }); } },

  editbudget: { html(p) { const c = catTotals().find(x => x.key === p.key), max = Math.max(800, Math.ceil(c.value / 100) * 100 + 200);
      return `<div class="ebhead" style="${cv(c.key)}"><span class="tile">${icon(c.icon)}</span><div><h2>${c.name}</h2><small class="soft">${money(c.value)} spent so far</small></div></div>
      <div class="ebval"><b class="num">${money(c.budget, 0)}</b><small class="soft">a month</small></div>
      <input type="range" class="slider" min="50" max="${max}" step="10" value="${c.budget}" style="${cv(c.key)};--p:${(c.budget - 50) / (max - 50) * 100}%" aria-label="${c.name} budget">
      <div class="ebnote soft"></div><button class="btn primary full" data-ok>Save budget</button>`; },
    mount(el, p, close) { const c = catTotals().find(x => x.key === p.key), r = $('.slider', el), v = $('.ebval b', el), note = $('.ebnote', el);
      const draw = () => { const b = +r.value; v.textContent = money(b, 0); r.style.setProperty('--p', (b - r.min) / (r.max - r.min) * 100 + '%');
        note.innerHTML = b >= c.value ? `Leaves <b>${money((b - c.value) / (DIM - TODAY), 2)}</b> a day until 30 November.` : `<span class="badt">Already ${money(c.value - b)} over this limit.</span>`; };
      r.addEventListener('input', draw); draw();
      $('[data-ok]', el).addEventListener('click', () => { S.budgets[p.key] = +r.value; close(); refresh(topScreen().el, true); toast(`${c.name} budget set to ${money(+r.value, 0)}`); }); } },

  add: { html() {
      return `<h2>Add a spend</h2><div class="addamt"><b class="num">$0</b></div>
      <div class="chips addcats">${S.cats.map((c, i) => `<button class="fchip glass ${i ? '' : 'on'}" data-k="${c.key}" style="${cv(c.key)}"><i></i>${c.short}</button>`).join('')}</div>
      <div class="keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(k => `<button class="key glass" data-k="${k}" ${k === 'del' ? 'aria-label="Delete"' : ''}>${k === 'del' ? icon('del') : k}</button>`).join('')}</div>
      <button class="btn primary full" data-ok disabled>Add spend</button>`; },
    mount(el, p, close) { let s = '', k = S.cats[0].key; const out = $('.addamt b', el), ok = $('[data-ok]', el);
      const draw = () => { out.textContent = '$' + (s || '0'); out.classList.toggle('has', !!s); ok.disabled = !(parseFloat(s) > 0); out.classList.remove('tick'); void out.offsetWidth; out.classList.add('tick'); };
      $('.keys', el).addEventListener('click', e => { const b = e.target.closest('.key'); if (!b) return; const key = b.dataset.k;
        if (key === 'del') s = s.slice(0, -1); else if (key === '.') { if (!s.includes('.')) s = (s || '0') + '.'; } else if (!(s.includes('.') && s.split('.')[1].length >= 2) && s.replace('.', '').length < 6) s = s === '0' ? key : s + key;
        draw(); });
      $('.addcats', el).addEventListener('click', e => { const b = e.target.closest('.fchip'); if (!b) return; k = b.dataset.k; $$('.fchip', el).forEach(x => x.classList.toggle('on', x === b)); });
      ok.addEventListener('click', () => { const amt = Math.round(parseFloat(s) * 100) / 100, c = cat(k);
        S.tx.unshift({ id: 'n' + Date.now(), d: TODAY, t: '21:04', name: { food: 'Snack', home: 'Household', transport: 'Ride', out: 'Night out', other: 'Purchase' }[k], at: 'Added by hand', cat: k, amt, card: 'debit', moved: true });
        close(); toast(`${money(amt)} added to ${c.name}`); const top = topScreen(); if (top.name === 'home') refresh(top.el); else go('home'); }); } },
};
