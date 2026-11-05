// # กำหนด API endpoints สำหรับค้นหาต้นไม้ ดูคำแนะนำ และดูรายละเอียด
const express = require("express");
const router = express.Router();

const {
    searchPlants,
    getPlantDetail,
    getFlowerRecommendations
} = require("../services/trefleService");

function asyncRoute(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

// # อ่านคำค้นจาก query string แล้วส่งผลการค้นหาจาก Trefle
router.get("/search", asyncRoute(async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
        return res.status(400).json({ error: "Please provide a plant name" });
    }

    res.json(await searchPlants(query));
}));

// # ส่งรายการดอกไม้แนะนำที่บริการรวบรวมและจัดอันดับไว้
router.get("/recommendations", asyncRoute(async (req, res) => {
    res.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    res.json({ data: await getFlowerRecommendations() });
}));

// # ค้นหารายละเอียดต้นไม้ด้วย slug ใน URL
router.get("/:slug", asyncRoute(async (req, res) => {
    const slug = req.params.slug.trim();
    if (!slug) {
        const error = new Error("Please provide a valid plant slug");
        error.statusCode = 400;
        throw error;
    }

    res.json(await getPlantDetail(req.params.slug));
}));

module.exports = router;
