const canteens = [
    { id: 'sakaeo', name: 'โรงอาหารสระแก้ว' },
    { id: 'phetcharat', name: 'โรงอาหารเพชรรัตน์' },
    { id: 'ml-pin', name: 'อาคาร มล.ปิ่น' },
    { id: 'engineering', name: 'ใต้ตึกกระทะ (วิศวะ)' }
];

const promoItems = [
    { type: "โปรโมชั่น", color: "#FF6B6B" }, { type: "โฆษณา", color: "#FFD93D" },
    { type: "โปรโมชั่น", color: "#6BCB77" }, { type: "โฆษณา", color: "#4D96FF" },
    { type: "โปรโมชั่น", color: "#9A616D" }, { type: "โฆษณา", color: "#FF8E00" },
    { type: "โปรโมชั่น", color: "#8338EC" }, { type: "โฆษณา", color: "#3A86FF" },
    { type: "โปรโมชั่น", color: "#FB5607" }, { type: "โฆษณา", color: "#FF006E" }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCanteen = canteens[0];
let currentCategory = 'ทั้งหมด';
let currentSlideIndex = 1;
const FULL_STEP = 280; 
let isTransitioning = false;

document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('userName') || 'นักศึกษา';
    document.getElementById('display-name').innerText = savedName;
    initPromoSlider();
    setInterval(nextPromo, 3000);
    renderCanteenList();
    updateBadge(); 
    refreshAppData();
    enableWheelScroll('shop-list');
    enableWheelScroll('top-5-list');

    // ✨ เริ่มระบบเฝ้าดูสถานะออเดอร์เบื้องหลัง
    setInterval(watchOrdersStatus, 3000);
});

// ✨ ฟังก์ชันเฝ้าดูสถานะอาหารรวบยอด
function watchOrdersStatus() {
    let activeOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    if (activeOrders.length === 0) return;

    const currentTime = new Date().getTime();
    let newlyReadyShops = [];
    let hasChanged = false;

    activeOrders.forEach(order => {
        const secondsPassed = Math.floor((currentTime - order.timestamp) / 1000);
        
        // ถ้าเวลาผ่านไป > 15 วิ (สถานะเสร็จ) และยังไม่เคยแจ้งเตือน
        if (secondsPassed > 15 && !order.isNotified) {
            const shopName = order.items[0].shop || "ร้านอาหาร";
            newlyReadyShops.push(`คิว #${order.queue} (${shopName})`);
            order.isNotified = true; // ทำเครื่องหมายว่าแจ้งเตือนแล้ว
            hasChanged = true;
        }
    });

    if (hasChanged) {
        localStorage.setItem('activeOrders', JSON.stringify(activeOrders));
        showNotificationModal(newlyReadyShops);
    }
}

function showNotificationModal(shops) {
    const overlay = document.getElementById('notif-overlay');
    const list = document.getElementById('ready-shops-list');
    
    // เพิ่มรายชื่อร้านลงใน Modal (รองรับกรณีเสร็จพร้อมกันหลายร้าน)
    shops.forEach(shop => {
        const item = document.createElement('div');
        item.className = 'ready-item';
        item.innerText = `✅ ${shop}`;
        list.appendChild(item);
    });

    overlay.style.display = 'flex';
}

function goToStatus() {
    window.location.href = 'order-status.html';
}

function addToCart(name, price, shopName) {
    const existingItem = cart.find(item => item.name === name && item.shop === shopName);
    if (existingItem) { existingItem.qty += 1; } 
    else { cart.push({ name, price, qty: 1, shop: shopName, shopNotes: "", diningOption: "eat-in" }); }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateBadge();
}

function updateBadge() {
    const cartBtn = document.querySelector('.cart-control');
    const badge = document.getElementById('cart-count');
    if (!cartBtn || !badge) return;
    const activeOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty > 0) {
        cartBtn.innerHTML = `🛒 <span id="cart-count" class="cart-count">${totalQty}</span>`;
        cartBtn.onclick = () => window.location.href = 'cart.html';
    } else if (activeOrders.length > 0) {
        cartBtn.innerHTML = `⏳ <span id="cart-count" class="cart-count">${activeOrders.length}</span>`;
        cartBtn.onclick = () => window.location.href = 'order-status.html';
    } else {
        cartBtn.innerHTML = `🛒 <span id="cart-count" class="cart-count">0</span>`;
        cartBtn.onclick = () => window.location.href = 'cart.html';
    }
}

function viewCart() { window.location.href = 'cart.html'; }

function openShopSheet(shopId) {
    const sheet = document.getElementById('shop-sheet');
    const overlay = document.getElementById('sheet-overlay');
    const content = document.getElementById('shop-sheet-content');
    const shopName = `ร้านที่ ${shopId}`;
    const shopMenus = [{ name: `เมนูเด็ด (1)`, price: 50 }, { name: `เมนูเด็ด (2)`, price: 45 }, { name: `เมนูเด็ด (3)`, price: 60 }];
    content.innerHTML = `<div class="sheet-header"><div class="sheet-shop-img"></div><h2 class="sheet-shop-name">${shopName}</h2><p style="font-size:12px; color:#64748b;">${currentCanteen.name}</p></div><div class="shop-menu-list">${shopMenus.map(m => `<div class="shop-menu-item"><div class="menu-item-info"><span class="menu-item-name">${m.name}</span><span class="menu-item-price">${m.price}.-</span></div><button class="add-btn" onclick="addToCart('${m.name}', ${m.price}, '${shopName}')">+</button></div>`).join('')}</div>`;
    overlay.style.display = 'block';
    setTimeout(() => sheet.classList.add('active'), 10);
}

