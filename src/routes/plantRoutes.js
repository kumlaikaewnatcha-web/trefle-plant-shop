const express = require("express");
const router = express.Router();

const {
    searchPlants,
    getPlantDetail
} = require("../services/trefleService");

// ค้นหาต้นไม้
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                error: "กรุณาระบุชื่อต้นไม้"
            });
        }

        const data = await searchPlants(q);

        res.json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "ไม่สามารถค้นหาข้อมูลจาก Trefle ได้"
        });
    }
});

// ดูรายละเอียดต้นไม้
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;

        const data = await getPlantDetail(slug);

        res.json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "ไม่สามารถดึงรายละเอียดต้นไม้ได้"
        });
    }
});

module.exports = router;