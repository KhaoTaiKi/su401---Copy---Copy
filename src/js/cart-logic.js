let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedPayment = 'เงินสด';

document.addEventListener('DOMContentLoaded', () => { renderCart(); });

function selectPayment(method) {
    selectedPayment = method;
    document.getElementById('pay-cash').classList.toggle('active', method === 'เงินสด');
    document.getElementById('pay-prompt').classList.toggle('active', method === 'PromptPay');
}

function renderCart() {
    const listContainer = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('total-price');
    if (cart.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding-top:50px; color:#999;">ตะกร้าว่างเปล่า</div>';
        totalEl.innerText = '0.-';
        return;
    }
    const groupedCart = cart.reduce((groups, item) => {
        const shop = item.shop || 'ร้านทั่วไป';
        if (!groups[shop]) groups[shop] = [];
        groups[shop].push(item);
        return groups;
    }, {});
    let grandTotal = 0;
    let html = '';
    for (const shopName in groupedCart) {
        const currentOption = groupedCart[shopName][0].diningOption || 'eat-in';
        let shopSubtotal = 0;
        html += `
            <div class="shop-group-container">
                <div class="shop-group-header">🏪 ${shopName}</div>
                <div class="items-list">
                    ${groupedCart[shopName].map((item) => {
                        const itemIndex = cart.indexOf(item);
                        shopSubtotal += (item.price * item.qty);
                        return `<div class="cart-item-card">
                            <div class="item-info"><h4>${item.name}</h4><span>${item.price * item.qty}.-</span></div>
                            <div class="stepper">
                                <button class="step-btn" onclick="updateQty(${itemIndex}, -1)">-</button>
                                <span>${item.qty}</span>
                                <button class="step-btn" onclick="updateQty(${itemIndex}, 1)">+</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
                <div class="dining-options">
                    <button class="option-btn ${currentOption === 'eat-in' ? 'active' : ''}" onclick="updateDiningOption('${shopName}', 'eat-in')">กินที่นี่</button>
                    <button class="option-btn ${currentOption === 'take-out' ? 'active' : ''}" onclick="updateDiningOption('${shopName}', 'take-out')">หิ้วจาน (+5)</button>
                    <button class="option-btn ${currentOption === 'bag' ? 'active' : ''}" onclick="updateDiningOption('${shopName}', 'bag')">ใส่ถุง (+5)</button>
                </div>
                <div class="shop-notes-area"><input type="text" placeholder="หมายเหตุถึงร้าน ${shopName}..." value="${groupedCart[shopName][0].shopNotes || ''}" onchange="updateShopNotes('${shopName}', this.value)"></div>
            </div>`;
        if (currentOption !== 'eat-in') shopSubtotal += 5;
        grandTotal += shopSubtotal;
    }
    listContainer.innerHTML = html;
    totalEl.innerText = `${grandTotal}.-`;
}

function updateDiningOption(shopName, option) {
    cart.forEach(item => { if (item.shop === shopName) item.diningOption = option; });
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function updateShopNotes(shopName, noteValue) {
    cart.forEach(item => { if (item.shop === shopName) item.shopNotes = noteValue; });
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// ✨ อัปเดต: เปลี่ยนจาก alert เป็นสั่งโชว์ Modal กลางจอ
function confirmOrder() {
    if (cart.length === 0) return;
    const activeOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const queueNum = Math.floor(Math.random() * 90) + 10;
    
    const newOrder = {
        id: Date.now(),
        queue: queueNum,
        items: [...cart],
        payment: selectedPayment,
        timestamp: new Date().getTime()
    };
    activeOrders.push(newOrder);
    localStorage.setItem('activeOrders', JSON.stringify(activeOrders));
    localStorage.removeItem('cart');

    // โชว์ Modal แทน alert
    document.getElementById('success-msg').innerText = `ชำระเงินผ่าน ${selectedPayment} สำเร็จ!`;
    document.getElementById('success-overlay').style.display = 'flex';
}

function goToStatus() {
    location.href = 'order-status.html';
}