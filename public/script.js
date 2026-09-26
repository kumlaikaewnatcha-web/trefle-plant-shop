const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const plantList =
    document.getElementById("plantList");


searchButton.addEventListener(
    "click",
    searchPlants
);


searchInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            searchPlants();
        }

    }
);


async function searchPlants() {

    const query =
        searchInput.value.trim();


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
                    Finding plants for you
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


        if (!data.data) {

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


        // เรียงชื่อ A-Z ด้วย Insertion Sort
        const sortedPlants =
            insertionSort(
                plantsWithNames
            );


        displayPlants(
            sortedPlants
        );


    } catch (error) {

        console.error(error);


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


/*
    Insertion Sort

    เรียงชื่อ common_name
    จาก A → Z
*/

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


/*
    แสดง Plant Card
*/

function displayPlants(plants) {

    plantList.innerHTML = "";


    if (
        !plants ||
        plants.length === 0
    ) {

        plantList.innerHTML = `
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


            plantList.appendChild(
                card
            );

        }
    );
}


/*
    ตรวจสอบว่าเป็น Favorite หรือไม่
*/

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


/*
    เปลี่ยนข้อความปุ่ม Favorite
*/

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


/*
    เพิ่ม / ลบ Favorite
*/

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


/*
    ไปหน้ารายละเอียด
*/

function viewDetail(slug) {

    window.location.href =
        `plantDetail.html?slug=${encodeURIComponent(slug)}`;

}