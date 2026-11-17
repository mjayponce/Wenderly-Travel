const DEMO_DATA = {
  destinations: [
    {id:1,name:'Santorini',country:'Greece',category:'Beach',price:1450,rating:4.9,emoji:'🏝️',desc:'Whitewashed cliffs and sunsets over the Aegean.'},
    {id:2,name:'Kyoto',country:'Japan',category:'Culture',price:1980,rating:4.8,emoji:'⛩️',desc:'Temples, tea houses and cherry blossoms.'},
    {id:3,name:'Swiss Alps',country:'Switzerland',category:'Mountain',price:2350,rating:4.7,emoji:'🏔️',desc:'Alpine trails, chalets and crystal lakes.'},
    {id:4,name:'Lisbon',country:'Portugal',category:'City',price:980,rating:4.6,emoji:'🚋',desc:'Tiled streets, trams and fresh seafood.'},
    {id:5,name:'Bali',country:'Indonesia',category:'Beach',price:1190,rating:4.7,emoji:'🌴',desc:'Rice terraces, surf and serene retreats.'},
    {id:6,name:'Marrakech',country:'Morocco',category:'Culture',price:870,rating:4.5,emoji:'🕌',desc:'Vibrant souks, riads and desert escapes.'}
  ],
  bookings: [
    {id:1,traveler:'Emma Johnson',destinationId:1,date:'2025-01-18',amount:2900,status:'Confirmed'},
    {id:2,traveler:'Liam Carter',destinationId:2,date:'2025-02-09',amount:3960,status:'Confirmed'},
    {id:3,traveler:'Sofia Martins',destinationId:4,date:'2025-03-04',amount:1960,status:'Pending'},
    {id:4,traveler:'Noah Williams',destinationId:3,date:'2025-03-27',amount:2350,status:'Cancelled'},
    {id:5,traveler:'Olivia Brown',destinationId:5,date:'2025-04-15',amount:3570,status:'Confirmed'},
    {id:6,traveler:'Ahmed Rahman',destinationId:6,date:'2025-05-02',amount:1740,status:'Pending'}
  ],
  activity: [
    {id:1,text:'Olivia Brown booked Bali',date:'2025-04-15'},
    {id:2,text:'Ahmed Rahman booked Marrakech',date:'2025-05-02'},
    {id:3,text:'Noah Williams cancelled Swiss Alps',date:'2025-03-28'},
    {id:4,text:'Sofia Martins booked Lisbon',date:'2025-03-04'}
  ],
  settings: [{id:1,name:'Wanderly Travel',currency:'$'}]
};

const KEY = 'wanderly-travel';
const store = {
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!d) { d = JSON.parse(JSON.stringify(DEMO_DATA)); localStorage.setItem(KEY, JSON.stringify(d)); }
    return d;
  },
  save() { localStorage.setItem(KEY, JSON.stringify(db)); },
  reset() { db = JSON.parse(JSON.stringify(DEMO_DATA)); store.save(); }
};
let db = store.load();

const $ = id => document.getElementById(id);
const ICON = {
  ok: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
  err: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
  edit: '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  del: '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  empty: '<svg class="w-10 h-10 mx-auto text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
};
const cur = () => db.settings[0].currency;
const money = n => cur() + Number(n).toLocaleString();
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const destName = id => (db.destinations.find(d => d.id == id) || {name:'Unknown'}).name;
const nextId = arr => arr.reduce((m, x) => Math.max(m, x.id), 0) + 1;
const badge = s => {
  const c = {Confirmed:'bg-emerald-100 text-emerald-700',Pending:'bg-amber-100 text-amber-700',Cancelled:'bg-red-100 text-red-700'}[s];
  return `<span class="px-2.5 py-1 rounded-full text-xs font-medium ${c}">${s}</span>`;
};

