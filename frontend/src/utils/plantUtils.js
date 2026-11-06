// # เรียงชื่อต้นไม้ตามตัวอักษรด้วยอัลกอริทึม Insertion Sort
export function insertionSort(plants) {
    const sortedPlants = [...plants];

    for (let index = 1; index < sortedPlants.length; index += 1) {
        const current = sortedPlants[index];
        let previousIndex = index - 1;

        while (
            previousIndex >= 0 &&
            sortedPlants[previousIndex].common_name.localeCompare(current.common_name) > 0
        ) {
            sortedPlants[previousIndex + 1] = sortedPlants[previousIndex];
            previousIndex -= 1;
        }

        sortedPlants[previousIndex + 1] = current;
    }

    return sortedPlants;
}

// # ชื่อคีย์ที่ใช้เก็บสถานะค้นหาและประวัติใน sessionStorage
export const SEARCH_STATE_KEY = "treflePlantSearchState";
export const VIEW_HISTORY_KEY = "treflePlantViewHistory";
export const VIEW_HISTORY_LIMIT = 50;
export const FAVORITES_KEY = "trefleshop_favorites";

// # อ่านรายการโปรดที่บันทึกไว้ใน localStorage และกรองข้อมูลที่ไม่มี slug
export function readFavorites() {
    try {
        const plants = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
        return Array.isArray(plants)
            ? plants.filter(plant => plant && typeof plant.slug === "string")
            : [];
    } catch (error) {
        console.error("Unable to load favorite plants:", error);
        return [];
    }
}

// # บันทึกต้นไม้ลงรายการโปรดโดยไม่เกิดรายการซ้ำ
export function addFavoritePlant(plant) {
    if (!plant || typeof plant.slug !== "string") {
        throw new TypeError("A plant with a slug is required for favorites.");
    }

    const favorites = readFavorites().filter(savedPlant => savedPlant.slug !== plant.slug);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites, plant]));
}

// # ลบต้นไม้ออกจากรายการโปรดและส่งกลับรายการล่าสุด
export function removeFavoritePlant(slug) {
    const nextFavorites = readFavorites().filter(plant => plant.slug !== slug);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
    return nextFavorites;
}

// # ตรวจสอบว่าต้นไม้ถูกบันทึกเป็นรายการโปรดหรือไม่
export function isFavoritePlant(slug) {
    return readFavorites().some(plant => plant.slug === slug);
}

// # อ่านสถานะการค้นหาที่บันทึกไว้
export function readSearchState() {
    try {
        return JSON.parse(sessionStorage.getItem(SEARCH_STATE_KEY) || "null");
    } catch (error) {
        console.error("Unable to restore search state:", error);
        return null;
    }
}

// # บันทึกสถานะการค้นหา
export function saveSearchState(state) {
    try {
        sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Unable to save search state:", error);
    }
}

// # ลบสถานะการค้นหาที่บันทึกไว้
export function clearSearchState() {
    try {
        sessionStorage.removeItem(SEARCH_STATE_KEY);
    } catch (error) {
        console.error("Unable to clear search state:", error);
    }
}

// # อ่านและตรวจสอบรูปแบบรายการประวัติการดู
export function readViewHistory() {
    try {
        const entries = JSON.parse(sessionStorage.getItem(VIEW_HISTORY_KEY) || "[]");
        return Array.isArray(entries)
            ? entries.filter(entry => entry && typeof entry.slug === "string")
            : [];
    } catch (error) {
        console.error("Unable to load plant view history:", error);
        return [];
    }
}

// # บันทึกต้นไม้ที่เปิดดูพร้อมข้อมูลพื้นฐานและเวลาที่เข้าชม
export function recordPlantView(plant) {
    if (!plant || typeof plant.slug !== "string") {
        throw new TypeError("A plant with a slug is required for view history.");
    }

    const entries = readViewHistory();
    const nextEntry = {
        slug: plant.slug,
        common_name: plant.common_name || "Unknown plant",
        scientific_name: plant.scientific_name || "",
        image_url: plant.image_url || "",
        viewedAt: new Date().toISOString()
    };
    const updatedEntries = [
        nextEntry,
        ...entries.filter(entry => entry.slug !== plant.slug)
    ].slice(0, VIEW_HISTORY_LIMIT);

    try {
        sessionStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
        console.error("Unable to save plant view history:", error);
    }
}

// # ลบประวัติการดูทั้งหมดออกจาก sessionStorage
export function clearViewHistory() {
    try {
        sessionStorage.removeItem(VIEW_HISTORY_KEY);
    } catch (error) {
        console.error("Unable to clear plant view history:", error);
    }
}
