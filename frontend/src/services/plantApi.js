// # ส่งคำขอไปยัง backend และแปลงผลตอบกลับ JSON พร้อมแจ้งข้อผิดพลาด HTTP
async function requestJson(url, options) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (cause) {
        throw new Error("Unable to connect to the Express API", { cause });
    }

    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const body = await response.clone().json();
            if (typeof body.error === "string") message = body.error;
        } catch {
            // Keep the HTTP status message when the backend does not return JSON.
        }
        throw new Error(message);
    }

    if (response.status === 204) return null;

    try {
        return await response.json();
    } catch (cause) {
        throw new Error("The Express API returned invalid JSON", { cause });
    }
}

const FAVORITES_STORAGE_KEY = "trefle-favorite-plants";
const REMOVED_FAVORITES_STORAGE_KEY = "trefle-removed-favorite-slugs";

function readStoredFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
        return Array.isArray(favorites) ? favorites.filter(plant => plant && typeof plant.slug === "string") : [];
    } catch {
        return [];
    }
}

function saveStoredFavorites(favorites) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function readRemovedFavoriteSlugs() {
    try {
        const slugs = JSON.parse(localStorage.getItem(REMOVED_FAVORITES_STORAGE_KEY) || "[]");
        return new Set(Array.isArray(slugs) ? slugs.filter(slug => typeof slug === "string") : []);
    } catch {
        return new Set();
    }
}

function saveRemovedFavoriteSlugs(slugs) {
    localStorage.setItem(REMOVED_FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(slugs)));
}

// # ค้นหาต้นไม้ด้วยคำค้น
export function searchPlants(query) {
    return requestJson(`/api/plants/search?q=${encodeURIComponent(query)}`);
}

// # ขอรายการดอกไม้แนะนำ
export function getRecommendations() {
    return requestJson("/api/plants/recommendations");
}

// # ขอรายละเอียดต้นไม้ตาม slug
export function getPlant(slug) {
    return requestJson(`/api/plants/${encodeURIComponent(slug)}`);
}

// # ขอรายการโปรดทั้งหมด
export function getFavorites() {
    const storedFavorites = readStoredFavorites();
    const removedSlugs = readRemovedFavoriteSlugs();

    return requestJson("/api/favorites")
        .then(result => {
            const serverFavorites = Array.isArray(result.data) ? result.data : [];
            const favoritesBySlug = new Map(
                [
                    ...storedFavorites.filter(plant => !removedSlugs.has(plant.slug)),
                    ...serverFavorites.filter(plant => !removedSlugs.has(plant.slug))
                ].map(plant => [plant.slug, plant])
            );
            const favorites = Array.from(favoritesBySlug.values());
            saveStoredFavorites(favorites);
            return { data: favorites };
        })
        .catch(() => ({ data: storedFavorites }));
}

// # ตรวจสอบว่าต้นไม้ตาม slug เป็นรายการโปรดหรือไม่
export function checkFavorite(slug) {
    return requestJson(`/api/favorites/${encodeURIComponent(slug)}`)
        .then(result => ({
            favorite: result.favorite === true ||
                readStoredFavorites().some(plant => plant.slug === slug)
        }))
        .catch(() => ({
            favorite: readStoredFavorites().some(plant => plant.slug === slug)
        }));
}

// # เพิ่มต้นไม้ลงในรายการโปรด
export function addFavorite(plant) {
    const favorites = readStoredFavorites();
    if (!favorites.some(savedPlant => savedPlant.slug === plant.slug)) {
        saveStoredFavorites([...favorites, plant]);
    }
    const removedSlugs = readRemovedFavoriteSlugs();
    removedSlugs.delete(plant.slug);
    saveRemovedFavoriteSlugs(removedSlugs);

    return requestJson("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plant)
    }).catch(() => null);
}

// # ลบต้นไม้ออกจากรายการโปรด
export function removeFavorite(slug) {
    saveStoredFavorites(readStoredFavorites().filter(plant => plant.slug !== slug));
    const removedSlugs = readRemovedFavoriteSlugs();
    removedSlugs.add(slug);
    saveRemovedFavoriteSlugs(removedSlugs);

    return requestJson(`/api/favorites/${encodeURIComponent(slug)}`, {
        method: "DELETE"
    }).catch(() => null);
}
