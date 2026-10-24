// # แสดงรายการประวัติการดูและจัดการปุ่มล้างประวัติในหน้านี้
// # เลือกพื้นที่แสดงรายการประวัติการดูจากหน้า HTML
const viewHistoryList =
    document.getElementById("viewHistoryList");

// # เลือกปุ่มสำหรับล้างประวัติการดูทั้งหมด
const clearViewHistoryButton =
    document.getElementById("clearViewHistoryButton");

// # เมื่อกดปุ่ม ให้ล้างข้อมูลใน Stack แล้ววาดหน้าใหม่
clearViewHistoryButton.addEventListener(
    "click",
    function () {
        window.plantViewHistory.clear();
        renderViewHistory();
    }
);

// # สร้างรายการต้นไม้ที่ผู้ใช้เคยเปิดดู
function renderViewHistory() {
    // # ล้างการ์ดเดิมก่อนแสดงข้อมูลล่าสุด
    viewHistoryList.innerHTML = "";

    // # ถ้า Stack ว่าง ให้แสดงข้อความแนะนำและปิดปุ่มล้าง
    if (window.plantViewHistory.size() === 0) {
        viewHistoryList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌱</div>
                <h3>No view history</h3>
                <p>Select a plant and click “View details” to save it to your history</p>
                <a href="index.html" class="favorites-link">🌿 Explore Plants</a>
            </div>
        `;
        clearViewHistoryButton.disabled = true;
        return;
    }

    // # เปิดให้กดล้างได้เมื่อมีประวัติอย่างน้อยหนึ่งรายการ
    clearViewHistoryButton.disabled = false;

    // # วนอ่าน Stack จากรายการล่าสุดไปยังรายการเก่ากว่า
    for (let index = 0; index < window.plantViewHistory.size(); index++) {
        const plant = window.plantViewHistory.getFromTop(index);
        const card = document.createElement("article");
        card.className = "plant-card";

        // # สร้างรูปต้นไม้เมื่อมี URL รูปภาพ
        if (plant.image_url) {
            const image = document.createElement("img");
            image.className = "plant-image";
            image.src = plant.image_url;
            image.alt = plant.common_name;
            image.onerror = function () {
                image.style.display = "none";
            };
            card.appendChild(image);
        }

        // # แสดงชื่อสามัญของต้นไม้
        const title = document.createElement("h3");
        title.textContent = plant.common_name;
        card.appendChild(title);

        // # แสดงชื่อวิทยาศาสตร์ ถ้าไม่มีให้ใช้ข้อความสำรอง
        const scientific = document.createElement("p");
        scientific.className = "scientific-name";
        scientific.textContent =
            plant.scientific_name || "Scientific name unavailable";
        card.appendChild(scientific);

        // # แสดงวันและเวลาที่เปิดดูต้นไม้
        const viewedAt = document.createElement("p");
        viewedAt.className = "history-viewed-at";
        const date = new Date(plant.viewedAt);
        viewedAt.textContent = Number.isNaN(date.getTime())
            ? "Viewed most recently"
            : `Viewed on ${date.toLocaleString("en-US")}`;
        card.appendChild(viewedAt);

        // # สร้างลิงก์สำหรับกลับไปหน้ารายละเอียดของต้นไม้นั้น
        const buttons = document.createElement("div");
        buttons.className = "card-buttons";
        const detailLink = document.createElement("a");
        detailLink.className = "secondary-button";
        detailLink.href = `plantDetail.html?slug=${encodeURIComponent(plant.slug)}`;
        detailLink.textContent = "View details";
        buttons.appendChild(detailLink);
        card.appendChild(buttons);

        // # เพิ่มการ์ดต้นไม้ลงในหน้าประวัติ
        viewHistoryList.appendChild(card);
    }
}

// # วาดประวัติทันทีเมื่อเปิดหน้า
renderViewHistory();
