let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const listContainer = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('total-price');
    
    if (cart.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding-top:50px; color:#999;">ตะกร้าว่างเปล่า</div>';
        totalEl.innerText = '0.-';
        return;
    }

    // 1. จัดกลุ่มสินค้าตามร้านค้า
    const groupedCart = cart.reduce((groups, item) => {
        const shop = item.shop || 'ร้านทั่วไป';
        if (!groups[shop]) groups[shop] = [];
        groups[shop].push(item);
        return groups;
    }, {});

    // 2. สร้าง HTML แยกตามกลุ่มร้าน
    let total = 0;
    let html = '';

    for (const shopName in groupedCart) {
        html += `
            <div class="shop-group-container">
                <div class="shop-group-header">🏪 ${shopName}</div>
                ${groupedCart[shopName].map((item) => {
                    const itemIndex = cart.indexOf(item);
                    total += (item.price * item.qty);
                    return `
                        <div class="cart-item-card">
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <span>${item.price * item.qty}.-</span>
                            </div>
                            <div class="stepper">
                                <button class="step-btn" onclick="updateQty(${itemIndex}, -1)">-</button>
                                <span>${item.qty}</span>
                                <button class="step-btn" onclick="updateQty(${itemIndex}, 1)">+</button>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div class="shop-notes-area">
                    <input type="text" 
                           placeholder="หมายเหตุถึงร้าน ${shopName}..." 
                           value="${groupedCart[shopName][0].shopNotes || ''}" 
                           onchange="updateShopNotes('${shopName}', this.value)">
                </div>
            </div>
        `;
    }

    listContainer.innerHTML = html;
    totalEl.innerText = `${total}.-`;
}

function updateShopNotes(shopName, noteValue) {
    cart.forEach(item => {
        if (item.shop === shopName) item.shopNotes = noteValue;
    });
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function confirmOrder() {
    if (cart.length === 0) return;
    alert("สั่งซื้อสำเร็จ! แยกหมายเหตุตามแต่ละร้านค้าเรียบร้อยแล้วครับ");
    localStorage.removeItem('cart');
    location.href = 'menu.html';
}