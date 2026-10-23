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
            createScaleMetric("ความต้องการแสง", growth.light)
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

    const care = document.createElement("section");
    care.className = "plant-care";

    const heading = document.createElement("h3");
    heading.textContent = "ข้อมูลการดูแล";
    care.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "care-grid";
    grid.append(...sections);
    care.appendChild(grid);
    detail.appendChild(care);
}


// ฟังก์ชันช่วยแปลผลค่าตัวเลขเป็นข้อความและคำแนะนำ
function getStatusDetails(label, value) {
    const score = Number(value);
    if (label.includes("แสง")) {
        if (score >= 8) return { text: "แสงแดดปานกลาง-จัด", tip: "ต้องการแสงแดดโดยตรงในช่วงเช้า 4-6 ชั่วโมง เหมาะกับริมระเบียง" };
        if (score >= 5) return { text: "แสงรำไร", tip: "ชอบแสงแดดอ่อนๆ วางใกล้หน้าต่างที่แสงส่องถึง" };
        return { text: "แสงน้อย", tip: "อยู่รอดได้ในที่แสงน้อย ระวังอย่าให้โดนแดดจัดโดยตรง" };
    }
    if (label.includes("น้ำ") || label.includes("ความชื้น")) {
        if (score >= 8) return { text: "ต้องการน้ำมาก", tip: "รดน้ำทุกวัน หรือเมื่อผิวดินเริ่มแห้ง ชอบความชื้นสูง" };
        if (score >= 4) return { text: "ต้องการน้ำปานกลาง", tip: "รดน้ำสัปดาห์ละ 1-2 ครั้ง รอให้ผิวดินแห้งลึกลงไป 1-2 นิ้วค่อยรดซ้ำ" };
        return { text: "ต้องการน้ำน้อย", tip: "ทนแล้งได้ดี รดน้ำเมื่อดินแห้งสนิทเท่านั้น ระวังรากเน่า" };
    }
    if (label.includes("สารอาหาร") || label.includes("ดิน")) {
        if (score >= 7) return { text: "ต้องการสารอาหารสูง", tip: "ใช้ดินร่วนซุยที่อุดมสมบูรณ์ แนะนำให้ใส่ปุ๋ยทุกๆ 1-2 เดือน" };
        if (score >= 4) return { text: "สารอาหารปานกลาง", tip: "ใช้ดินร่วนโปร่ง (pH 7-7.5) ระบายน้ำดี แนะนำให้เติมปุ๋ยละลายช้าทุกๆ 3 เดือน" };
        return { text: "สารอาหารน้อย", tip: "ปลูกได้ในดินทั่วไป ไม่ต้องการปุ๋ยมาก" };
    }
    return { text: "ปานกลาง", tip: "ดูแลตามสภาพอากาศทั่วไป" };
}

function createCareSection(title, metrics) {
    const availableMetrics = metrics.filter(Boolean);
    if (availableMetrics.length === 0) return null;

    const section = document.createElement("section");

    // กำหนด Theme สีและไอคอนตามหัวข้อ
    let themeClass = "";
    let iconChar = "🌿";
    if (title.includes("แสง")) { themeClass = "theme-yellow"; iconChar = "☀️"; }
    else if (title.includes("น้ำ")) { themeClass = "theme-blue"; iconChar = "💧"; }
    else if (title.includes("ดิน")) { themeClass = "theme-green"; iconChar = "🌱"; }
    else if (title.includes("เวลา") || title.includes("อุณหภูมิ")) { themeClass = "theme-purple"; iconChar = "📅"; }

    section.className = `care-section ${themeClass}`;

    const heading = document.createElement("h4");

    const iconBox = document.createElement("span");
    iconBox.className = "care-icon-box";
    iconBox.textContent = iconChar;

    heading.appendChild(iconBox);
    heading.appendChild(document.createTextNode(` ${title}`));
    section.appendChild(heading);

    availableMetrics.forEach(metric => section.appendChild(metric));

    return section;
}

function createScaleMetric(label, value, note) {
    if (!hasValue(value) || !Number.isFinite(Number(value))) return null;

    const metric = document.createElement("div");
    metric.className = "care-metric";

    const score = Math.min(10, Math.max(0, Number(value)));
    const details = getStatusDetails(label, score);

    // ส่วนหัว (Label + Score)
    const headerDiv = document.createElement("div");
    headerDiv.className = "metric-header";

    const labelSpan = document.createElement("span");
    labelSpan.className = "care-label";
    labelSpan.textContent = label;

    const scoreSpan = document.createElement("span");
    scoreSpan.className = "score-text";
    scoreSpan.innerHTML = `<strong>${score}</strong> / 10`;

    headerDiv.append(labelSpan, scoreSpan);

    // ข้อความสถานะ (เช่น "แสงแดดปานกลาง-จัด")
    const statusText = document.createElement("p");
    statusText.className = "status-text";
    statusText.textContent = details.text;

    const icon = getCareIcon(label);
    const activeIcons = Math.round(score);
    const iconScale = document.createElement("div");
    iconScale.className = "care-icon-scale";
    iconScale.setAttribute("role", "img");
    iconScale.setAttribute("aria-label", `${label} ${score} จาก 10`);

    for (let index = 0; index < 10; index += 1) {
        const iconElement = document.createElement("span");
        iconElement.className = "care-scale-icon";
        if (index >= activeIcons) {
            iconElement.classList.add("is-muted");
        }
        iconElement.textContent = icon;
        iconScale.appendChild(iconElement);
    }

    // กล่องคำแนะนำ (Care Tip Box)
    const tipBox = document.createElement("div");
    tipBox.className = "care-tip-box";
    const tipIcon = document.createElement("span");
    tipIcon.className = "tip-icon";
    tipIcon.textContent = "ⓘ";
    const tipText = document.createElement("p");
    tipText.textContent = details.tip;
    tipBox.append(tipIcon, tipText);

    metric.append(headerDiv, statusText, iconScale, tipBox);
    return metric;
}

function getCareIcon(label) {
    if (label.includes("แสง")) return "☀️";
    if (label.includes("น้ำ") || label.includes("ความชื้น")) return "💧";
    if (label.includes("ดิน") || label.includes("สารอาหาร")) return "🌱";
    return "🌿";
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