// # ติดต่อ Trefle API เพื่อค้นหา ดึงรายละเอียด และจัดดอกไม้แนะนำ
const TREFLE_BASE_URL = "https://trefle.io/api/v1";
// # รายชื่อคำค้นที่ใช้รวบรวมดอกไม้หลากหลายชนิดสำหรับคำแนะนำ
const RECOMMENDED_FLOWER_SEARCHES = ["rose", "tulip", "orchid", "daisy", "sunflower"];
// # เก็บผลแนะนำไว้ 30 นาทีเพื่อลดการเรียก API ซ้ำ
const RECOMMENDATION_CACHE_TTL = 30 * 60 * 1000;
let recommendationCache = {
    expiresAt: 0,
    plants: null
};

// # รวมการสร้าง URL การตรวจสถานะ และจัดการข้อผิดพลาดของ Trefle ไว้จุดเดียว
async function requestTrefle(path, params = {}) {
    const token = process.env.TREFLE_TOKEN;

    if (!token) {
        const error = new Error("TREFLE_TOKEN is not configured");
        error.statusCode = 503;
        throw error;
    }

    const url = new URL(`${TREFLE_BASE_URL}${path}`);
    url.searchParams.set("token", token);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    let response;
    try {
        response = await fetch(url);
    } catch (cause) {
        const error = new Error("Unable to reach Trefle API", { cause });
        error.statusCode = 502;
        throw error;
    }

    if (!response.ok) {
        const error = new Error(`Trefle API returned ${response.status}`);
        error.statusCode = response.status === 404 ? 404 : 502;
        throw error;
    }

    try {
        return await response.json();
    } catch (cause) {
        const error = new Error("Trefle API returned invalid JSON", { cause });
        error.statusCode = 502;
        throw error;
    }
}

// # ค้นหาต้นไม้ตามคำค้น และส่งต่อข้อผิดพลาดเมื่อ Trefle ตอบไม่สำเร็จ
async function searchPlants(query) {
    return requestTrefle("/plants/search", { q: query });
}

// # ขอรายละเอียดต้นไม้รายต้นด้วย slug
async function getPlantDetail(slug) {
    return requestTrefle(`/plants/${encodeURIComponent(slug)}`);
}

// # รวบรวมดอกไม้จากหลายคำค้น เติมรายละเอียด เรียงตามข้อมูลดูแล และแคชผล
async function getFlowerRecommendations() {
    if (recommendationCache.plants && recommendationCache.expiresAt > Date.now()) {
        return recommendationCache.plants;
    }

    const searchResults = await Promise.allSettled(
        RECOMMENDED_FLOWER_SEARCHES.map(searchPlants)
    );
    const successfulSearches = searchResults.filter(result => result.status === "fulfilled");

    if (successfulSearches.length === 0) {
        throw searchResults[0].reason || new Error("Trefle flower searches failed");
    }

    const candidates = [];
    const seenSlugs = new Set();

    successfulSearches.forEach(result => {
        if (!Array.isArray(result.value.data)) {
            return;
        }

        result.value.data.slice(0, 4).forEach(plant => {
            if (plant.slug && !seenSlugs.has(plant.slug)) {
                seenSlugs.add(plant.slug);
                candidates.push(plant);
            }
        });
    });

    const plants = [];

    for (let index = 0; index < candidates.length; index += 4) {
        const batch = candidates.slice(index, index + 4);
        const details = await Promise.allSettled(
            batch.map(plant => getPlantDetail(plant.slug))
        );

        details.forEach(result => {
            if (result.status === "fulfilled" && result.value.data?.common_name) {
                plants.push(result.value.data);
            }
        });
    }

    plants.sort((first, second) => {
        const completenessDifference = getCareCompleteness(second) - getCareCompleteness(first);
        return completenessDifference || first.common_name.localeCompare(second.common_name);
    });

    recommendationCache = {
        expiresAt: Date.now() + RECOMMENDATION_CACHE_TTL,
        plants: plants.slice(0, 12)
    };

    return recommendationCache.plants;
}

// # ให้คะแนนความครบถ้วนของข้อมูลดูแลเพื่อจัดอันดับคำแนะนำ
function getCareCompleteness(plant) {
    const growth = plant.main_species?.growth || plant.growth || {};
    const hasNumber = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
    const minimum = growth.minimum_temperature;
    const maximum = growth.maximum_temperature;
    const hasTemperatureRange =
        (hasNumber(minimum?.deg_c) && hasNumber(maximum?.deg_c)) ||
        (hasNumber(minimum?.deg_f) && hasNumber(maximum?.deg_f));
    const careFields = [
        hasNumber(growth.light),
        hasNumber(growth.atmospheric_humidity),
        hasNumber(growth.soil_humidity),
        hasTemperatureRange,
        hasNumber(growth.ph_minimum),
        hasNumber(growth.ph_maximum),
        hasNumber(growth.soil_nutriments),
        hasNumber(growth.soil_texture),
        Array.isArray(growth.growth_months) && growth.growth_months.length > 0,
        Array.isArray(growth.bloom_months) && growth.bloom_months.length > 0,
        hasContent(growth.sowing),
        hasContent(growth.description)
    ];

    return careFields.filter(Boolean).length;
}

// # ตรวจว่าค่าข้อมูลมีเนื้อหาจริง ไม่ใช่ค่าว่าง
function hasContent(value) {
    if (typeof value === "string") {
        return value.trim() !== "";
    }

    return value !== null && value !== undefined &&
        (Array.isArray(value) ? value.length > 0 : typeof value === "object" ? Object.keys(value).length > 0 : false);
}

module.exports = {
    searchPlants,
    getPlantDetail,
    getFlowerRecommendations
};