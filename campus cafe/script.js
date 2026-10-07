/* =====================================================
   Campus Cafeteria POS — CORE ORDERING & COMPUTATION
   -----------------------------------------------------
   Extracted from script.js (logic unchanged, DOM removed).
   Works in the browser (global functions) and in Node
   (module.exports at the bottom).

   All money is handled in CENTAVOS (integers) to avoid
   floating-point errors. Product prices are in pesos
   (before VAT) and are converted with price * 100.
   ===================================================== */

/* ---------- Settings ---------- */
const VAT_RATE = 0.12;   // 12% VAT
const MAX_QTY  = 99;     // quantity limit per item (0–99)

/* ---------- Menu data ---------- */
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
  {id:'r1', cat:'rice', name:'Plain Rice – Regular', sub:'1 cup steamed rice', price:15},
  {id:'r2', cat:'rice', name:'Plain Rice – Large',   sub:'1½ cups steamed rice', price:22},
  {id:'r3', cat:'rice', name:'Plain Rice – Bowl',    sub:'2 cups, good for sharing', price:30},

  {id:'c1', cat:'chicken', name:'Fried Chicken – Leg',    sub:'1 pc, crispy drumstick', price:65},
  {id:'c2', cat:'chicken', name:'Fried Chicken – Thigh',  sub:'1 pc, juicy thigh', price:65},
  {id:'c3', cat:'chicken', name:'Fried Chicken – Wing',   sub:'1 pc, crunchy wing', price:55},
  {id:'c4', cat:'chicken', name:'Fried Chicken – Breast', sub:'1 pc, tender breast', price:75},

  {id:'a1', cat:'adobo', name:'Pork Adobo – Regular',   sub:'Soy-vinegar braised pork', price:70},
  {id:'a2', cat:'adobo', name:'Pork Adobo – Large',     sub:'Extra serving of pork', price:95},
  {id:'a3', cat:'adobo', name:'Pork Adobo sa Gata',     sub:'Creamy coconut milk style', price:85},
  {id:'a4', cat:'adobo', name:'Adobo Flakes',           sub:'Shredded & pan-crisped', price:60},

  {id:'v1', cat:'veg', name:'Chopsuey',        sub:'Mixed stir-fried vegetables', price:40},
  {id:'v2', cat:'veg', name:'Pinakbet',        sub:'Ilocano-style vegetable stew', price:40},
  {id:'v3', cat:'veg', name:'Ginisang Gulay',  sub:'Sautéed seasonal vegetables', price:35},

  {id:'t1', cat:'tea', name:'Iced Tea – Regular', sub:'16 oz cup', price:25},
  {id:'t2', cat:'tea', name:'Iced Tea – Large',   sub:'22 oz cup', price:35},
  {id:'t3', cat:'tea', name:'Lemon Iced Tea',     sub:'16 oz cup with lemon', price:30},

  {id:'w1', cat:'water', name:'Bottled Water – 350 ml', sub:'Purified drinking water', price:12},
  {id:'w2', cat:'water', name:'Bottled Water – 500 ml', sub:'Purified drinking water', price:18},
  {id:'w3', cat:'water', name:'Bottled Water – 1 L',    sub:'Purified drinking water', price:28},
];

/* ---------- State ---------- */
// type:   'Dine In' | 'Take Out'
// cart:   [{id, qty}, ...]
// method: 'Cash' | 'Card' | 'E-Wallet'
// order:  the finished order (set by completeOrder)
const state = {type:null, cat:CATS[0].id, cart:[], method:null, order:null};

/* ---------- Helpers ---------- */
const product = id => PRODUCTS.find(p => p.id === id);
const qtyOf   = id => (state.cart.find(l => l.id === id) || {qty:0}).qty;

/* centavos -> "₱1,234.50" */
const peso = c => '₱' + (c/100).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2});

/* Line total in centavos for one cart line */
const lineTotal = l => product(l.id).price * 100 * l.qty;

/* ---------- COMPUTATION: subtotal, VAT, total, item count ---------- */
function totals(){
  const subC = state.cart.reduce((s, l) => s + lineTotal(l), 0);   // subtotal (centavos)
  const vatC = Math.round(subC * VAT_RATE);                        // VAT (centavos, rounded)
  return {
    subC,
    vatC,
    totC: subC + vatC,                                             // grand total
    count: state.cart.reduce((s, l) => s + l.qty, 0),              // total pieces
  };
}

/* ---------- ORDERING: cart operations ---------- */

