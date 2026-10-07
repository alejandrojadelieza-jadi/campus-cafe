/* =====================================================
   Campus Cafeteria POS — self-order kiosk
   -----------------------------------------------------
   PHOTOS: edit the PHOTO table below to change images.
   • Chicken and iced tea use Wikimedia Commons files.
   • Rice, adobo, vegetables and water use the image links
     you provided. If a photo fails to load, a green emoji
     tile is shown instead.
   ===================================================== */
const COMMONS = f => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + f + '?width=640';
const PHOTO = {
  rice:    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4gL0oUtBXh7HIFq04zPD0jThWhU0fMf8D2kBWQdkGh_VIWKUGOs5aknXW&s=10',
  chicken: COMMONS('Fried-Chicken-Set.jpg'),
  adobo:   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsN0dd0H7LbfErcOqpufuCWrQkcfpWjeiZAhciyGpEXw&s=10',
  chopsuey:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGjfOSpmzqR0O19-9AL8tCjsxsGCFAr9cUZyIyCMnXBK8wVLZqJ-OagIM&s=10',
  pinakbet:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS05J8Ss1_B7IjfUiwGM5giODhkUEoX8gvoXyrvsaUX6-8oFLTXvdzEFk8&s=10',
  gulay:   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSGcxUfXFWID_h1VwjJRGIFpXs0gV85d6YAoOCYGTa_WyhwLi-lFmxZxK9&s=10',
  tea:     COMMONS('NCI_iced_tea.jpg'),
  water:   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrqGDIQOTaiJJNyvsyxbp7Glf30vs3VwyV8L1zOOU3ReZIgErP3zjgmqC8&s=10',
};

const VAT_RATE = 0.12, MAX_QTY = 99;
const IDLE_MS = 90000, IDLE_WARN_S = 15, SUCCESS_S = 6, RECEIPT_S = 60;

const CATS = [
  {id:'rice',    name:'Rice (Plain)',        icon:'🍚'},
  {id:'chicken', name:'Fried Chicken (1pc)', icon:'🍗'},
  {id:'adobo',   name:'Pork Adobo',          icon:'🍖'},
  {id:'veg',     name:'Vegetable Side Dish', icon:'🥗'},
  {id:'tea',     name:'Iced Tea (cup)',      icon:'🧋'},
  {id:'water',   name:'Bottled Water',       icon:'💧'},
];

/* price in pesos (before VAT) */
const PRODUCTS = [
  {id:'r1', cat:'rice', name:'Plain Rice – Regular', sub:'1 cup steamed rice', price:15, img:PHOTO.rice, emoji:'🍚'},
  {id:'r2', cat:'rice', name:'Plain Rice – Large',   sub:'1½ cups steamed rice', price:22, img:PHOTO.rice, emoji:'🍚'},
  {id:'r3', cat:'rice', name:'Plain Rice – Bowl',    sub:'2 cups, good for sharing', price:30, img:PHOTO.rice, emoji:'🍚'},

  {id:'c1', cat:'chicken', name:'Fried Chicken – Leg',    sub:'1 pc, crispy drumstick', price:65, img:PHOTO.chicken, emoji:'🍗'},
  {id:'c2', cat:'chicken', name:'Fried Chicken – Thigh',  sub:'1 pc, juicy thigh', price:65, img:PHOTO.chicken, emoji:'🍗'},
  {id:'c3', cat:'chicken', name:'Fried Chicken – Wing',   sub:'1 pc, crunchy wing', price:55, img:PHOTO.chicken, emoji:'🍗'},
  {id:'c4', cat:'chicken', name:'Fried Chicken – Breast', sub:'1 pc, tender breast', price:75, img:PHOTO.chicken, emoji:'🍗'},

  {id:'a1', cat:'adobo', name:'Pork Adobo – Regular',   sub:'Soy-vinegar braised pork', price:70, img:PHOTO.adobo, emoji:'🍖'},
  {id:'a2', cat:'adobo', name:'Pork Adobo – Large',     sub:'Extra serving of pork', price:95, img:PHOTO.adobo, emoji:'🍖'},
  {id:'a3', cat:'adobo', name:'Pork Adobo sa Gata',     sub:'Creamy coconut milk style', price:85, img:PHOTO.adobo, emoji:'🍖'},
  {id:'a4', cat:'adobo', name:'Adobo Flakes',           sub:'Shredded & pan-crisped', price:60, img:PHOTO.adobo, emoji:'🍖'},

  {id:'v1', cat:'veg', name:'Chopsuey',        sub:'Mixed stir-fried vegetables', price:40, img:PHOTO.chopsuey, emoji:'🥗'},
  {id:'v2', cat:'veg', name:'Pinakbet',        sub:'Ilocano-style vegetable stew', price:40, img:PHOTO.pinakbet, emoji:'🥗'},
  {id:'v3', cat:'veg', name:'Ginisang Gulay',  sub:'Sautéed seasonal vegetables', price:35, img:PHOTO.gulay, emoji:'🥗'},

  {id:'t1', cat:'tea', name:'Iced Tea – Regular', sub:'16 oz cup', price:25, img:PHOTO.tea, emoji:'🧋'},
  {id:'t2', cat:'tea', name:'Iced Tea – Large',   sub:'22 oz cup', price:35, img:PHOTO.tea, emoji:'🧋'},
  {id:'t3', cat:'tea', name:'Lemon Iced Tea',     sub:'16 oz cup with lemon', price:30, img:PHOTO.tea, emoji:'🧋'},

  {id:'w1', cat:'water', name:'Bottled Water – 350 ml', sub:'Purified drinking water', price:12, img:PHOTO.water, emoji:'💧'},
  {id:'w2', cat:'water', name:'Bottled Water – 500 ml', sub:'Purified drinking water', price:18, img:PHOTO.water, emoji:'💧'},
  {id:'w3', cat:'water', name:'Bottled Water – 1 L',    sub:'Purified drinking water', price:28, img:PHOTO.water, emoji:'💧'},
];

