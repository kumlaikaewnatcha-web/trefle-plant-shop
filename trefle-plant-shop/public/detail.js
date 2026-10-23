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

document
    .getElementById("backToSearch")
    .addEventListener("click", returnToPreviousPage);


function returnToPreviousPage() {
    const referrer = document.referrer;

    if (referrer) {
        try {
            if (new URL(referrer).origin === window.location.origin) {
                window.history.back();
                return;
            }
        } catch (error) {
            console.error("Unable to read previous page:", error);
        }
    }

    window.location.href = "index.html";
}


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


    displayPlantCare(
        plant
    );

}


function displayPlantCare(plant) {

    const growth =
        plant.main_species?.growth ||
        plant.growth ||
        {};

    const sections = [
        createCareSection("แสงแดด", [
            createScaleMetric(
                "ความต้องการแสง",
                growth.light,
                "10 = แดดจัด (ประมาณ 100,000 lux ขึ้นไป)"
            )
        ]),
        createCareSection("น้ำและความชื้น", [
            createScaleMetric("ความชื้นในอากาศ", growth.atmospheric_humidity),
            createScaleMetric("ความชื้นในดิน", growth.soil_humidity)
        ]),
        createCareSection("อุณหภูมิที่เหมาะสม", [
            createMetric(
                "ช่วงอุณหภูมิต่ำสุดถึงสูงสุด",
                formatTemperatureRange(
                    growth.minimum_temperature,
                    growth.maximum_temperature
                )
            )
        ]),
        createCareSection("ดินและค่า", [
            createMetric("ค่า pH", formatRange(growth.ph_minimum, growth.ph_maximum)),
            createScaleMetric("สารอาหารในดิน", growth.soil_nutriments),
            createScaleMetric("ความร่วนซุย / เนื้อดิน", growth.soil_texture)
        ]),
        createCareSection("ช่วงเวลา", [
            createMetric("เดือนที่เจริญเติบโตดี", formatMonths(growth.growth_months)),
            createMetric("เดือนที่ออกดอก", formatMonths(growth.bloom_months))
        ]),
        createCareSection("คำแนะนำการปลูก", [
            createMetric("การเพาะเมล็ด / ลงปลูก", growth.sowing),
            createMetric("คำอธิบาย", growth.description)
        ])
    ].filter(Boolean);

    if (sections.length === 0) {
        return;
    }

    const care =
        document.createElement("section");

    care.className = "plant-care";

    const heading =
        document.createElement("h3");

    heading.textContent = "ข้อมูลการดูแล";

    care.appendChild(heading);

    const grid =
        document.createElement("div");

    grid.className = "care-grid";
    grid.append(...sections);

    care.appendChild(grid);
    detail.appendChild(care);

}


function createCareSection(title, metrics) {

    const availableMetrics = metrics.filter(Boolean);

    if (availableMetrics.length === 0) {
        return null;
    }

    const section =
        document.createElement("section");

    section.className = "care-section";

    const heading =
        document.createElement("h4");

    heading.textContent = title;
    section.appendChild(heading);

    availableMetrics.forEach(metric => {
        section.appendChild(metric);
    });

    return section;

}


function createMetric(label, value) {

    if (!hasValue(value)) {
        return null;
    }

    const metric =
        document.createElement("div");

    metric.className = "care-metric";

    const name =
        document.createElement("span");

    name.className = "care-label";
    name.textContent = label;

    const result =
        document.createElement("p");

    result.className = "care-value";
    result.textContent = String(value);

    metric.append(name, result);
    return metric;

}


function createScaleMetric(label, value, note) {

    if (!hasValue(value) || !Number.isFinite(Number(value))) {
        return null;
    }

    const metric =
        document.createElement("div");

    metric.className = "care-metric";

    const name =
        document.createElement("span");

    name.className = "care-label";
    name.textContent = `${label} (0-10)`;

    metric.appendChild(name);

    const score = Math.min(10, Math.max(0, Number(value)));
    const scoreText = document.createElement("p");
    scoreText.className = "care-value";
    scoreText.textContent = `${value} / 10`;

    const meter = document.createElement("progress");
    meter.className = "care-meter";
    meter.max = 10;
    meter.value = score;
    meter.setAttribute("aria-label", `${label} ${value} จาก 10`);

    metric.append(scoreText, meter);

    if (note) {
        const hint = document.createElement("span");
        hint.className = "care-note";
        hint.textContent = note;
        metric.appendChild(hint);
    }

    return metric;

}


function hasValue(value) {
    return value !== null &&
        value !== undefined &&
        (typeof value !== "string" || value.trim() !== "");
}


function formatRange(minimum, maximum) {

    if (!hasValue(minimum) && !hasValue(maximum)) {
        return null;
    }

    if (hasValue(minimum) && hasValue(maximum)) {
        return `${minimum} - ${maximum}`;
    }

    return hasValue(minimum) ? `ตั้งแต่ ${minimum}` : `สูงสุด ${maximum}`;

}


function formatTemperatureRange(minimum, maximum) {

    const celsius = formatRange(minimum?.deg_c, maximum?.deg_c);
    const fahrenheit = formatRange(minimum?.deg_f, maximum?.deg_f);
    const values = [];

    if (celsius) values.push(`${celsius} °C`);
    if (fahrenheit) values.push(`${fahrenheit} °F`);

    return values.length ? values.join(" / ") : null;

}


function formatMonths(months) {

    if (!Array.isArray(months) || months.length === 0) {
        return null;
    }

    const monthNames = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
        "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
        "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const englishMonthNames = [
        ["jan", "january"], ["feb", "february"], ["mar", "march"],
        ["apr", "april"], ["may"], ["jun", "june"],
        ["jul", "july"], ["aug", "august"], ["sep", "september"],
        ["oct", "october"], ["nov", "november"], ["dec", "december"]
    ];

    return months
        .map(month => {
            const monthNumber = Number(month);
            if (Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
                return monthNames[monthNumber - 1];
            }

            const normalizedMonth = String(month).trim().toLowerCase();
            const englishMonthIndex = englishMonthNames.findIndex(aliases =>
                aliases.includes(normalizedMonth)
            );

            return englishMonthIndex >= 0
                ? monthNames[englishMonthIndex]
                : String(month);
        })
        .join(", ");

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