/* The single place where quantity changes — always clamped to 0..99.
   Setting qty to 0 removes the line. Returns the new quantity. */
function setQty(id, q){
  q = Math.max(0, Math.min(MAX_QTY, Math.floor(q)));
  const line = state.cart.find(l => l.id === id);
  if(q === 0){ state.cart = state.cart.filter(l => l.id !== id); }
  else if(line){ line.qty = q; }
  else { state.cart.push({id, qty:q}); }
  return q;
}

/* Add/subtract by delta (+1 / -1). Returns a result so the UI can react:
   {changed:boolean, qty:number, removed:boolean, maxed:boolean} */
function bump(id, delta){
  const q = qtyOf(id);
  if(delta > 0 && q >= MAX_QTY) return {changed:false, qty:q, removed:false, maxed:true};
  if(delta < 0 && q <= 0)       return {changed:false, qty:q, removed:false, maxed:false};
  const nq = setQty(id, q + delta);
  return {changed:true, qty:nq, removed: nq === 0, maxed:false};
}

const removeItem = id => setQty(id, 0);
const clearCart  = () => { state.cart = []; };
const itemsIn    = catId => PRODUCTS.filter(p => p.cat === catId);

/* ---------- ORDER FLOW ---------- */

/* Step 1: choose Dine In / Take Out — starts a fresh order */
function startOrder(type){
  state.type = type;
  state.cart = [];
  state.method = null;
  state.cat = CATS[0].id;
}

/* Step 2: validation before "Proceed to Payment" */
function canProceed(){
  return state.cart.length > 0;   // empty cart is blocked
}

/* Step 3: choose Cash / Card / E-Wallet */
function selectMethod(method){
  state.method = method;
}

/* Order numbers run #101 → #999, then wrap to #101.
   Persisted in localStorage when available (browser). */
const _mem = {n:100};
function nextOrderNo(){
  let n = 100;
  try{ n = +localStorage.getItem('ccpos_order') || 100; }
  catch(e){ n = _mem.n; }
  n = n >= 999 ? 101 : n + 1;
  try{ localStorage.setItem('ccpos_order', n); }
  catch(e){ _mem.n = n; }
  return n;
}

/* Step 4: finalize — builds the order record (used for the receipt) */
function completeOrder(){
  if(!state.method || !state.cart.length) return null;
  state.order = {
    no: nextOrderNo(),
    type: state.type,
    method: state.method,
    time: new Date(),
    items: state.cart.map(l => ({
      name: product(l.id).name,
      qty:  l.qty,
      unit: product(l.id).price * 100,        // centavos
    })),
    totals: totals(),                         // {subC, vatC, totC, count}
  };
  return state.order;
}

/* Reset everything (Cancel Order / New Transaction / timeout) */
function resetAll(){
  state.type = null;
  state.cart = [];
  state.method = null;
  state.order = null;
  state.cat = CATS[0].id;
}

/* ---------- Receipt (plain-text version of buildReceipt) ---------- */
const METHOD_LBL = {'Cash':'Cash (pay at counter)', 'Card':'Debit / Credit Card', 'E-Wallet':'E-Wallet'};
function receiptText(o){
  const W = 36, row = (a, b) => a + ' '.repeat(Math.max(1, W - a.length - b.length)) + b;
  const line = '-'.repeat(W);
  return [
    'CAMPUS CAFETERIA', 'Self-Order Kiosk', line,
    row('Order No.', '#' + o.no),
    row('Order Type', o.type),
    row('Date', o.time.toLocaleString('en-PH', {dateStyle:'medium', timeStyle:'short'})),
    line,
    ...o.items.map(i => row(i.qty + 'x ' + i.name, peso(i.unit * i.qty))),
    line,
    row('Subtotal', peso(o.totals.subC)),
    row('VAT (12%)', peso(o.totals.vatC)),
    row('TOTAL', peso(o.totals.totC)),
    line,
    row('Payment', METHOD_LBL[o.method]),
    line, 'Thank you! Enjoy your meal',
  ].join('\n');
}

/* ---------- Node export (ignored in the browser) ---------- */
if(typeof module !== 'undefined' && module.exports){
  module.exports = {VAT_RATE, MAX_QTY, CATS, PRODUCTS, state, product, qtyOf, peso, lineTotal,
    totals, setQty, bump, removeItem, clearCart, itemsIn, startOrder, canProceed,
    selectMethod, nextOrderNo, completeOrder, resetAll, receiptText};
}
