import PlantCard from "./PlantCard";
import { EmptyState, ErrorState, LoadingState } from "./Feedback";
import ResultSection from "./ResultSection";

// # เลือกเนื้อหาที่จะแสดงตามสถานะค้นหา: กำลังโหลด ผิดพลาด ว่าง หรือพบผลลัพธ์
function SearchResults({
    plants,
    loading,
    error,
    selectedSlug,
    query,
    onOpenDetails
}) {
    if (loading) {
        return <LoadingState title="Searching..." message="Loading plant and care information" />;
    }
    if (error) {
        return <ErrorState message="Please try searching again." />;
    }
    if (plants === null) {
        return (
            <EmptyState
                title="Start exploring"
                message="Search for a plant name to see the results."
            />
        );
    }
    if (plants.length === 0) {
        return <EmptyState title="No plants found" message="Try another plant name." />;
    }

    return plants.map(plant => (
        <PlantCard
            key={plant.slug}
            plant={plant}
            selected={selectedSlug === plant.slug && Boolean(query)}
            onOpenDetails={onOpenDetails}
        />
    ));
}

// # จัดวางหัวข้อผลค้นหาและรายการต้นไม้ที่ SearchResults เลือกมา
export default function PlantSearchSection({
    plants,
    loading,
    error,
    selectedSlug,
    query,
    onOpenDetails
}) {
    return (
        <ResultSection
            eyebrow="SEARCH RESULT"
            title="Explore plants"
            headingAction={<span className="sort-label">A–Z</span>}
        >
            <SearchResults
                plants={plants}
                loading={loading}
                error={error}
                selectedSlug={selectedSlug}
                query={query}
                onOpenDetails={onOpenDetails}
            />
        </ResultSection>
    );
}
