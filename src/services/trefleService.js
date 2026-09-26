const TREFLE_BASE_URL = "https://trefle.io/api/v1";

async function searchPlants(query) {
    const url =
        `${TREFLE_BASE_URL}/plants/search` +
        `?token=${process.env.TREFLE_TOKEN}` +
        `&q=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Trefle API error: ${response.status}`);
    }

    const data = await response.json();

    return data;
}

async function getPlantDetail(slug) {
    const url =
        `${TREFLE_BASE_URL}/plants/${encodeURIComponent(slug)}` +
        `?token=${process.env.TREFLE_TOKEN}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Trefle API error: ${response.status}`);
    }

    const data = await response.json();

    return data;
}

module.exports = {
    searchPlants,
    getPlantDetail
};