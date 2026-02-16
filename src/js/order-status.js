document.addEventListener('DOMContentLoaded', () => {
    renderActiveOrders();
    setInterval(renderActiveOrders, 2000);
});

function renderActiveOrders() {
    const activeOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const container = document.querySelector('.status-content');
    if (activeOrders.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding-top:50px; color:#999;">ไม่มีออเดอร์ที่กำลังดำเนินการ</div>';
        return;
    }
    const currentTime = new Date().getTime();

    container.innerHTML = activeOrders.map(order => {
        const secondsPassed = Math.floor((currentTime - order.timestamp) / 1000);
        let status = 1; 
        if (secondsPassed > 15) status = 3; 
        else if (secondsPassed > 5) status = 2; 

        const optionMap = { 'eat-in': 'กินที่นี่', 'take-out': 'หิ้วจาน', 'bag': 'ใส่ถุง' };
        const diningText = optionMap[order.items[0].diningOption] || 'กินที่นี่';

        return `
            <div class="order-card-group" style="margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
                <div class="queue-card" style="background: ${status === 3 ? '#10b981' : '#3b82f6'}">
                    <span>คิวของคุณ (${order.payment})</span>
                    <h1>#${order.queue}</h1>
                    <div class="badge">${diningText}</div>
                </div>
                <div class="tracking-list">
                    <div class="track-item ${status >= 1 ? 'active' : ''}"><div class="track-dot"></div><div class="track-text"><p class="title">รับออเดอร์แล้ว</p></div></div>
                    <div class="track-line ${status >= 2 ? 'active' : ''}"></div>
                    <div class="track-item ${status >= 2 ? 'active' : ''}"><div class="track-dot"></div><div class="track-text"><p class="title">กำลังปรุงอาหาร</p></div></div>
                    <div class="track-line ${status >= 3 ? 'active' : ''}"></div>
                    <div class="track-item ${status >= 3 ? 'active' : ''}"><div class="track-dot"></div><div class="track-text"><p class="title">อาหารเสร็จแล้ว</p></div></div>
                </div>
                <div class="order-summary-box">
                    ${order.items.map(i => `<div class="item-line"><span>${i.name} x${i.qty}</span></div>`).join('')}
                </div>
                ${status === 3 ? `<button onclick="clearOrder(${order.id})" style="width:100%; margin-top:10px; padding:12px; border-radius:12px; border:none; background:#1e293b; color:white; font-weight:bold; cursor:pointer;">รับอาหารแล้ว (ลบออก)</button>` : ''}
            </div>`;
    }).join('');
}

function clearOrder(orderId) {
    let activeOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    activeOrders = activeOrders.filter(o => o.id !== orderId);
    localStorage.setItem('activeOrders', JSON.stringify(activeOrders));
    renderActiveOrders();
}