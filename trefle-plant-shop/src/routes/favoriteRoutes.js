const express = require("express");
const router = express.Router();

const {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite
} = require("../services/favoriteService");

// เพิ่มต้นไม้ใน Favorite
router.post("/", (req, res) => {
    try {
        const plant = req.body;

        if (!plant || !plant.slug) {
            return res.status(400).json({
                error: "ข้อมูลต้นไม้ไม่ถูกต้อง"
            });
        }

        addFavorite(plant);

        res.json({
            message: "เพิ่ม Favorite สำเร็จ",
            data: plant
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "ไม่สามารถเพิ่ม Favorite ได้"
        });
    }
});

// ดูรายการ Favorite ทั้งหมด
router.get("/", (req, res) => {
    try {
        const favorites = getFavorites();

        res.json({
            data: favorites
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "ไม่สามารถดึงรายการ Favorite ได้"
        });
    }
});

// ตรวจสอบว่าเป็น Favorite หรือไม่
router.get("/:slug", (req, res) => {
    try {
        const { slug } = req.params;

        const favorite = isFavorite(slug);

        res.json({
            favorite: favorite
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "ไม่สามารถตรวจสอบ Favorite ได้"
        });
    }
});

// ลบต้นไม้ออกจาก Favorite
router.delete("/:slug", (req, res) => {
    try {
        const { slug } = req.params;

        removeFavorite(slug);

        res.json({
            message: "ลบ Favorite สำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "ไม่สามารถลบ Favorite ได้"
        });
    }
});

module.exports = router;