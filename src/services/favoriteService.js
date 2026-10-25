// # จัดเก็บและจัดการข้อมูล Favorite ในหน่วยความจำของเซิร์ฟเวอร์
const favorites = new Map();

// # เพิ่มหรือแทนที่รายการด้วย slug เพื่อไม่ให้มีคีย์ซ้ำ
function addFavorite(plant) {
    favorites.set(plant.slug, plant);
}

// # ลบรายการ Favorite ตาม slug
function removeFavorite(slug) {
    favorites.delete(slug);
}

// # คืนรายการทั้งหมดเป็น Array สำหรับส่งให้ API
function getFavorites() {
    return Array.from(favorites.values());
}

// # ตรวจสอบว่ามี slug นี้อยู่ในรายการ Favorite หรือไม่
function isFavorite(slug) {
    return favorites.has(slug);
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite
};