function toast(msg, type = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white ' + (type === 'ok' ? 'bg-teal-700' : 'bg-red-600');
  t.innerHTML = (type === 'ok' ? ICON.ok : ICON.err) + '<span>' + esc(msg) + '</span>';
  $('toasts').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
function log(text) {
  db.activity.unshift({id: nextId(db.activity), text, date: new Date().toISOString().slice(0, 10)});
  db.activity = db.activity.slice(0, 20);
}

/* Navigation */
const titles = {dashboard:'Dashboard',destinations:'Destinations',bookings:'Bookings',reports:'Reports',settings:'Settings'};
function go(v) {
  document.querySelectorAll('.view').forEach(e => e.classList.add('hidden'));
  $('view-' + v).classList.remove('hidden');
  document.querySelectorAll('.nav').forEach(n => n.classList.toggle('active', n.dataset.nav === v));
  $('pageTitle').textContent = titles[v];
  closeMenu();
  render();
}
function closeMenu() { $('sidebar').classList.add('-translate-x-full'); $('overlay').classList.add('hidden'); }
document.querySelectorAll('.nav').forEach(n => n.onclick = () => go(n.dataset.nav));
document.querySelectorAll('[data-go]').forEach(n => n.onclick = () => go(n.dataset.go));
$('menuBtn').onclick = () => { $('sidebar').classList.remove('-translate-x-full'); $('overlay').classList.remove('hidden'); };
$('overlay').onclick = closeMenu;

/* Rendering */
let bSort = {key:'date', dir:-1};
function render() {
  renderKpis(); renderActivity(); renderDest(); renderBookings(); drawCharts();
  $('sName').value = db.settings[0].name; $('sCur').value = db.settings[0].currency;
}
function kpi(label, value, path) {
  return `<div class="bg-white rounded-2xl shadow-sm p-5 card-hover flex items-center gap-4"><div class="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center"><svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${path}</svg></div><div><p class="text-sm text-slate-500">${label}</p><p class="text-2xl font-bold">${value}</p></div></div>`;
}
function renderKpis() {
  const active = db.bookings.filter(b => b.status !== 'Cancelled');
  const rev = db.bookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + Number(b.amount), 0);
  const avg = db.destinations.length ? (db.destinations.reduce((s, d) => s + Number(d.rating), 0) / db.destinations.length).toFixed(1) : '0.0';
  $('kpis').innerHTML =
    kpi('Destinations', db.destinations.length, '<path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>') +
    kpi('Active bookings', active.length, '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/>') +
    kpi('Confirmed revenue', money(rev), '<path d="M12 2v20M17 6H9.5a3 3 0 000 6h5a3 3 0 010 6H6"/>') +
    kpi('Avg. rating', avg + ' ★', '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>');
}
function renderActivity() {
  $('activity').innerHTML = db.activity.length ? db.activity.slice(0, 6).map(a =>
    `<li class="py-3 flex justify-between gap-3 text-sm"><span>${esc(a.text)}</span><span class="text-slate-400 shrink-0">${a.date}</span></li>`).join('')
    : '<li class="py-6 text-center text-slate-400">No activity yet</li>';
}
function renderDest() {
  const q = $('dSearch').value.toLowerCase(), c = $('dCat').value, s = $('dSort').value;
  let list = db.destinations.filter(d => (c === 'all' || d.category === c) && (d.name + ' ' + d.country).toLowerCase().includes(q));
  list.sort((a, b) => s === 'name' ? a.name.localeCompare(b.name) : s === 'price' ? a.price - b.price : b.rating - a.rating);
  $('destGrid').innerHTML = list.length ? list.map(d => `
    <article class="bg-white rounded-2xl shadow-sm overflow-hidden card-hover">
      <div class="h-32 bg-gradient-to-br from-teal-100 to-sky-100 flex items-center justify-center text-6xl">${esc(d.emoji)}</div>
      <div class="p-5">
        <div class="flex justify-between items-start gap-2"><div><h3 class="font-semibold text-lg">${esc(d.name)}</h3><p class="text-sm text-slate-500">${esc(d.country)}</p></div><span class="text-xs bg-slate-100 px-2.5 py-1 rounded-full">${esc(d.category)}</span></div>
        <p class="text-sm text-slate-600 mt-3">${esc(d.desc)}</p>
        <div class="flex items-center justify-between mt-4"><span class="font-bold text-teal-700">${money(d.price)}</span><span class="text-amber-600 text-sm">★ ${d.rating}</span></div>
        <div class="flex gap-2 mt-4">
          <button data-book="${d.id}" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2 text-sm transition">Book trip</button>
          <button data-dedit="${d.id}" aria-label="Edit" class="p-2 rounded-xl border border-slate-300 hover:bg-slate-50">${ICON.edit}</button>
          <button data-ddel="${d.id}" aria-label="Delete" class="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50">${ICON.del}</button>
        </div>
      </div></article>`).join('')
    : `<div class="col-span-full text-center py-16 text-slate-400">${ICON.empty}<p class="mt-2">No destinations match your search.</p></div>`;
  document.querySelectorAll('[data-book]').forEach(b => b.onclick = () => bookingForm(null, +b.dataset.book));
  document.querySelectorAll('[data-dedit]').forEach(b => b.onclick = () => destForm(+b.dataset.dedit));
  document.querySelectorAll('[data-ddel]').forEach(b => b.onclick = () => ask('Delete this destination and its bookings?', () => {
    const d = db.destinations.find(x => x.id === +b.dataset.ddel);
    db.destinations = db.destinations.filter(x => x.id !== d.id);
    db.bookings = db.bookings.filter(x => x.destinationId !== d.id);
    log('Removed destination ' + d.name); store.save(); render(); toast('Destination deleted');
  }));
}
function renderBookings() {
  const q = $('bSearch').value.toLowerCase(), st = $('bStatus').value;
  let list = db.bookings.filter(b => (st === 'all' || b.status === st) && (b.traveler + ' ' + destName(b.destinationId)).toLowerCase().includes(q));
  list.sort((a, b) => {
    const x = a[bSort.key], y = b[bSort.key];
    return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * bSort.dir;
  });
  $('bBody').innerHTML = list.length ? list.map(b => `
    <tr class="border-t border-slate-100 hover:bg-slate-50 transition">
      <td class="p-4 font-medium">${esc(b.traveler)}</td><td class="p-4">${esc(destName(b.destinationId))}</td>
      <td class="p-4">${b.date}</td><td class="p-4">${money(b.amount)}</td><td class="p-4">${badge(b.status)}</td>
      <td class="p-4 text-right whitespace-nowrap">
        <button data-bedit="${b.id}" aria-label="Edit" class="p-2 rounded-lg hover:bg-slate-100">${ICON.edit}</button>
        <button data-bdel="${b.id}" aria-label="Delete" class="p-2 rounded-lg text-red-600 hover:bg-red-50">${ICON.del}</button></td></tr>`).join('')
    : `<tr><td colspan="6" class="text-center py-14 text-slate-400">${ICON.empty}<p class="mt-2">No bookings found.</p></td></tr>`;
  document.querySelectorAll('[data-bedit]').forEach(b => b.onclick = () => bookingForm(+b.dataset.bedit));
  document.querySelectorAll('[data-bdel]').forEach(b => b.onclick = () => ask('Delete this booking?', () => {
    db.bookings = db.bookings.filter(x => x.id !== +b.dataset.bdel);
    log('Booking deleted'); store.save(); render(); toast('Booking deleted');
  }));
}
['dSearch', 'dCat', 'dSort'].forEach(i => $(i).oninput = renderDest);
['bSearch', 'bStatus'].forEach(i => $(i).oninput = renderBookings);
document.querySelectorAll('.bsort').forEach(b => b.onclick = () => {
  const k = b.dataset.sort;
  bSort = {key: k, dir: bSort.key === k ? -bSort.dir : 1};
  renderBookings();
});

