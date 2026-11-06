// # ส่งคำขอไปยัง backend และแปลงผลตอบกลับ JSON พร้อมแจ้งข้อผิดพลาด HTTP
async function requestJson(url, options) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (cause) {
        throw new Error("Unable to connect to the Express API", { cause });
    }

    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const body = await response.clone().json();
            if (typeof body.error === "string") message = body.error;
        } catch {
            // Keep the HTTP status message when the backend does not return JSON.
        }
        throw new Error(message);
    }

    if (response.status === 204) return null;

    try {
        return await response.json();
    } catch (cause) {
        throw new Error("The Express API returned invalid JSON", { cause });
    }
}

// # ค้นหาต้นไม้ด้วยคำค้น
export function searchPlants(query) {
    return requestJson(`/api/plants/search?q=${encodeURIComponent(query)}`);
}

// # ขอรายการดอกไม้แนะนำ
export function getRecommendations() {
    return requestJson("/api/plants/recommendations");
}

// # ขอรายละเอียดต้นไม้ตาม slug
export function getPlant(slug) {
    return requestJson(`/api/plants/${encodeURIComponent(slug)}`);
}
