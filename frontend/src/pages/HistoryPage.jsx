import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/Feedback";
import PageContainer from "../components/PageContainer";
import PlantHistoryCard from "../components/PlantHistoryCard";
import ResultSection from "../components/ResultSection";
import { clearViewHistory, readViewHistory } from "../utils/plantUtils";

// # แสดงประวัติต้นไม้ที่เปิดล่าสุด และให้ผู้ใช้ล้างประวัติได้
export default function HistoryPage() {
    const [plants, setPlants] = useState(() => readViewHistory().reverse());

    // # กำหนดชื่อแท็บและนำประวัติที่บันทึกไว้มาจัดลำดับล่าสุดก่อน
    useEffect(() => {
        document.title = "Viewing History | Trefle Plant Shop";
    }, []);

    // # ล้างประวัติใน sessionStorage และอัปเดตหน้าจอ
    function clearHistory() {
        clearViewHistory();
        setPlants([]);
    }

    return (
        <PageContainer>
            <ResultSection
                eyebrow="RECENTLY VIEWED"
                title="Viewing History"
                headingAction={
                    <button
                        className="primary-button"
                        type="button"
                        disabled={plants.length === 0}
                        onClick={clearHistory}
                    >
                        Clear History
                    </button>
                }
            >
                {plants.length === 0 ? (
                    <EmptyState
                        title="No view history"
                        message="Select a plant and click “View details” to save it to your history."
                    >
                        <Link to="/" className="favorites-link">🌿 Explore Plants</Link>
                    </EmptyState>
                ) : plants.map(plant => (
                    <PlantHistoryCard
                        key={`${plant.slug}-${plant.viewedAt}`}
                        plant={plant}
                    />
                ))}
            </ResultSection>
        </PageContainer>
    );
}