/* ---------- State & helpers ---------- */
const state = {type:null, cat:'rice', cart:[], method:null, order:null};
let current = 'welcome';
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const product = id => PRODUCTS.find(p => p.id === id);
const peso = c => '₱' + (c/100).toLocaleString('en-PH',{minimumFractionDigits:2, maximumFractionDigits:2});
const typeIcon = t => t === 'Dine In' ? '🍽️' : '🥡';
const qtyOf = id => (state.cart.find(l => l.id === id) || {qty:0}).qty;

function totals(){
  const subC = state.cart.reduce((s,l) => s + product(l.id).price * 100 * l.qty, 0);
  const vatC = Math.round(subC * VAT_RATE);
  return {subC, vatC, totC: subC + vatC, count: state.cart.reduce((s,l) => s + l.qty, 0)};
}

let toastT;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1700);
}

const timers = {};
function go(id){
  current = id;
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  clearTimeout(timers.auto); clearInterval(timers.count);
  resetIdle();
}

/* ---------- 1. Welcome ---------- */
(function floaters(){
  const em = ['🍚','🍗','🍖','🥗','🧋','💧','🍃','🍴'];
  const f = $('#floaters');
  for(let i=0;i<16;i++){
    const s = document.createElement('span');
    s.textContent = em[i % em.length];
    s.style.left = (Math.random()*95)+'%'; s.style.top = (Math.random()*90)+'%';
    s.style.animationDelay = (-Math.random()*9)+'s'; s.style.fontSize = (2+Math.random()*2.5)+'rem';
    f.appendChild(s);
  }
})();
$('#welcome').addEventListener('click', () => go('type'));

/* ---------- 2. Order type ---------- */
$$('.typeBtn').forEach(b => b.addEventListener('click', () => {
  state.type = b.dataset.type;
  state.cart = []; state.method = null; state.cat = CATS[0].id;
  renderMenu();
  go('menu');
}));
$('#typeBack').addEventListener('click', () => go('welcome'));

/* ---------- 3. Item selection ---------- */
function renderMenu(){
  const label = typeIcon(state.type) + ' ' + state.type;
  $('#typePill').textContent = label;
  $('#cartType').textContent = label;
  renderCats(); renderGrid(); renderCart();
}
function renderCats(){
  $('#catbar').innerHTML = CATS.map(c =>
    `<button class="cat ${c.id===state.cat?'active':''}" data-cat="${c.id}"><span class="ico">${c.icon}</span>${c.name}</button>`).join('');
}
$('#catbar').addEventListener('click', e => {
  const b = e.target.closest('.cat'); if(!b) return;
  state.cat = b.dataset.cat; renderCats(); renderGrid(); $('#grid').scrollTop = 0; resetIdle();
});

