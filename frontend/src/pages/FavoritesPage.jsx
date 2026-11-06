import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlantCard from "../components/PlantCard";
import { EmptyState } from "../components/Feedback";
import PageContainer from "../components/PageContainer";
import ResultSection from "../components/ResultSection";
import { readFavorites, removeFavoritePlant } from "../utils/plantUtils";

// # โหลดและแสดงรายการโปรดที่เก็บไว้ใน localStorage
export default function FavoritesPage() {
    const [plants, setPlants] = useState(() => readFavorites());

    // # กำหนดชื่อหน้าสำหรับรายการโปรด
    useEffect(() => {
        document.title = "Favorites | Trefle Plant Shop";
    }, []);

    // # เอาต้นไม้ที่ลบแล้วออกจากรายการที่แสดงทันที
    function removePlant(slug) {
        removeFavoritePlant(slug);
        setPlants(current => current.filter(plant => plant.slug !== slug));
    }

    return (
        <PageContainer>
            <ResultSection eyebrow="SAVED PLANTS" title="❤️ My Favorites">
                {plants.length === 0
                    ? (
                                <EmptyState
                                    title="No favorite plants yet"
                                    message="Search for plants and save the ones you like."
                                >
                                    <Link to="/" className="favorites-link">🌿 Explore Plants</Link>
                                </EmptyState>
                            )
                    : plants.map(plant => (
                                <PlantCard
                                    key={plant.slug}
                                    plant={plant}
                                    onRemove={removePlant}
                                />
                            ))}
            </ResultSection>
        </PageContainer>
    );
}