function closeShopSheet() {
    const sheet = document.getElementById('shop-sheet');
    const overlay = document.getElementById('sheet-overlay');
    sheet.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 400);
}

function refreshAppData() { renderTop5(); renderShops(); renderAllFood(); }
function selectCategory(category, element) { currentCategory = category; document.querySelectorAll('.cat-item').forEach(btn => btn.classList.remove('active')); element.classList.add('active'); refreshAppData(); }
function renderShops() { const container = document.getElementById('shop-list'); let html = ''; const types = ['จานเดียว', 'เส้น', 'ของหวาน']; for(let i = 1; i <= 30; i++) { const t = types[i % 3]; if (currentCategory === 'ทั้งหมด' || currentCategory === t) { html += `<div class="shop-item" onclick="openShopSheet(${i})"><div class="shop-circle">${t==='เส้น'?'🍜':(t==='ของหวาน'?'🍰':'🍱')}</div><span class="shop-name-label">ร้านที่ ${i}</span></div>`; } } container.innerHTML = html; }
function renderTop5() { const container = document.getElementById('top-5-list'); const allTops = [{ name: 'ข้าวกะเพราหมูกรอบ', price: 50, cat: 'จานเดียว' }, { name: 'ก๋วยเตี๋ยวต้มยำ', price: 45, cat: 'เส้น' }, { name: 'ข้าวไข่เจียว', price: 35, cat: 'จานเดียว' }]; const filtered = allTops.filter(f => currentCategory === 'ทั้งหมด' || f.cat === currentCategory); container.innerHTML = filtered.map(f => `<div class="top-card"><div class="top-img"></div><div class="top-info"><span class="top-name">${f.name}</span><span class="top-price">${f.price}.-</span><button class="add-btn-mini" onclick="addToCart('${f.name}', ${f.price}, 'ร้านยอดฮิต')">+</button></div></div>`).join(''); }
function renderAllFood() { const container = document.getElementById('full-menu-grid'); let html = ''; const types = ['จานเดียว', 'เส้น', 'ของหวาน']; for(let i = 1; i <= 12; i++) { const t = types[i % 3]; if (currentCategory === 'ทั้งหมด' || currentCategory === t) { html += `<div class="food-card"><div class="food-img-area"></div><div class="food-info-area"><h4 class="food-title">${t} แนะนำที่ ${i}</h4><div class="price-row"><span class="food-price-tag">45.-</span><button class="add-btn" onclick="addToCart('${t} แนะนำที่ ${i}', 45, '${currentCanteen.name}')">+</button></div></div></div>`; } } container.innerHTML = html; }
function enableWheelScroll(id) { const el = document.getElementById(id); el.addEventListener('wheel', (e) => { if (e.deltaY !== 0) { e.preventDefault(); el.scrollLeft += e.deltaY; } }); }
function initPromoSlider() { const track = document.getElementById('promo-slider'); const fClone = promoItems[0]; const lClone = promoItems[promoItems.length - 1]; let h = `<div class="promo-card" style="background:${lClone.color}"><span>${lClone.type}</span></div>`; h += promoItems.map(i => `<div class="promo-card" style="background:${i.color}"><span>${i.type}</span></div>`).join(''); h += `<div class="promo-card" style="background:${fClone.color}"><span>${fClone.type}</span></div>`; track.innerHTML = h; track.addEventListener('transitionend', () => { isTransitioning = false; if (currentSlideIndex === 0) { currentSlideIndex = promoItems.length; updatePos(false); } if (currentSlideIndex === promoItems.length + 1) { currentSlideIndex = 1; updatePos(false); } }); updatePos(false); }
function updatePos(ani) { const t = document.getElementById('promo-slider'); const cw = document.querySelector('.promo-section').offsetWidth; const off = (cw / 2) - (280 / 2); t.style.transition = ani ? 'transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)' : 'none'; t.style.transform = `translateX(${-(currentSlideIndex * FULL_STEP) + off}px)`; document.querySelectorAll('.promo-card').forEach((c, i) => c.classList.toggle('active', i === currentSlideIndex)); }
function nextPromo() { if (!isTransitioning) { isTransitioning = true; currentSlideIndex++; updatePos(true); } }
function toggleDropdown() { document.getElementById('canteen-list').classList.toggle('show'); document.getElementById('drop-arrow').classList.toggle('rotate'); }
function renderCanteenList() { document.getElementById('canteen-list').innerHTML = canteens.map(c => `<div class="canteen-item ${c.id === currentCanteen.id ? 'selected' : ''}" onclick="selectCanteen('${c.id}')">${c.name} ${c.id === currentCanteen.id ? '✓' : ''}</div>`).join(''); }
function selectCanteen(id) { currentCanteen = canteens.find(c => c.id === id); document.getElementById('active-canteen').innerText = currentCanteen.name; toggleDropdown(); renderCanteenList(); refreshAppData(); }