function actHTML(id){
  const q = qtyOf(id);
  if(!q) return `<div class="addLbl">＋ Tap to add</div>`;
  return `<div class="stepper"><button data-act="dec" aria-label="Decrease">−</button><span>${q}</span><button data-act="inc" aria-label="Increase" ${q>=MAX_QTY?'disabled':''}>+</button></div>`;
}
function renderGrid(){
  const cat = CATS.find(c => c.id === state.cat);
  $('#menuTitle').textContent = cat.icon + ' ' + cat.name;
  $('#grid').innerHTML = PRODUCTS.filter(p => p.cat === state.cat).map(p => `
    <article class="card ${qtyOf(p.id)?'inCart':''}" data-id="${p.id}">
      <div class="pic"><span>${p.emoji}</span><img src="${p.img}" alt="${p.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></div>
      <div class="info"><div class="name">${p.name}</div><div class="sub">${p.sub}</div><div class="price">${peso(p.price*100)}</div></div>
      <div class="act">${actHTML(p.id)}</div>
    </article>`).join('');
}
function updateCard(id){
  const card = $(`.card[data-id="${id}"]`); if(!card) return;
  card.classList.toggle('inCart', qtyOf(id) > 0);
  card.querySelector('.act').innerHTML = actHTML(id);
}

/* The single place where quantity changes — always clamped to 0..99 */
function setQty(id, q){
  q = Math.max(0, Math.min(MAX_QTY, Math.floor(q)));
  const line = state.cart.find(l => l.id === id);
  if(q === 0){ state.cart = state.cart.filter(l => l.id !== id); }
  else if(line){ line.qty = q; }
  else { state.cart.push({id, qty:q}); }
  updateCard(id); renderCart(); resetIdle();
}
function bump(id, delta){
  const q = qtyOf(id);
  if(delta > 0 && q >= MAX_QTY){ toast('Maximum of 99 per item'); return; }
  if(delta < 0 && q <= 0) return;
  setQty(id, q + delta);
  if(q + delta === 0) toast(product(id).name + ' removed');
}
$('#grid').addEventListener('click', e => {
  const card = e.target.closest('.card'); if(!card) return;
  const id = card.dataset.id, act = e.target.closest('[data-act]');
  if(act){
    if(act.disabled) return;
    bump(id, act.dataset.act === 'inc' ? 1 : -1);
  } else if(!qtyOf(id)){
    bump(id, 1);
    toast(product(id).name + ' added');
  } else {
    bump(id, 1);
  }
});

/* ---------- Cart ---------- */
function renderCart(){
  const body = $('#cartBody');
  if(!state.cart.length){
    body.innerHTML = `<div class="cartEmpty"><span class="big">🛒</span><b>Your cart is empty</b><br>Tap any item to add it</div>`;
  } else {
    body.innerHTML = state.cart.map(l => {
      const p = product(l.id);
      return `<div class="line" data-id="${l.id}">
        <div class="lt"><b>${p.name}</b><small>${peso(p.price*100)} each</small></div>
        <div class="qty">
          <button data-act="dec" aria-label="Decrease">−</button><span>${l.qty}</span><button data-act="inc" aria-label="Increase" ${l.qty>=MAX_QTY?'disabled':''}>+</button>
        </div>
        <button class="rm" data-act="rm" aria-label="Remove ${p.name}">🗑</button>
        <div class="lp">${peso(p.price*100*l.qty)}</div>
      </div>`;
    }).join('');
  }
  const t = totals();
  $('#subT').textContent = peso(t.subC);
  $('#vatT').textContent = peso(t.vatC);
  $('#totT').textContent = peso(t.totC);
  if(state.cart.length) hideCartMsg();
}
$('#cartBody').addEventListener('click', e => {
  const act = e.target.closest('[data-act]'); if(!act || act.disabled) return;
  const id = act.closest('.line').dataset.id;
  if(act.dataset.act === 'rm'){ const n = product(id).name; setQty(id, 0); toast(n + ' removed'); }
  else bump(id, act.dataset.act === 'inc' ? 1 : -1);
});
let msgT;
function hideCartMsg(){ clearTimeout(msgT); $('#cartMsg').classList.remove('show'); }
$('#proceed').addEventListener('click', () => {
  if(!state.cart.length){
    const m = $('#cartMsg');
    m.textContent = '⚠️ Your cart is empty. Please add at least one item before paying.';
    m.classList.remove('show'); void m.offsetWidth; m.classList.add('show');
    clearTimeout(msgT); msgT = setTimeout(hideCartMsg, 4000);
    return;
  }
  renderSummary(); go('summary');
});

