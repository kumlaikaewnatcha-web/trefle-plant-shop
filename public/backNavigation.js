// # จัดการปุ่มย้อนกลับของหน้ารอง โดยใช้ประวัติเมื่อมาจากหน้าเดียวกัน
const backButton = document.querySelector("[data-back-button]");

if (backButton) {
    backButton.addEventListener("click", event => {
        // # ใช้ประวัติย้อนกลับเฉพาะเมื่อมาจากหน้าในเว็บไซต์เดียวกัน
        const referrer = document.referrer;

        if (referrer && new URL(referrer).origin === window.location.origin) {
            event.preventDefault();
            window.history.back();
        }
    });
}
