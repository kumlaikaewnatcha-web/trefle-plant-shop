import { useEffect, useState } from "react";
import {
    addFavoritePlant,
    isFavoritePlant,
    removeFavoritePlant
} from "../utils/plantUtils";
import PlantCare from "./PlantCare";

// # แสดงข้อมูลต้นไม้ รายการโปรด และรายละเอียดวิธีดูแล
export default function PlantDetail({ plant }) {
    // # สถานะรายการโปรดของต้นไม้ รวมถึงสถานะกำลังบันทึกและข้อผิดพลาด
    const [favorite, setFavorite] = useState(null);
    const [saving, setSaving] = useState(false);
    const [favoriteError, setFavoriteError] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [plant.slug]);

    // # ตรวจสอบสถานะรายการโปรดเมื่อเปลี่ยนต้นไม้ที่กำลังแสดง
    useEffect(() => {
        let active = true;
        setFavorite(null);
        setFavoriteError(false);
        try {
            if (active) setFavorite(isFavoritePlant(plant.slug));
        } catch (error) {
            console.error("Check Favorite Error:", error);
            if (active) setFavoriteError(true);
        }

        return () => {
            active = false;
        };
    }, [plant.slug]);

    // # สลับสถานะรายการโปรดและจัดการผลลัพธ์จาก API
    async function toggleFavorite() {
        setSaving(true);
        try {
            if (favorite) {
                removeFavoritePlant(plant.slug);
                setFavorite(false);
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

    return (
        <>
            {/* # ภาพ ชื่อสามัญ ชื่อวิทยาศาสตร์ และปุ่มรายการโปรด */}
            {plant.image_url && !imageFailed && (
                <img
                    className="detail-image"
                    src={plant.image_url}
                    alt={plant.common_name || plant.scientific_name}
                    onError={() => setImageFailed(true)}
                />
            )}
            <span className="small-title">PLANT INFORMATION</span>
            <h2>{plant.common_name || plant.scientific_name}</h2>
            <p className="scientific-name">{plant.scientific_name || "Scientific name unavailable"}</p>
            <button
                className={`favorite-button${favorite ? " is-favorite" : ""}`}
                type="button"
                disabled={favorite === null || saving}
                onClick={toggleFavorite}
            >
                {saving
                    ? (favorite ? "Removing..." : "Saving...")
                    : favoriteError ? "Favorite status unavailable."
                        : favorite === null ? "Checking..."
                            : favorite ? "❤️ Saved" : "♡ Save"}
            </button>
            {favoriteError && (
                    <p className="care-note" role="status">
                        Unable to check favorite status. Please refresh and try again.
                    </p>
            )}
            {/* # แสดงข้อมูลการดูแลที่แปลงจากข้อมูลรายละเอียดของต้นไม้ */}
            <PlantCare plant={plant} />
        </>
    );
}