/* ---------- Cancel Order (all screens with the button) ---------- */
function ask(title, text, yesLabel, onYes){
  $('#cfTitle').textContent = title; $('#cfText').textContent = text; $('#cfYes').textContent = yesLabel;
  $('#cfYes').onclick = () => { $('#cfOverlay').classList.remove('show'); onYes(); };
  $('#cfNo').onclick  = () => $('#cfOverlay').classList.remove('show');
  $('#cfOverlay').classList.add('show');
}
function resetAll(){
  state.type = null; state.cart = []; state.method = null; state.order = null; state.cat = CATS[0].id;
  $$('.overlay').forEach(o => o.classList.remove('show'));
  clearInterval(idleTick);
  go('welcome');
}
$$('.cancelBtn').forEach(b => b.addEventListener('click', () =>
  ask('Cancel order?', 'All items will be removed and you will return to the start screen.', 'Yes, cancel', resetAll)));

/* ---------- 4. Order summary ---------- */
function renderSummary(){
  const label = typeIcon(state.type) + ' ' + state.type;
  $('#sumPill').textContent = label;
  $('#sumIco').textContent = typeIcon(state.type);
  $('#sumType').textContent = 'Order type: ' + state.type;
  $('#sumList').innerHTML = state.cart.map(l => {
    const p = product(l.id);
    return `<div class="sumLine"><b>${p.name}</b><b class="p">${peso(p.price*100*l.qty)}</b><small>${l.qty} × ${peso(p.price*100)}</small><span></span></div>`;
  }).join('');
  const t = totals();
  $('#sSub').textContent = peso(t.subC); $('#sVat').textContent = peso(t.vatC); $('#sTot').textContent = peso(t.totC);
}
$('#sumBack').addEventListener('click', () => { renderMenu(); go('menu'); });
$('#sumNext').addEventListener('click', () => {
  state.method = null;
  $('#payPill').textContent = typeIcon(state.type) + ' ' + state.type;
  $('#mTot').textContent = peso(totals().totC);
  $$('.method').forEach(m => m.classList.remove('sel'));
  $('#payBtn').disabled = true;
  $('#mHint').textContent = 'Select a payment method to continue.';
  go('method');
});

/* ---------- 5. Payment method ---------- */
const HINTS = {
  'Cash':     'Your order will be sent to the kitchen. Please pay the cashier when your number is called.',
  'Card':     'Have your card ready. You will be asked to tap or insert it on the terminal.',
  'E-Wallet': 'Open your e-wallet app and be ready to scan the QR code.',
};
$$('.method').forEach(m => m.addEventListener('click', () => {
  $$('.method').forEach(x => x.classList.remove('sel')); m.classList.add('sel');
  state.method = m.dataset.m;
  $('#mHint').textContent = HINTS[state.method];
  $('#payBtn').disabled = false;
  $('#payBtn').textContent = (state.method === 'Cash' ? 'Place Order' : 'Pay ' + peso(totals().totC)) + ' ✓';
  resetIdle();
}));
$('#methBack').addEventListener('click', () => go('summary'));

/* ---------- 6. Processing ---------- */
const PROC = {
  'Cash':     ['Sending your order…', 'Please wait while we send it to the kitchen.'],
  'Card':     ['Waiting for your card…', 'Tap or insert your card on the terminal.'],
  'E-Wallet': ['Confirming e-wallet payment…', 'Approve the payment in your app.'],
};
$('#payBtn').addEventListener('click', () => {
  if(!state.method || !state.cart.length) return;
  $('#procTitle').textContent = PROC[state.method][0];
  $('#procSub').textContent   = PROC[state.method][1];
  const bar = $('#procBar'); bar.style.transition = 'none'; bar.style.width = '0';
  go('processing');
  clearTimeout(idleT);
  const dur = state.method === 'Cash' ? 1800 : 3200;
  requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = `width ${dur}ms linear`; bar.style.width = '100%'; }));
  timers.auto = setTimeout(completeOrder, dur + 200);
});

