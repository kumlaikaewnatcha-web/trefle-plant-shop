import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlantCard from "../components/PlantCard";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import PageContainer from "../components/PageContainer";
import ResultSection from "../components/ResultSection";
import { getFavorites } from "../services/plantApi";

// # โหลดและแสดงรายการโปรด พร้อมสถานะโหลด ข้อผิดพลาด และรายการว่าง
export default function FavoritesPage() {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // # ดึงรายการโปรดเมื่อเปิดหน้า และป้องกันอัปเดต state หลังออกจากหน้า
    useEffect(() => {
        document.title = "Favorites | Trefle Plant Shop";
        let active = true;

        getFavorites()
            .then(result => {
                if (!Array.isArray(result.data)) {
                    throw new Error("Favorites returned invalid data.");
                }
                if (active) setPlants(result.data);
            })
            .catch(requestError => {
                console.error("Load Favorites Error:", requestError);
                if (active) setError(true);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    // # เอาต้นไม้ที่ลบแล้วออกจากรายการที่แสดงทันที
    function removePlant(slug) {
        setPlants(current => current.filter(plant => plant.slug !== slug));
    }

    return (
        <PageContainer>
            <ResultSection eyebrow="SAVED PLANTS" title="❤️ My Favorites">
                {loading
                    ? <LoadingState title="Loading favorites..." message="Please wait a moment." />
                    : error
                        ? <ErrorState message="Unable to load your favorite plants." />
                        : plants.length === 0
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
