// # จัดเก็บประวัติการดูต้นไม้ใน sessionStorage ด้วยโครงสร้าง Stack
// # ชื่อคีย์ที่ใช้เก็บประวัติการดูไว้ใน sessionStorage
const PLANT_VIEW_HISTORY_KEY = "treflePlantViewHistory";

// # สร้าง Stack สำหรับเก็บประวัติการเปิดดูต้นไม้
class PlantViewHistoryStack {
    constructor(entries) {
        // # items เก็บข้อมูล ส่วน top ชี้ตำแหน่งรายการล่าสุด
        this.items = [];
        this.top = -1;

        // # ถ้าข้อมูลเดิมไม่ใช่ Array ให้เริ่มต้นเป็น Stack ว่าง
        if (!Array.isArray(entries)) {
            return;
        }

        // # นำประวัติที่อ่านได้กลับเข้า Stack ตามลำดับเดิม
        for (let index = 0; index < entries.length; index++) {
            const entry = entries[index];
            // # รับเฉพาะรายการที่มี slug ซึ่งใช้ระบุต้นไม้
            if (entry && typeof entry.slug === "string") {
                this.add(entry);
            }
        }
    }

    // # เพิ่มรายการใหม่ไว้บนสุดของ Stack โดยเลื่อนตำแหน่ง top
    add(entry) {
        this.top++;
        this.items[this.top] = entry;
    }

    // # อ่านรายการจากด้านบน โดย offset 0 คือรายการล่าสุด
    getFromTop(offset) {
        const index = this.top - offset;
        if (offset < 0 || index < 0 || index > this.top) {
            return null;
        }

        return this.items[index];
    }

    // # คืนจำนวนรายการทั้งหมดใน Stack
    size() {
        return this.top + 1;
    }

    // # ล้างรายการทั้งหมดโดยลด top ลงทีละตำแหน่ง
    clear() {
        while (this.top >= 0) {
            this.items[this.top] = undefined;
            this.top--;
        }
    }

    // # คัดลอกข้อมูลใน Stack เป็น Array เพื่อบันทึกลง sessionStorage
    toArray() {
        const entries = [];
        for (let index = 0; index <= this.top; index++) {
            entries[index] = this.items[index];
        }

        return entries;
    }
}

// # อ่านประวัติจาก sessionStorage แล้วสร้าง Stack กลับขึ้นมา
function readPlantViewHistory() {
    try {
        const savedEntries = JSON.parse(
            sessionStorage.getItem(PLANT_VIEW_HISTORY_KEY) || "[]"
        );
        return new PlantViewHistoryStack(savedEntries);
    } catch (error) {
        console.error("Unable to load plant view history:", error);
        return new PlantViewHistoryStack([]);
    }
}

// # สร้าง Stack เริ่มต้นจากข้อมูลที่อ่านได้
const plantViewHistoryStack = readPlantViewHistory();

// # บันทึกข้อมูลปัจจุบันของ Stack กลับลง sessionStorage
function savePlantViewHistory() {
    try {
        sessionStorage.setItem(
            PLANT_VIEW_HISTORY_KEY,
            JSON.stringify(plantViewHistoryStack.toArray())
        );
    } catch (error) {
        console.error("Unable to save plant view history:", error);
    }
}

// # เปิดฟังก์ชันจัดการประวัติให้สคริปต์หน้าอื่นเรียกใช้ได้
window.plantViewHistory = {
    // # ตรวจสอบและเพิ่มข้อมูลต้นไม้ที่ผู้ใช้เพิ่งเปิดดู
    record(plant) {
        if (!plant || typeof plant.slug !== "string") {
            throw new TypeError("A plant with a slug is required for view history.");
        }

        plantViewHistoryStack.add({
            slug: plant.slug,
            common_name: plant.common_name || "Unknown plant",
            scientific_name: plant.scientific_name || "",
            image_url: plant.image_url || "",
            viewedAt: new Date().toISOString()
        });
        savePlantViewHistory();
    },

    // # อ่านรายการประวัติตามตำแหน่งจากด้านบนของ Stack
    getFromTop(offset) {
        return plantViewHistoryStack.getFromTop(offset);
    },

    // # คืนจำนวนรายการประวัติที่บันทึกไว้
    size() {
        return plantViewHistoryStack.size();
    },

    // # ล้าง Stack และบันทึกสถานะว่างลง sessionStorage
    clear() {
        plantViewHistoryStack.clear();
        savePlantViewHistory();
    }
};
