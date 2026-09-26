async function loadFavorites() {
    try {
        const response = await fetch("/api/favorites");

        const result = await response.json();

        console.log(result);

        displayFavorites(result.data);
    } catch (error) {
        console.error("โหลด Favorite ไม่สำเร็จ:", error);
    }
}


function displayFavorites(plants) {
    const favoriteList =
        document.getElementById("favoriteList");

    favoriteList.innerHTML = "";

  
    if (!plants || plants.length === 0) {
        favoriteList.innerHTML =
            "<p>ยังไม่มีต้นไม้ในรายการโปรด</p>";

        return;
    }

  
    plants.forEach(plant => {
        const card = document.createElement("div");

        card.className = "plant-card";

        card.innerHTML = `
            <h2>
                ${plant.common_name || "ไม่พบชื่อทั่วไป"}
            </h2>

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


async function removeFavorite(slug) {
    try {
        const response = await fetch(
            `/api/favorites/${encodeURIComponent(slug)}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        console.log(result);

     
        loadFavorites();

    } catch (error) {
        console.error("ลบ Favorite ไม่สำเร็จ:", error);
    }
}



loadFavorites();