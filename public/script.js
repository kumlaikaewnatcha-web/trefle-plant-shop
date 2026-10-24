// # ควบคุมการค้นหา คำแนะนำ รายการต้นไม้ และปุ่ม Favorite ในหน้าแรก
const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const clearSearchButton =
    document.getElementById("clearSearchButton");

const plantList =
    document.getElementById("plantList");

const recommendationList =
    document.getElementById("recommendationList");

const recommendationSection =
    recommendationList.closest(".result-section");

const SEARCH_STATE_KEY = "treflePlantSearchState";
// # ใช้ป้องกันผลค้นหาเก่าทับผลใหม่ เมื่อผู้ใช้ค้นหาหลายครั้งติดกัน
let activeSearchId = 0;

restoreSearchState();
loadFlowerRecommendations();

searchButton.addEventListener(
    "click",
    searchPlants
);

clearSearchButton.addEventListener(
    "click",
    clearSearch
);

searchInput.addEventListener(
    "input",
    updateClearSearchButton
);


searchInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            searchPlants();
        }

    }
);


// # ค้นหาต้นไม้จาก API กรองผล เรียงชื่อ และแสดงรายการ
async function searchPlants() {

    const searchId = ++activeSearchId;
    const query =
        searchInput.value.trim();

    recommendationSection.hidden = Boolean(query);
    updateClearSearchButton();

    if (!query) {

        plantList.innerHTML = `
            <div class="message-box">

                <div class="message-icon">
                    🌱
                </div>

                <h3>
                    Search for a plant
                </h3>

                <p>
                    Enter a plant name to start exploring.
                </p>

            </div>
        `;

        return;
    }


    try {

        plantList.innerHTML = `
            <div class="loading-state">

                <div class="loading-icon">
                    🌿
                </div>

                <h3>
                    Searching...
                </h3>

                <p>
                    Loading plant and care information
                </p>

            </div>
        `;


        const response =
            await fetch(
                `/api/plants/search?q=${encodeURIComponent(query)}`
            );


        if (!response.ok) {

            throw new Error(
                `API Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Trefle Search:",
            data
        );


        if (!Array.isArray(data.data)) {

            throw new Error(
                "No data from API"
            );

        }


        // เอาเฉพาะต้นไม้ที่มี common_name
        const plantsWithNames =
            data.data.filter(
                plant =>
                    plant.common_name &&
                    plant.common_name.trim() !== ""
            );


        if (searchId !== activeSearchId) {
            return;
        }

        // เรียงชื่อ A-Z ด้วย Insertion Sort หลังโหลดข้อมูลดูแล
        const sortedPlants =
            insertionSort(
                plantsWithNames
            );

        saveSearchState({
            query,
            plants: sortedPlants,
            selectedSlug: null
        });

        displayPlants(
            sortedPlants
        );


    } catch (error) {

        console.error(error);

        if (searchId !== activeSearchId) {
            return;
        }


        plantList.innerHTML = `
            <div class="error-state">

                <div class="error-icon">
                    🌱
                </div>

                <h3>
                    Something went wrong
                </h3>

                <p>
                    Please try searching again.
                </p>

            </div>
        `;

    }

}

// # ล้างคำค้นหาและผลลัพธ์ กลับไปแสดงดอกไม้แนะนำ
function clearSearch() {
    activeSearchId++;
    searchInput.value = "";
    recommendationSection.hidden = false;
    plantList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🌱</div>
            <h3>Start exploring</h3>
            <p>Search for a plant name to see the results.</p>
        </div>
    `;
    updateClearSearchButton();

    try {
        sessionStorage.removeItem(SEARCH_STATE_KEY);
    } catch (error) {
        console.error("Unable to clear search state:", error);
    }
}

// # แสดงปุ่มล้างเมื่อจำเป็นต้องกลับจากผลค้นหาไปหน้าแนะนำ
function updateClearSearchButton() {
    clearSearchButton.hidden =
        !searchInput.value.trim() && !recommendationSection.hidden;
}

// # โหลดและแสดงรายการดอกไม้แนะนำจาก API
async function loadFlowerRecommendations() {
    try {
        const response = await fetch("/api/plants/recommendations");

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        displayPlants(result.data || [], null, recommendationList);
    } catch (error) {
        console.error("Flower Recommendations Error:", error);
        recommendationList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">🌸</div>
                <h3>โหลดดอกไม้แนะนำไม่สำเร็จ</h3>
                <p>กรุณาลองใหม่อีกครั้ง</p>
            </div>
        `;
    }
}

// # เรียงต้นไม้ตามชื่อสามัญจาก A ถึง Z ด้วย Insertion Sort
function insertionSort(plants) {

    for (
        let i = 1;
        i < plants.length;
        i++
    ) {

        const current =
            plants[i];


        let j =
            i - 1;


        while (
            j >= 0 &&
            plants[j].common_name
                .localeCompare(
                    current.common_name
                ) > 0
        ) {

            plants[j + 1] =
                plants[j];


            j--;

        }


        plants[j + 1] =
            current;

    }


    return plants;
}


// # สร้างการ์ดต้นไม้ในพื้นที่ที่กำหนด รวมปุ่มรายละเอียดและ Favorite
function displayPlants(plants, selectedSlug = null, target = plantList) {

    target.innerHTML = "";


    if (
        !plants ||
        plants.length === 0
    ) {

        target.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🍃
                </div>

                <h3>
                    No plants found
                </h3>

                <p>
                    Try another plant name.
                </p>

            </div>
        `;

        return;
    }


    plants.forEach(
        plant => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "plant-card";
            card.dataset.plantSlug = plant.slug || "";


            // รูป
            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "plant-image";


            image.src =
                plant.image_url || "";


            image.alt =
                plant.common_name;


            image.onerror =
                function () {

                    image.style.display =
                        "none";

                };


            // ชื่อ
            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                plant.common_name;


            // ชื่อวิทยาศาสตร์
            const scientific =
                document.createElement(
                    "p"
                );


            scientific.className =
                "scientific-name";


            scientific.textContent =
                plant.scientific_name ||
                "Scientific name unavailable";

            // ปุ่ม View Details
            const detailButton =
                document.createElement(
                    "button"
                );


            detailButton.className =
                "secondary-button";


            detailButton.textContent =
                "View details";


            detailButton.addEventListener(
                "click",
                function () {

                    viewDetail(
                        plant.slug
                    );

                }
            );


            // ปุ่ม Favorite
            const favoriteButton =
                document.createElement(
                    "button"
                );


            favoriteButton.className =
                "favorite-button";


            updateFavoriteButton(
                plant.slug,
                favoriteButton
            );


            favoriteButton.addEventListener(
                "click",
                async function () {

                    await toggleFavorite(
                        plant,
                        favoriteButton
                    );

                }
            );


            // กลุ่มปุ่ม
            const buttons =
                document.createElement(
                    "div"
                );


            buttons.className =
                "card-buttons";


            buttons.appendChild(
                detailButton
            );


            buttons.appendChild(
                favoriteButton
            );


            // ใส่ข้อมูลลง Card
            card.appendChild(
                image
            );


            card.appendChild(
                title
            );


            card.appendChild(
                scientific
            );

            card.appendChild(
                buttons
            );


            target.appendChild(
                card
            );

        }
    );

    highlightSelectedPlant(selectedSlug, target);
}

// # กู้คำค้นหาและผลลัพธ์ที่บันทึกไว้เมื่อกลับมาหน้าแรก
function restoreSearchState() {
    try {
        const savedState = JSON.parse(
            sessionStorage.getItem(SEARCH_STATE_KEY) || "null"
        );

        if (!savedState || typeof savedState.query !== "string") {
            return;
        }

        searchInput.value = savedState.query;
        recommendationSection.hidden = Boolean(savedState.query.trim());
        updateClearSearchButton();

        if (Array.isArray(savedState.plants)) {
            displayPlants(savedState.plants, savedState.selectedSlug);
        }
    } catch (error) {
        console.error("Unable to restore search state:", error);
    }
}

// # บันทึกสถานะค้นหาไว้ใน sessionStorage
function saveSearchState(state) {
    try {
        sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Unable to save search state:", error);
    }
}

// # ทำเครื่องหมายการ์ดต้นไม้ที่กำลังเปิดดูรายละเอียด
function highlightSelectedPlant(slug) {
    plantList.querySelectorAll(".plant-card[data-plant-slug]").forEach(card => {
        const isSelected = Boolean(slug) && card.dataset.plantSlug === slug;
        card.classList.toggle("is-selected", isSelected);

        let marker = card.querySelector(".selected-plant-marker");

        if (isSelected && !marker) {
            marker = document.createElement("span");
            marker.className = "selected-plant-marker";
            marker.textContent = "กำลังดูรายละเอียด";
            card.insertBefore(marker, card.querySelector(".scientific-name"));
        } else if (!isSelected && marker) {
            marker.remove();
        }
    });
}

// # ตรวจสอบสถานะ Favorite ผ่าน API
async function checkFavorite(slug) {

    try {

        const response =
            await fetch(
                `/api/favorites/${encodeURIComponent(slug)}`
            );


        if (!response.ok) {
            return false;
        }


        const data =
            await response.json();


        return data.favorite === true;


    } catch (error) {

        console.error(
            "Check Favorite Error:",
            error
        );


        return false;

    }

}


// # ตั้งข้อความและรูปแบบปุ่มตามสถานะ Favorite
async function updateFavoriteButton(
    slug,
    button
) {

    const favorite =
        await checkFavorite(
            slug
        );


    if (favorite) {

        button.textContent =
            "❤️ Saved";


        button.classList.add(
            "is-favorite"
        );


    } else {

        button.textContent =
            "♡ Save";


        button.classList.remove(
            "is-favorite"
        );

    }

}


// # สลับสถานะ Favorite โดยส่งคำขอเพิ่มหรือลบไปยัง API
async function toggleFavorite(
    plant,
    button
) {

    const currentlyFavorite =
        await checkFavorite(
            plant.slug
        );


    try {

        button.disabled =
            true;


        // ถ้าเป็น Favorite อยู่แล้ว → ลบ
        if (currentlyFavorite) {

            const response =
                await fetch(
                    `/api/favorites/${encodeURIComponent(plant.slug)}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Remove favorite failed"
                );

            }


            button.textContent =
                "♡ Save";


            button.classList.remove(
                "is-favorite"
            );


            return;

        }


        // ถ้ายังไม่เป็น Favorite → เพิ่ม
        button.textContent =
            "Saving...";


        const response =
            await fetch(
                "/api/favorites",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            plant
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Add favorite failed"
            );

        }


        button.textContent =
            "❤️ Saved";


        button.classList.add(
            "is-favorite"
        );


    } catch (error) {

        console.error(
            "Favorite Error:",
            error
        );


        alert(
            "Unable to update favorites."
        );


        await updateFavoriteButton(
            plant.slug,
            button
        );


    } finally {

        button.disabled =
            false;

    }

}


// # บันทึกต้นไม้ที่เลือกและนำทางไปหน้ารายละเอียด
function viewDetail(slug) {
    try {
        const savedState = JSON.parse(
            sessionStorage.getItem(SEARCH_STATE_KEY) || "null"
        );

        if (savedState) {
            savedState.selectedSlug = slug;
            saveSearchState(savedState);
        }
    } catch (error) {
        console.error("Unable to save selected plant:", error);
    }

    highlightSelectedPlant(slug);

    window.location.href =
        `plantDetail.html?slug=${encodeURIComponent(slug)}`;

}