let currentTab = 'active'; // 'active' หรือ 'history'
let statusInterval;

document.addEventListener('DOMContentLoaded', () => {
    // ✨ ส่วนที่เพิ่ม: เช็คว่า URL มีคำว่า tab=history ต่อท้ายมาไหม (มาจากปุ่มประวัติ)
    const urlParams = new URLSearchParams(window.location.search);
    const targetTab = urlParams.get('tab');

    if (targetTab === 'history') {
        currentTab = 'history';
        // เปลี่ยนหน้าตาปุ่ม Tab ให้สว่างที่ปุ่ม "ประวัติย้อนหลัง" ทันที
        document.querySelectorAll('.tab-btn')[0].classList.remove('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else {
        currentTab = 'active';
    }

    renderOrders();
    
    // ให้เช็คสถานะทุกๆ 2 วินาที เฉพาะตอนอยู่หน้า "กำลังดำเนินการ"
    statusInterval = setInterval(() => {
        if(currentTab === 'active') renderOrders();
    }, 2000);
});

function switchTab(tabName) {
    currentTab = tabName;
    
    // สลับ Class ปุ่ม
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderOrders();
}

function renderOrders() {
    const allOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const container = document.getElementById('order-container');
    const currentTime = new Date().getTime();
    
    // แบ่งกลุ่มออเดอร์
    const activeList = allOrders.filter(o => !o.isCompleted);
    const historyList = allOrders.filter(o => o.isCompleted).reverse(); // เอาอันใหม่ขึ้นก่อน

    const listToRender = currentTab === 'active' ? activeList : historyList;

    if (listToRender.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding-top:50px; color:#94a3b8; font-weight: 500;">
            ${currentTab === 'active' ? 'ไม่มีออเดอร์ที่กำลังดำเนินการ' : 'ยังไม่มีประวัติการสั่งซื้อ'}
        </div>`;
        return;
    }

    container.innerHTML = listToRender.map(order => {
        const optionMap = { 'eat-in': 'กินที่นี่', 'take-out': 'จานพลาสติก', 'bag': 'ใส่ถุง' };
        const diningText = optionMap[order.items[0].diningOption] || 'กินที่นี่';
        const dateStr = new Date(order.timestamp).toLocaleString('th-TH');

        // ถ้าเป็นออเดอร์ที่กดรับแล้ว (อยู่ในหน้าประวัติ)
        if (order.isCompleted) {
            return `
            <div class="order-card-group history-card" style="margin-bottom: 25px;">
                <div class="history-date">สั่งเมื่อ: ${dateStr}</div>
                <div class="queue-card">
                    <span>คิว #${order.queue} (${order.payment})</span>
                    <div class="badge" style="margin-left:10px;">✅ รับอาหารแล้ว</div>
                </div>
                <div class="order-summary-box">
                    ${order.items.map(i => `<div class="item-line"><span>${i.name}</span><span>x${i.qty}</span></div>`).join('')}
                </div>
            </div>`;
        }

        // ถ้าเป็นออเดอร์ที่กำลังดำเนินการ
        const secondsPassed = Math.floor((currentTime - order.timestamp) / 1000);
        let status = 1; 
        let bgColor = '#f59e0b'; // สีส้ม (กำลังทำ)

        if (secondsPassed > 15) { 
            status = 3; 
            bgColor = '#10b981'; // สีเขียว (เสร็จแล้ว)
        } else if (secondsPassed > 5) { 
            status = 2; 
        }

        return `
        <div class="order-card-group" style="margin-bottom: 40px;">
            <div class="queue-card" style="background: ${bgColor}">
                <span>คิวของคุณ (${order.payment})</span>
                <h1>#${order.queue}</h1>
                <div class="badge">${diningText}</div>
            </div>
            
            <div class="tracking-list">
                <div class="track-item ${status >= 1 ? 'active' : ''}"><div class="track-dot"></div><div class="track-text"><p class="title">รับออเดอร์แล้ว</p></div></div>
                <div class="track-line ${status >= 2 ? 'active' : ''}"></div>
                <div class="track-item ${status >= 2 ? 'active' : ''}"><div class="track-dot"></div><div class="track-text"><p class="title">กำลังปรุงอาหาร</p></div></div>
                <div class="track-line ${status >= 3 ? 'active' : ''}"></div>
                <div class="track-item ${status >= 3 ? 'active' : ''}"><div class="track-dot"></div><div class="track-text"><p class="title" style="${status === 3 ? 'color:#10b981;' : ''}">อาหารเสร็จแล้ว</p></div></div>
            </div>

            <div class="order-summary-box">
                <p class="summary-label">สรุปรายการ</p>
                ${order.items.map(i => `<div class="item-line"><span>${i.name}</span><span>x${i.qty}</span></div>`).join('')}
            </div>

            ${status === 3 ? `<button class="btn-receive" onclick="completeOrder(${order.id})">✅ กดรับอาหาร</button>` : ''}
        </div>`;
    }).join('');
}

// ✨ ฟังก์ชันเมื่อผู้ใช้กด "รับอาหาร" (เอา Alert ออกแล้ว)
function completeOrder(orderId) {
    let allOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    
    // ค้นหาออเดอร์นั้นแล้วเปลี่ยนสถานะเป็น isCompleted = true
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        allOrders[orderIndex].isCompleted = true;
        localStorage.setItem('activeOrders', JSON.stringify(allOrders));
        
        // รีเฟรชหน้าจอทันทีที่กด ไม่ต้องมี Alert กวนใจ
        renderOrders(); 
    }
}