/* ---------- 7. Success ---------- */
function nextOrderNo(){
  let n = 100;
  try{ n = +localStorage.getItem('ccpos_order') || 100; }catch(e){}
  n = n >= 999 ? 101 : n + 1;
  try{ localStorage.setItem('ccpos_order', n); }catch(e){}
  return n;
}
function completeOrder(){
  const t = totals();
  state.order = {
    no: nextOrderNo(), type: state.type, method: state.method, time: new Date(),
    items: state.cart.map(l => ({name: product(l.id).name, qty: l.qty, unit: product(l.id).price*100})),
    totals: t
  };
  const o = state.order;
  $('#sucNo').textContent = '#' + o.no;
  $('#sucText').textContent = o.method === 'Cash' ? 'Your order is placed. Please pay at the counter.' : 'Thank you! Your payment was received.';
  $('#sucHint').textContent = o.type === 'Dine In' ? 'Please take a seat. We will call your number.' : 'We will call your number for pickup.';
  buildReceipt(o);
  go('success');
  clearTimeout(idleT);
  let s = SUCCESS_S; $('#sucCount').textContent = s;
  timers.count = setInterval(() => { s--; $('#sucCount').textContent = s; if(s <= 0){ showReceipt(); } }, 1000);
}
$('#viewReceipt').addEventListener('click', showReceipt);

/* ---------- 8. Receipt ---------- */
const METHOD_LBL = {'Cash':'Cash (pay at counter)', 'Card':'Debit / Credit Card', 'E-Wallet':'E-Wallet'};
function buildReceipt(o){
  const d = o.time.toLocaleString('en-PH', {dateStyle:'medium', timeStyle:'short'});
  $('#rcBox').innerHTML = `
    <h4>🍃 CAMPUS CAFETERIA</h4>
    <div class="c">Self-Order Kiosk</div>
    <hr>
    <div class="r"><span>Order No.</span><b>#${o.no}</b></div>
    <div class="r"><span>Order Type</span><b>${typeIcon(o.type)} ${o.type}</b></div>
    <div class="r"><span>Date</span><span>${d}</span></div>
    <hr>
    ${o.items.map(i => `<div class="r"><span>${i.qty}× ${i.name}</span><span>${peso(i.unit*i.qty)}</span></div>`).join('')}
    <hr>
    <div class="r"><span>Subtotal</span><span>${peso(o.totals.subC)}</span></div>
    <div class="r"><span>VAT (12%)</span><span>${peso(o.totals.vatC)}</span></div>
    <div class="r big"><span>TOTAL</span><span>${peso(o.totals.totC)}</span></div>
    <hr>
    <div class="r"><span>Payment</span><span>${METHOD_LBL[o.method]}</span></div>
    <hr>
    <div class="c">Thank you! Enjoy your meal 💚</div>`;
}
function showReceipt(){
  if(current === 'receipt') return;
  go('receipt');
  clearTimeout(idleT);
  let s = RECEIPT_S; $('#rcCount').textContent = s;
  timers.count = setInterval(() => { s--; $('#rcCount').textContent = s; if(s <= 0){ resetAll(); } }, 1000);
}
$('#printBtn').addEventListener('click', () => window.print());
$('#newTx').addEventListener('click', resetAll);

/* ---------- Inactivity ---------- */
let idleT, idleTick, idleLeft;
function resetIdle(){
  clearTimeout(idleT);
  if($('#idleOverlay').classList.contains('show')) return;
  if(['type','menu','summary','method'].includes(current)) idleT = setTimeout(showIdle, IDLE_MS);
}
function showIdle(){
  idleLeft = IDLE_WARN_S; $('#idleCount').textContent = idleLeft;
  $('#idleOverlay').classList.add('show');
  clearInterval(idleTick);
  idleTick = setInterval(() => { idleLeft--; $('#idleCount').textContent = idleLeft; if(idleLeft <= 0) resetAll(); }, 1000);
}
$('#idleStay').addEventListener('click', () => { clearInterval(idleTick); $('#idleOverlay').classList.remove('show'); resetIdle(); });
$('#idleCancel').addEventListener('click', resetAll);
['pointerdown','keydown','touchstart'].forEach(ev => document.addEventListener(ev, () => {
  if(!$('#idleOverlay').classList.contains('show')) resetIdle();
}, {passive:true}));

document.addEventListener('contextmenu', e => e.preventDefault());
