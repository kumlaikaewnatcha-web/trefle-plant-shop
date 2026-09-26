const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const plantList = document.getElementById("plantList");

searchButton.addEventListener("click", searchPlants);

async function searchPlants() {
    const query = searchInput.value.trim();

    if (!query) {
        alert("กรุณากรอกชื่อต้นไม้");
        return;
    }

    const response = await fetch(
        `/api/plants/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    displayPlants(data.data);
}

function displayPlants(plants) {
    plantList.innerHTML = "";

    plants.forEach(plant => {
        const card = document.createElement("div");

        card.className = "plant-card";

        card.innerHTML = `
            <h2>${plant.common_name || "ไม่พบชื่อทั่วไป"}</h2>
            <p>${plant.scientific_name || "ไม่พบชื่อวิทยาศาสตร์"}</p>
            <button onclick="viewDetail('${plant.slug}')">
                ดูรายละเอียด
            </button>
        `;

        plantList.appendChild(card);
    });
}

function viewDetail(slug) {
    console.log("เลือกต้นไม้:", slug);
}