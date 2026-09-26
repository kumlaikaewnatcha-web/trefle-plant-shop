async function loadFavorites() {
    const response = await fetch("/api/favorites");

    const result = await response.json();

    console.log(result);

    displayFavorites(result.data);
}

function displayFavorites(plants) {
    const favoriteList =
        document.getElementById("favoriteList");

    favoriteList.innerHTML = "";

    plants.forEach(plant => {
        const card = document.createElement("div");

        card.className = "plant-card";

        card.innerHTML = `
            <h2>${plant.common_name || "ไม่พบชื่อทั่วไป"}</h2>

            <p>
                ชื่อวิทยาศาสตร์:
                ${plant.scientific_name || "ไม่พบข้อมูล"}
            </p>

            <button onclick="removeFavorite('${plant.slug}')">
                🗑️ ลบ Favorite
            </button>
        `;

        favoriteList.appendChild(card);
    });
}

loadFavorites();