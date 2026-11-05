// # กำหนด API endpoints สำหรับเพิ่ม ดู ตรวจสอบ และลบรายการโปรด
const express = require("express");
const router = express.Router();

const {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite,
    getOwnerId
} = require("../services/favoriteService");

// # ตรวจสอบข้อมูลต้นไม้และเพิ่มลงในรายการโปรด
router.post("/", async (req, res, next) => {
    const plant = req.body;

    if (!plant || typeof plant.slug !== "string" || !plant.slug.trim()) {
        return res.status(400).json({ error: "Invalid plant data" });
    }

    try {
        await addFavorite(getOwnerId(req, res), plant);
        res.status(201).json({ data: plant });
    } catch (error) {
        next(error);
    }
});

// # ส่งรายการต้นไม้โปรดทั้งหมดกลับ
router.get("/", async (req, res, next) => {
    try {
        res.json({ data: await getFavorites(getOwnerId(req, res)) });
    } catch (error) {
        next(error);
    }
});

// # ตรวจสอบว่ามีต้นไม้ slug นี้อยู่ในรายการโปรดหรือไม่
router.get("/:slug", async (req, res, next) => {
    try {
        res.json({ favorite: await isFavorite(getOwnerId(req, res), req.params.slug) });
    } catch (error) {
        next(error);
    }
});

// # ลบต้นไม้ออกจากรายการโปรดด้วย slug
router.delete("/:slug", async (req, res, next) => {
    try {
        await removeFavorite(getOwnerId(req, res), req.params.slug);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;