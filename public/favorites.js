const favoriteList =
    document.getElementById(
        "favoriteList"
    );


/*
    โหลดรายการ Favorite
*/

async function loadFavorites() {

    try {

        favoriteList.innerHTML = `
            <div class="loading-state">

                <div class="loading-icon">
                    🌿
                </div>

                <h3>
                    Loading favorites...
                </h3>

                <p>
                    Please wait a moment.
                </p>

            </div>
        `;


        const response =
            await fetch(
                "/api/favorites"
            );


        if (!response.ok) {

            throw new Error(
                `API Error: ${response.status}`
            );

        }


        const result =
            await response.json();


        const favorites =
            result.data || [];


        displayFavorites(
            favorites
        );


    } catch (error) {

        console.error(
            "Load Favorites Error:",
            error
        );


        favoriteList.innerHTML = `

            <div class="error-state">

                <div class="error-icon">
                    🌱
                </div>

                <h3>
                    Something went wrong
                </h3>

                <p>
                    Unable to load your favorite plants.
                </p>

            </div>

        `;

    }

}


/*
    แสดงรายการ Favorite
*/

function displayFavorites(
    favorites
) {

    favoriteList.innerHTML = "";


    // ถ้ายังไม่มี Favorite
    if (
        !favorites ||
        favorites.length === 0
    ) {

        favoriteList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🌱
                </div>

                <h3>
                    No favorite plants yet
                </h3>

                <p>
                    Search for plants and save
                    the ones you like.
                </p>

                <br>

                <a
                    href="index.html"
                    class="favorites-link"
                >
                    🌿 Explore Plants
                </a>

            </div>

        `;

        return;
    }


    // แสดงแต่ละ Favorite
    favorites.forEach(
        plant => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "plant-card";


            /*
                รูปต้นไม้
            */

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "plant-image";


            image.src =
                plant.image_url || "";


            image.alt =
                plant.common_name ||
                "Plant";


            image.onerror =
                function () {

                    image.style.display =
                        "none";

                };


            /*
                ชื่อต้นไม้
            */

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                plant.common_name ||
                "Unknown plant";


            /*
                ชื่อวิทยาศาสตร์
            */

            const scientific =
                document.createElement(
                    "p"
                );


            scientific.className =
                "scientific-name";


            scientific.textContent =
                plant.scientific_name ||
                "Scientific name unavailable";


            /*
                กลุ่มปุ่ม
            */

            const buttons =
                document.createElement(
                    "div"
                );


            buttons.className =
                "card-buttons";


            /*
                ปุ่ม View details
            */

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


            /*
                ปุ่ม Remove
            */

            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.className =
                "favorite-button is-favorite";


            removeButton.textContent =
                "❤️ Remove";


            removeButton.addEventListener(
                "click",
                async function () {

                    await removeFavorite(
                        plant.slug,
                        card
                    );

                }
            );


            /*
                ใส่ปุ่มลงในกลุ่ม
            */

            buttons.appendChild(
                detailButton
            );


            buttons.appendChild(
                removeButton
            );


            /*
                ใส่ข้อมูลลง Card
            */

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


            favoriteList.appendChild(
                card
            );

        }
    );

}


/*
    ลบ Favorite
*/

async function removeFavorite(
    slug,
    card
) {

    try {

        const removeButton =
            card.querySelector(
                ".favorite-button"
            );


        removeButton.disabled =
            true;


        removeButton.textContent =
            "Removing...";


        const response =
            await fetch(
                `/api/favorites/${encodeURIComponent(slug)}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Remove Error: ${response.status}`
            );

        }


        /*
            ลบ Card ออกจากหน้า
        */

        card.remove();


        /*
            ตรวจสอบว่ามี Card เหลือหรือไม่
        */

        if (
            favoriteList.children.length === 0
        ) {

            favoriteList.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        🌱
                    </div>

                    <h3>
                        No favorite plants yet
                    </h3>

                    <p>
                        Search for plants and save
                        the ones you like.
                    </p>

                    <br>

                    <a
                        href="index.html"
                        class="favorites-link"
                    >
                        🌿 Explore Plants
                    </a>

                </div>

            `;

        }


    } catch (error) {

        console.error(
            "Remove Favorite Error:",
            error
        );


        alert(
            "Unable to remove this favorite."
        );


        const removeButton =
            card.querySelector(
                ".favorite-button"
            );


        removeButton.disabled =
            false;


        removeButton.textContent =
            "❤️ Remove";

    }

}


/*
    ไปหน้ารายละเอียด
*/

function viewDetail(
    slug
) {

    window.location.href =
        `plantDetail.html?slug=${encodeURIComponent(slug)}`;

}


/*
    เริ่มโหลดข้อมูล
*/

loadFavorites();