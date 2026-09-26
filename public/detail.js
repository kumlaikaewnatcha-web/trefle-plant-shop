const params =
    new URLSearchParams(
        window.location.search
    );


const slug =
    params.get("slug");


const detail =
    document.getElementById(
        "plantDetail"
    );


async function loadPlantDetail() {

    if (!slug) {

        showError(
            "Plant not found"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/api/plants/${encodeURIComponent(slug)}`
            );


        if (!response.ok) {

            throw new Error(
                `API Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        const plant =
            data.data;


        if (
            !plant ||
            !plant.common_name
        ) {

            throw new Error(
                "Plant name unavailable"
            );

        }


        displayPlantDetail(
            plant
        );


    } catch (error) {

        console.error(error);


        showError(
            "Unable to load plant information"
        );

    }

}


function displayPlantDetail(
    plant
) {

    detail.innerHTML = "";


    // รูป
    const image =
        document.createElement(
            "img"
        );


    image.className =
        "detail-image";


    image.src =
        plant.image_url || "";


    image.alt =
        plant.common_name;


    image.onerror =
        function () {

            image.style.display =
                "none";

        };


    // Label
    const label =
        document.createElement(
            "span"
        );


    label.className =
        "small-title";


    label.textContent =
        "PLANT INFORMATION";


    // ชื่อ
    const title =
        document.createElement(
            "h2"
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


    // Favorite
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


    detail.appendChild(
        image
    );


    detail.appendChild(
        label
    );


    detail.appendChild(
        title
    );


    detail.appendChild(
        scientific
    );


    detail.appendChild(
        favoriteButton
    );

}


/*
    ตรวจสอบ Favorite
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

        console.error(error);

        return false;

    }

}


/*
    อัปเดตปุ่ม Favorite
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


        if (currentlyFavorite) {

            const response =
                await fetch(
                    `/api/favorites/${encodeURIComponent(plant.slug)}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Remove failed"
                );

            }


            button.textContent =
                "♡ Save";


            button.classList.remove(
                "is-favorite"
            );


        } else {

            button.textContent =
                "Saving...";


            const response =
                await fetch(
                    "/api/favorites",
                    {
                        method:
                            "POST",

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
                    "Add failed"
                );

            }


            button.textContent =
                "❤️ Saved";


            button.classList.add(
                "is-favorite"
            );

        }


    } catch (error) {

        console.error(error);


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
    แสดง Error
*/

function showError(
    message
) {

    detail.innerHTML = `

        <div class="error-state">

            <div class="error-icon">
                🌱
            </div>

            <h3>
                ${message}
            </h3>

            <p>
                Please try again.
            </p>

        </div>

    `;

}


loadPlantDetail();