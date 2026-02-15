// --- Function: Login ปกติ ---
function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    // แสดงตัวโหลด
    showLoading('กำลังตรวจสอบข้อมูล...'); 

    setTimeout(() => {
        // ตรวจสอบเงื่อนไข (ในที่นี้คือรหัส 1234)
        if(user.trim() !== "" && pass === "1234") {
            
            // 1. บันทึกชื่อผู้ใช้ลงในความจำเครื่อง
            localStorage.setItem('userName', user);
            
            hideLoading();
            showModal(true, 'สำเร็จ', 'กำลังพาคุณไปที่โรงอาหาร...');

            // 2. เปลี่ยนหน้าไปที่ menu.html หลังแสดงสถานะสำเร็จ 1.5 วินาที
            setTimeout(() => {
                window.location.href = 'menu.html'; 
            }, 1500);

        } else {
            // กรณีรหัสผิด
            hideLoading();
            showModal(false, 'เกิดข้อผิดพลาด', 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง');
        }
    }, 1500);
}

// --- Function: Login ด้วย SU Smart Plus ---
function handleSSOLogin() {
    showLoading('กำลังเชื่อมต่อ SU Smart Plus...');

    setTimeout(() => {
        hideLoading();
        
        // จำลองว่าระบบ SU ส่งชื่อกลับมา
        localStorage.setItem('userName', 'นักศึกษา (SU Smart Plus)');
        
        showModal(true, 'เชื่อมต่อสำเร็จ', 'ยินดีต้อนรับชาวศิลปากร');
        
        // เปลี่ยนหน้าไปที่ menu.html
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 1500);
    }, 2000);
}

// --- UI Helper Functions (เหมือนเดิม) ---
function showLoading(text) {
    document.getElementById('loadingText').innerText = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showModal(isSuccess, titleText, messageText) {
    const modal = document.getElementById('statusModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');

    icon.className = isSuccess ? 'status-icon success-icon' : 'status-icon error-icon';
    icon.innerHTML = isSuccess ? '✓' : '✕';
    title.innerText = titleText;
    msg.innerText = messageText;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('statusModal').style.display = 'none';
}