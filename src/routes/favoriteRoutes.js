// # กำหนด API endpoints สำหรับเพิ่ม ดู ตรวจสอบ และลบรายการ Favorite
const express = require("express");
const router = express.Router();

const {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite
} = require("../services/favoriteService");

// # ตรวจข้อมูลต้นไม้และเพิ่มต้นไม้ในรายการ Favorite
router.post("/", (req, res) => {
    const plant = req.body;

    if (!plant || typeof plant.slug !== "string" || !plant.slug.trim()) {
        return res.status(400).json({ error: "ข้อมูลต้นไม้ไม่ถูกต้อง" });
    }

    addFavorite(plant);
    res.status(201).json({ data: plant });
});

// # คืนรายการต้นไม้ทั้งหมดที่อยู่ใน Favorite
router.get("/", (req, res) => {
    res.json({ data: getFavorites() });
});

// # ตรวจว่าต้นไม้ตาม slug อยู่ใน Favorite หรือไม่
router.get("/:slug", (req, res) => {
    res.json({ favorite: isFavorite(req.params.slug) });
});

// # นำต้นไม้ออกจาก Favorite ด้วย slug
router.delete("/:slug", (req, res) => {
    removeFavorite(req.params.slug);
    res.status(204).end();
});

module.exports = router;