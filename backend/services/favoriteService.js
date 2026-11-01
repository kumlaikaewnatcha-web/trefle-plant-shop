const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(__dirname, "../data");
const favoritesFile = path.join(dataDirectory, "favorites.json");

// # โหลดรายการโปรดจากที่เก็บฝั่ง backend เมื่อเซิร์ฟเวอร์เริ่มทำงาน
const favorites = new Map();

function loadFavorites() {
    try {
        if (!fs.existsSync(favoritesFile)) return;

        const storedFavorites = JSON.parse(fs.readFileSync(favoritesFile, "utf8"));
        if (!Array.isArray(storedFavorites)) return;

        storedFavorites.forEach(plant => {
            if (plant && typeof plant.slug === "string") {
                favorites.set(plant.slug, plant);
            }
        });
    } catch (error) {
        console.error("Unable to load favorites:", error);
    }
}

function saveFavorites() {
    fs.mkdirSync(dataDirectory, { recursive: true });
    const temporaryFile = `${favoritesFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(Array.from(favorites.values()), null, 2));
    fs.renameSync(temporaryFile, favoritesFile);
}

// # เพิ่มหรือแทนที่รายการด้วย slug เพื่อป้องกันคีย์ซ้ำ
function addFavorite(plant) {
    favorites.set(plant.slug, plant);
    saveFavorites();
}

// # ลบรายการโปรดด้วย slug
function removeFavorite(slug) {
    favorites.delete(slug);
    saveFavorites();
}

// # ส่งรายการทั้งหมดกลับเป็น Array สำหรับ API
function getFavorites() {
    return Array.from(favorites.values());
}

// # ตรวจสอบว่ามีต้นไม้ slug นี้อยู่ในรายการโปรดหรือไม่
function isFavorite(slug) {
    return favorites.has(slug);
}

loadFavorites();

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite
};