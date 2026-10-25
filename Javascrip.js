const TREFLE_BASE_URL = "https://trefle.io/api/v1";
const RECOMMENDED_FLOWER_SEARCHES = ["rose", "tulip", "orchid", "daisy", "sunflower"];
const RECOMMENDATION_CACHE_TTL = 30 * 60 * 1000;
let recommendationCache = {
    expiresAt: 0,
    plants: null
};

async function searchPlants(query) {
    const url =
        `${TREFLE_BASE_URL}/plants/search?token=${process.env.TREFLE_TOKEN}&q=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Trefle API error: ${response.status}`);
    }

    const data = await response.json();

    return data;
}

async function getPlantDetail(slug) {
    const url =
        `${TREFLE_BASE_URL}/plants/${encodeURIComponent(slug)}?token=${process.env.TREFLE_TOKEN}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Trefle API error: ${response.status}`);
    }

    const data = await response.json();

    return data;
}

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