import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    addFavoritePlant,
    isFavoritePlant,
    removeFavoritePlant
} from "../utils/plantUtils";

// # การ์ดแสดงข้อมูลต้นไม้ พร้อมลิงก์รายละเอียดและปุ่มจัดการรายการโปรด
export default function PlantCard({ plant, selected = false, onRemove, onOpenDetails }) {
    // # เก็บสถานะรายการโปรด การบันทึก รูปภาพ และข้อผิดพลาดของแต่ละการ์ด
    const [favorite, setFavorite] = useState(onRemove ? true : null);
    const [saving, setSaving] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [favoriteError, setFavoriteError] = useState("");

    // # โหลดสถานะรายการโปรดเมื่อการ์ดแสดงผล ยกเว้นกรณีอยู่ในหน้ารายการโปรด
    useEffect(() => {
        setImageFailed(false);
        setFavoriteError("");

        if (onRemove) {
            setFavorite(true);
            return undefined;
        }

        setFavorite(null);
        let active = true;

        try {
            if (active) setFavorite(isFavoritePlant(plant.slug));
        } catch (error) {
            console.error("Check Favorite Error:", error);
            if (active) setFavoriteError("Favorite status unavailable.");
        }

        return () => {
            active = false;
        };
    }, [plant.slug, Boolean(onRemove)]);

    // # เพิ่มหรือเอาต้นไม้ออกจากรายการโปรด แล้วอัปเดตสถานะบนการ์ด
    async function toggleFavorite() {
        if ((!onRemove && favorite === null) || favoriteError) return;

        setSaving(true);
        try {
            if (favorite || onRemove) {
                removeFavoritePlant(plant.slug);
                setFavorite(false);
                if (onRemove) onRemove(plant.slug);
            } else {
                addFavoritePlant(plant);
                setFavorite(true);
            }
        } catch (error) {
            console.error("Favorite Error:", error);
            window.alert("Unable to update favorites.");
        } finally {
            setSaving(false);
        }
    }

    // # เนื้อหาการ์ดประกอบด้วยรูป ชื่อ ปุ่มเปิดรายละเอียด และปุ่มรายการโปรด
    return (
        <article className={`plant-card${selected ? " is-selected" : ""}`} data-plant-slug={plant.slug || ""}>
            {selected && <span className="selected-plant-marker">Currently viewing</span>}
            {plant.image_url && !imageFailed && (
                <img
                    className="plant-image"
                    src={plant.image_url}
                    alt={plant.common_name || "Plant"}
                    onError={() => setImageFailed(true)}
                />
            )}
            <h3>{plant.common_name || "Unknown plant"}</h3>
            <p className="scientific-name">{plant.scientific_name || "Scientific name unavailable"}</p>
            <div className="card-buttons">
                {/* # จุดเชื่อมจากหน้าแรกหรือรายการโปรดไปยังหน้ารายละเอียดต้นไม้ */}
                <Link
                    className="secondary-button"
                    to={`/plantDetail.html?slug=${encodeURIComponent(plant.slug)}`}
                    onClick={() => onOpenDetails?.(plant.slug)}
                >
                    View details
                </Link>
                {onRemove ? (
                    <button
                        className="favorite-button is-favorite"
                        type="button"
                        disabled={saving}
                        onClick={toggleFavorite}
                    >
                        {saving ? "Removing..." : "❤️ Remove"}
                    </button>
                ) : (
                    <button
                        className={`favorite-button${favorite ? " is-favorite" : ""}`}
                        type="button"
                        disabled={favorite === null || saving || Boolean(favoriteError)}
                        title={favoriteError || undefined}
                        onClick={toggleFavorite}
                    >
                        {favoriteError
                            ? "Status unavailable"
                            : saving
                                ? (favorite ? "Removing..." : "Saving...")
                                : favorite
                                    ? "❤️ Saved"
                                    : favorite === null ? "Checking..." : "♡ Save"}
                    </button>
                )}
            </div>
            {favoriteError && <p className="care-note" role="status">{favoriteError}</p>}
        </article>
    );
}
