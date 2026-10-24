// # กำหนด API endpoints สำหรับค้นหา ดูคำแนะนำ และดูรายละเอียดต้นไม้
const express = require("express");
const router = express.Router();

const {
    searchPlants,
    getPlantDetail,
    getFlowerRecommendations
} = require("../services/trefleService");

// # รับคำค้นจาก query string แล้วส่งผลการค้นหาจากบริการ Trefle
router.get("/search", async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
        return res.status(400).json({ error: "กรุณาระบุชื่อต้นไม้" });
    }

    res.json(await searchPlants(query));
});

// # ส่งชุดดอกไม้แนะนำที่บริการรวบรวมและจัดอันดับแล้ว
router.get("/recommendations", async (req, res) => {
    res.json({ data: await getFlowerRecommendations() });
});

// # ค้นหารายละเอียดต้นไม้จาก slug ที่ระบุใน URL
router.get("/:slug", async (req, res) => {
    res.json(await getPlantDetail(req.params.slug));
});

module.exports = router;
