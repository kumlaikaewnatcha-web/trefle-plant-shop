const favorites = new Map();

function addFavorite(plant) {
    favorites.set(plant.slug, plant);
}

function removeFavorite(slug) {
    favorites.delete(slug);
}

function getFavorites() {
    return Array.from(favorites.values());
}

function isFavorite(slug) {
    return favorites.has(slug);
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite
};