/* Modal & confirm */
let onSave = null, onYes = null;
function openModal(title, fields, save) {
  $('mTitle').textContent = title; $('mErr').classList.add('hidden');
  $('mFields').innerHTML = fields; onSave = save;
  $('modal').classList.add('open');
}
function closeModal() { $('modal').classList.remove('open'); }
$('mClose').onclick = $('mCancel').onclick = closeModal;
$('mForm').onsubmit = e => {
  e.preventDefault();
  const err = onSave();
  if (err) { $('mErr').textContent = err; $('mErr').classList.remove('hidden'); toast(err, 'err'); }
  else closeModal();
};
function ask(text, fn) { $('cText').textContent = text; onYes = fn; $('confirm').classList.add('open'); }
$('cNo').onclick = () => $('confirm').classList.remove('open');
$('cYes').onclick = () => { $('confirm').classList.remove('open'); if (onYes) onYes(); };

const inp = 'mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500';
const field = (label, id, type, val, extra = '') => `<label class="block text-sm">${label}<input id="${id}" type="${type}" value="${esc(val)}" ${extra} class="${inp}"></label>`;

function destForm(id) {
  const d = id ? db.destinations.find(x => x.id === id) : {name:'', country:'', category:'Beach', price:'', rating:4.5, emoji:'📍', desc:''};
  openModal(id ? 'Edit destination' : 'Add destination',
    field('Name', 'fName', 'text', d.name) + field('Country', 'fCountry', 'text', d.country) +
    `<label class="block text-sm">Category<select id="fCat" class="${inp}">${['Beach','City','Mountain','Culture'].map(c => `<option ${c === d.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>` +
    field('Price', 'fPrice', 'number', d.price, 'min="1"') + field('Rating (1-5)', 'fRating', 'number', d.rating, 'min="1" max="5" step="0.1"') +
    field('Emoji', 'fEmoji', 'text', d.emoji, 'maxlength="4"') + field('Description', 'fDesc', 'text', d.desc),
    () => {
      const o = {name:$('fName').value.trim(), country:$('fCountry').value.trim(), category:$('fCat').value, price:+$('fPrice').value, rating:+$('fRating').value, emoji:$('fEmoji').value.trim() || '📍', desc:$('fDesc').value.trim()};
      if (!o.name || !o.country) return 'Name and country are required.';
      if (!(o.price > 0)) return 'Price must be greater than zero.';
      if (!(o.rating >= 1 && o.rating <= 5)) return 'Rating must be between 1 and 5.';
      if (id) { Object.assign(d, o); log('Updated destination ' + o.name); }
      else { o.id = nextId(db.destinations); db.destinations.push(o); log('Added destination ' + o.name); }
      store.save(); render(); toast('Destination saved');
    });
}
$('addDest').onclick = () => destForm();

function bookingForm(id, destId) {
  if (!db.destinations.length) return toast('Add a destination first', 'err');
  const b = id ? db.bookings.find(x => x.id === id) : {traveler:'', destinationId: destId || db.destinations[0].id, date: new Date().toISOString().slice(0, 10), amount: '', status:'Pending'};
  if (!id && destId) b.amount = db.destinations.find(d => d.id === destId).price;
  openModal(id ? 'Edit booking' : 'New booking',
    field('Traveler name', 'fTrav', 'text', b.traveler) +
    `<label class="block text-sm">Destination<select id="fDest" class="${inp}">${db.destinations.map(d => `<option value="${d.id}" ${d.id == b.destinationId ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label>` +
    field('Date', 'fDate', 'date', b.date) + field('Amount', 'fAmt', 'number', b.amount, 'min="1"') +
    `<label class="block text-sm">Status<select id="fStat" class="${inp}">${['Confirmed','Pending','Cancelled'].map(c => `<option ${c === b.status ? 'selected' : ''}>${c}</option>`).join('')}</select></label>`,
    () => {
      const o = {traveler:$('fTrav').value.trim(), destinationId:+$('fDest').value, date:$('fDate').value, amount:+$('fAmt').value, status:$('fStat').value};
      if (!o.traveler) return 'Traveler name is required.';
      if (!o.date) return 'Please choose a date.';
      if (!(o.amount > 0)) return 'Amount must be greater than zero.';
      if (id) { Object.assign(b, o); log('Updated booking for ' + o.traveler); }
      else { o.id = nextId(db.bookings); db.bookings.push(o); log(o.traveler + ' booked ' + destName(o.destinationId)); }
      store.save(); render(); toast('Booking saved');
    });
}
$('addBooking').onclick = $('quickBook').onclick = () => bookingForm();

/* Settings & reset */
$('settingsForm').onsubmit = e => {
  e.preventDefault();
  const n = $('sName').value.trim(), c = $('sCur').value.trim();
  if (!n || !c) return toast('All fields are required', 'err');
  db.settings[0] = {id:1, name:n, currency:c}; store.save(); render(); toast('Settings saved');
};
$('resetBtn').onclick = () => ask('Reset all data to the original demo data?', () => { store.reset(); render(); toast('Demo data restored'); });

/* CSV */
function csv(name, rows) {
  if (!rows.length) return toast('Nothing to export', 'err');
  const keys = Object.keys(rows[0]);
  const out = [keys.join(',')].concat(rows.map(r => keys.map(k => '"' + String(r[k]).replace(/"/g, '""') + '"').join(','))).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([out], {type:'text/csv'}));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
  toast('Exported ' + name);
}
$('expBookings').onclick = () => csv('bookings.csv', db.bookings.map(b => ({id:b.id, traveler:b.traveler, destination:destName(b.destinationId), date:b.date, amount:b.amount, status:b.status})));
$('expDest').onclick = () => csv('destinations.csv', db.destinations.map(d => ({id:d.id, name:d.name, country:d.country, category:d.category, price:d.price, rating:d.rating})));

/* Charts */
function setup(c) {
  const w = c.parentElement.clientWidth - 48 || 300, h = +c.getAttribute('height'), r = window.devicePixelRatio || 1;
  c.width = w * r; c.height = h * r; c.style.width = w + 'px'; c.style.height = h + 'px';
  const x = c.getContext('2d'); x.scale(r, r); x.clearRect(0, 0, w, h); x.font = '12px sans-serif';
  return {x, w, h};
}
function drawCharts() {
  if ($('view-dashboard').classList.contains('hidden') && $('view-reports').classList.contains('hidden')) return;
  if (!$('view-dashboard').classList.contains('hidden')) { drawRevenue(); drawCat(); }
  if (!$('view-reports').classList.contains('hidden')) drawTop();
}
function drawRevenue() {
  const {x, w, h} = setup($('chartRevenue'));
  const months = {};
  db.bookings.filter(b => b.status !== 'Cancelled').forEach(b => { const m = b.date.slice(0, 7); months[m] = (months[m] || 0) + Number(b.amount); });
  const keys = Object.keys(months).sort(), max = Math.max(1, ...Object.values(months));
  if (!keys.length) { x.fillStyle = '#94a3b8'; x.fillText('No data', w / 2 - 20, h / 2); return; }
  const bw = (w - 50) / keys.length;
  keys.forEach((k, i) => {
    const bh = (months[k] / max) * (h - 50), bx = 40 + i * bw + bw * 0.2;
    x.fillStyle = '#0d9488'; x.beginPath(); x.roundRect ? x.roundRect(bx, h - 25 - bh, bw * 0.6, bh, 6) : x.rect(bx, h - 25 - bh, bw * 0.6, bh); x.fill();
    x.fillStyle = '#64748b'; x.fillText(k.slice(5) + '/' + k.slice(2, 4), bx, h - 8);
    x.fillText(cur() + Math.round(months[k] / 100) / 10 + 'k', bx, h - 30 - bh);
  });
}
const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#64748b'];
function drawCat() {
  const {x, w, h} = setup($('chartCat'));
  const cats = {};
  db.bookings.filter(b => b.status !== 'Cancelled').forEach(b => {
    const d = db.destinations.find(d => d.id === b.destinationId); if (d) cats[d.category] = (cats[d.category] || 0) + 1;
  });
  const keys = Object.keys(cats), total = keys.reduce((s, k) => s + cats[k], 0);
  $('legend').innerHTML = keys.map((k, i) => `<span class="flex items-center gap-1"><i class="w-3 h-3 rounded-full inline-block" style="background:${COLORS[i % 4]}"></i>${k} (${cats[k]})</span>`).join('');
  if (!total) { x.fillStyle = '#94a3b8'; x.fillText('No data', w / 2 - 20, h / 2); return; }
  let a = -Math.PI / 2; const R = Math.min(w, h) / 2 - 10;
  keys.forEach((k, i) => {
    const s = cats[k] / total * Math.PI * 2;
    x.beginPath(); x.moveTo(w / 2, h / 2); x.arc(w / 2, h / 2, R, a, a + s); x.fillStyle = COLORS[i % 4]; x.fill(); a += s;
  });
  x.beginPath(); x.arc(w / 2, h / 2, R * 0.55, 0, 7); x.fillStyle = '#fff'; x.fill();
  x.fillStyle = '#1e293b'; x.font = 'bold 20px sans-serif'; x.textAlign = 'center'; x.fillText(total, w / 2, h / 2 + 7); x.textAlign = 'left';
}
function drawTop() {
  const {x, w, h} = setup($('chartTop'));
  const t = {};
  db.bookings.filter(b => b.status === 'Confirmed').forEach(b => { const n = destName(b.destinationId); t[n] = (t[n] || 0) + Number(b.amount); });
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1]), max = Math.max(1, ...rows.map(r => r[1]));
  if (!rows.length) { x.fillStyle = '#94a3b8'; x.fillText('No confirmed bookings', 20, 30); return; }
  rows.forEach(([n, v], i) => {
    const y = 15 + i * 38, bw = (w - 200) * v / max;
    x.fillStyle = '#334155'; x.fillText(n, 0, y + 15);
    x.fillStyle = '#14b8a6'; x.fillRect(100, y, bw, 22);
    x.fillStyle = '#334155'; x.fillText(money(v), 106 + bw, y + 15);
  });
}
window.addEventListener('resize', drawCharts);

go('dashboard');