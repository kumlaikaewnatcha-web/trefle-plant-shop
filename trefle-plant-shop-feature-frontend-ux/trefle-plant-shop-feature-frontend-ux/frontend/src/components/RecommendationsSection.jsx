import PlantCard from "./PlantCard";
import { EmptyState, ErrorState, LoadingState } from "./Feedback";
import ResultSection from "./ResultSection";

// # แสดงต้นไม้แนะนำ พร้อมรองรับสถานะโหลด ข้อผิดพลาด และไม่มีผลลัพธ์
export default function RecommendationsSection({
    plants,
    loading,
    error
}) {
    return (
        <ResultSection eyebrow="FLOWER PICKS" title="Recommended Flowers">
            {loading
                ? <LoadingState title="Loading recommended flowers..." />
                : error
                    ? <ErrorState title="Unable to load recommended flowers" />
                    : plants.length === 0
                        ? <EmptyState title="No recommended flowers available" />
                        : plants.map(plant => (
                            <PlantCard
                                key={plant.slug}
                                plant={plant}
                            />
                        ))}
        </ResultSection>
    );
}
