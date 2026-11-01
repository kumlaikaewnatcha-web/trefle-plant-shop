// # ตัวอย่าง API Favorites สำหรับ Express: ใช้ Map ของ process เท่านั้น
const favorites = new Map();

// # เพิ่มหรือแทนที่รายการด้วย slug เพื่อป้องกันคีย์ซ้ำ
function addFavorite(plant) {
    favorites.set(plant.slug, plant);
}

// # ลบรายการโปรดด้วย slug
function removeFavorite(slug) {
    favorites.delete(slug);
}

// # ส่งรายการทั้งหมดกลับเป็น Array สำหรับ API
function getFavorites() {
    return Array.from(favorites.values());
}

// # ตรวจสอบว่ามีต้นไม้ slug นี้อยู่ในรายการโปรดหรือไม่
function isFavorite(slug) {
    return favorites.has(slug);
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite
};