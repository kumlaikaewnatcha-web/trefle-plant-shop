export const pageGraph = {
    home: ["history", "favorites", "detail"],
    favorites: ["home", "history", "detail"],
    history: ["home", "favorites", "detail"],
    detail: ["home", "history", "favorites"],
};

export const pagePaths = {
    home: "/",
    favorites: "/favorites.html",
    history: "/history.html",
    detail: "/plantDetail.html",
};

export const pageLabels = {
    home: { title: "Home" },
    favorites: { title: "Favorites", menuLabel: "❤️ Favorites" },
    history: { title: "History", menuLabel: "🕘 Viewing history" },
    detail: { title: "Plant Detail" },
};

export function canReach(start, end, graph = pageGraph) {
    const queue = [start];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === end) return true;

        for (const neighbor of graph[current] ?? []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return false;
}

export function checkGraph() {
    const pages = Object.keys(pageGraph);
    return {
        orphans: pages.filter(page => !canReach("home", page)),
        deadEnds: pages.filter(page => !canReach(page, "home")),
    };
}
