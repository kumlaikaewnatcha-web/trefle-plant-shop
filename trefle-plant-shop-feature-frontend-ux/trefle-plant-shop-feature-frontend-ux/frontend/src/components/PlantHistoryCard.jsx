import { Link } from "react-router-dom";

// # การ์ดประวัติต้นไม้ที่เคยเปิด พร้อมเวลาที่ดูและลิงก์ไปหน้ารายละเอียด
export default function PlantHistoryCard({ plant }) {
    // # แปลงเวลาเป็นข้อความ หรือใช้ข้อความสำรองเมื่อเวลาไม่ถูกต้อง
    const viewedAt = new Date(plant.viewedAt);
    const viewedLabel = Number.isNaN(viewedAt.getTime())
        ? "Viewed most recently"
        : `Viewed on ${viewedAt.toLocaleString("en-US")}`;

    return (
        <article className="plant-card">
            {plant.image_url && (
                <img
                    className="plant-image"
                    src={plant.image_url}
                    alt={plant.common_name || "Plant"}
                />
            )}
            <h3>{plant.common_name || "Unknown plant"}</h3>
            <p className="scientific-name">
                {plant.scientific_name || "Scientific name unavailable"}
            </p>
            <p className="history-viewed-at">{viewedLabel}</p>
            <div className="card-buttons">
                {/* # จุดเชื่อมจากหน้าประวัติไปยังหน้ารายละเอียดต้นไม้ */}
                <Link
                    className="secondary-button"
                    to={`/plantDetail.html?slug=${encodeURIComponent(plant.slug)}`}
                >
                    View details
                </Link>
            </div>
        </article>
    );
}
