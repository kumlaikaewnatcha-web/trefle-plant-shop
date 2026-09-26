const params = new URLSearchParams(
    window.location.search
);

const slug = params.get("slug");

console.log("slug:", slug);


async function loadPlantDetail() {

    const plantDetail = document.getElementById("plantDetail");

    if (!slug) {
        plantDetail.innerHTML =
            "<p>ไม่พบข้อมูลต้นไม้</p>";

        return;
    }

    try {

        const response = await fetch(
            `/api/plants/${encodeURIComponent(slug)}`
        );

        if (!response.ok) {
            throw new Error("ไม่สามารถโหลดข้อมูลต้นไม้ได้");
        }

        const data = await response.json();

        console.log("Detail API:", data);

        const plant = data.data;

        plantDetail.innerHTML = `
            <h2>
                ${plant.common_name || "ไม่พบชื่อทั่วไป"}
            </h2>

            <p>
                <strong>ชื่อวิทยาศาสตร์:</strong>
                ${plant.scientific_name || "ไม่พบข้อมูล"}
            </p>
        `;

    } catch (error) {

        console.error(error);

        plantDetail.innerHTML = `
            <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        `;
    }
}


loadPlantDetail();
