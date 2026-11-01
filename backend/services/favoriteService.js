const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDirectory = path.join(__dirname, "../data");
const favoritesFile = path.join(dataDirectory, "favorites.json");
const SESSION_COOKIE = "trefle_favorites_session";

function isRedisConfigured() {
    return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function readLocalStore() {
    if (!fs.existsSync(favoritesFile)) return {};

    const stored = JSON.parse(fs.readFileSync(favoritesFile, "utf8"));
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
}

function writeLocalStore(store) {
    fs.mkdirSync(dataDirectory, { recursive: true });
    const temporaryFile = `${favoritesFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(store, null, 2), "utf8");
    fs.renameSync(temporaryFile, favoritesFile);
}

async function redisCommand(...args) {
    if (!isRedisConfigured()) {
        throw new Error("Persistent favorites storage is not configured");
    }

    const response = await fetch(`${process.env.KV_REST_API_URL}/${args.map(encodeURIComponent).join("/")}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });

    if (!response.ok) {
        throw new Error(`Persistent favorites storage request failed (${response.status})`);
    }

    const result = await response.json();
    return result.result;
}

function storageKey(ownerId) {
    return `trefle:favorites:${ownerId}`;
}

async function readFavorites(ownerId) {
    if (isRedisConfigured()) {
        const stored = await redisCommand("GET", storageKey(ownerId));
        const plants = typeof stored === "string" ? JSON.parse(stored) : [];
        return Array.isArray(plants) ? plants : [];
    }

    if (process.env.VERCEL === "1") {
        throw new Error("Persistent favorites storage is not configured");
    }

    return Array.isArray(readLocalStore()[ownerId]) ? readLocalStore()[ownerId] : [];
}

async function writeFavorites(ownerId, plants) {
    if (isRedisConfigured()) {
        await redisCommand("SET", storageKey(ownerId), JSON.stringify(plants));
        return;
    }

    if (process.env.VERCEL === "1") {
        throw new Error("Persistent favorites storage is not configured");
    }

    const store = readLocalStore();
    store[ownerId] = plants;
    writeLocalStore(store);
}

function getOwnerId(req, res) {
    const cookies = Object.fromEntries(
        String(req.headers.cookie || "")
            .split(";")
            .map(cookie => cookie.trim().split("="))
            .filter(parts => parts.length === 2)
            .map(([key, value]) => [key.trim(), decodeURIComponent(value)])
    );

    let ownerId = cookies[SESSION_COOKIE];
    if (!/^[a-f0-9]{64}$/i.test(ownerId || "")) {
        ownerId = crypto.randomBytes(32).toString("hex");
        res.cookie(SESSION_COOKIE, ownerId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 365 * 24 * 60 * 60 * 1000
        });
    }

    return ownerId;
}

async function addFavorite(ownerId, plant) {
    const plants = await readFavorites(ownerId);
    const nextPlants = plants.some(savedPlant => savedPlant.slug === plant.slug)
        ? plants.map(savedPlant => savedPlant.slug === plant.slug ? plant : savedPlant)
        : [...plants, plant];

    await writeFavorites(ownerId, nextPlants);
    return plant;
}

async function removeFavorite(ownerId, slug) {
    const plants = await readFavorites(ownerId);
    await writeFavorites(ownerId, plants.filter(plant => plant.slug !== slug));
}

async function getFavorites(ownerId) {
    return readFavorites(ownerId);
}

async function isFavorite(ownerId, slug) {
    const plants = await readFavorites(ownerId);
    return plants.some(plant => plant.slug === slug);
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite,
    getOwnerId
};