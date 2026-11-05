import { useEffect, useRef, useState } from "react";
import HomeHero from "../components/HomeHero";
import PageContainer from "../components/PageContainer";
import PlantSearchSection from "../components/PlantSearchSection";
import RecommendationsSection from "../components/RecommendationsSection";
import { getRecommendations, searchPlants } from "../services/plantApi";
import {
    clearSearchState,
    insertionSort,
    readSearchState,
    saveSearchState
} from "../utils/plantUtils";

// # จัดการหน้าแรก การค้นหา คำแนะนำ และสถานะการเลือกต้นไม้
export default function HomePage() {
    // # คืนค่าสถานะค้นหาจาก sessionStorage เพื่อรักษาผลลัพธ์เมื่อเปลี่ยนหน้า
    const savedState = readSearchState();
    const [query, setQuery] = useState(
        typeof savedState?.query === "string" ? savedState.query : ""
    );
    const [searchViewActive, setSearchViewActive] = useState(
        typeof savedState?.query === "string" && Boolean(savedState.query.trim())
    );
    const [plants, setPlants] = useState(
        Array.isArray(savedState?.plants) ? savedState.plants : null
    );
    const [selectedSlug, setSelectedSlug] = useState(savedState?.selectedSlug || null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState(false);
    const activeSearchId = useRef(0);

    // # โหลดรายการแนะนำเมื่อเปิดหน้าแรก
    useEffect(() => {
        document.title = "Trefle Plant Shop";
        let active = true;

        getRecommendations()
            .then(result => {
                if (!Array.isArray(result.data)) {
                    throw new Error("Recommendations returned invalid data.");
                }
                if (active) setRecommendations(result.data);
            })
            .catch(error => {
                console.error("Flower Recommendations Error:", error);
                if (active) setRecommendationsError(true);
            })
            .finally(() => {
                if (active) setRecommendationsLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    // # ค้นหาต้นไม้ ตรวจสอบผลลัพธ์ เรียงชื่อ และบันทึกสถานะการค้นหา
    async function runSearch(event) {
        event.preventDefault();
        const searchId = ++activeSearchId.current;
        const searchQuery = query.trim();
        setSelectedSlug(null);
        setSearchError(false);
        setSearchViewActive(Boolean(searchQuery));

        if (!searchQuery) {
            setPlants(null);
            setSearchLoading(false);
            clearSearchState();
            return;
        }

        setSearchLoading(true);
        try {
            const result = await searchPlants(searchQuery);
            if (!Array.isArray(result.data)) {
                throw new Error("Plant search returned invalid data.");
            }
            const sortedPlants = result.data.filter(
                plant => plant.common_name && plant.common_name.trim() !== ""
            );
            const insertionSortedPlants = insertionSort(sortedPlants);

            if (searchId !== activeSearchId.current) return;
            setPlants(insertionSortedPlants);
            saveSearchState({
                query: searchQuery,
                plants: insertionSortedPlants,
                selectedSlug: null
            });
        } catch (error) {
            console.error("Plant Search Error:", error);
            if (searchId === activeSearchId.current) {
                setSearchError(true);
                setPlants(null);
            }
        } finally {
            if (searchId === activeSearchId.current) {
                setSearchLoading(false);
            }
        }
    }

    // # ยกเลิกการค้นหาปัจจุบันและล้างคำค้น ผลลัพธ์ และข้อมูลที่บันทึกไว้
    function clearSearch() {
        activeSearchId.current += 1;
        setQuery("");
        setSearchViewActive(false);
        setPlants(null);
        setSearchError(false);
        setSearchLoading(false);
        setSelectedSlug(null);
        clearSearchState();
    }

    // # จดจำต้นไม้ที่เลือกเพื่อแสดงสถานะและคงข้อมูลค้นหาไว้
    function openDetails(plantSlug) {
        setSelectedSlug(plantSlug);
        const currentState = readSearchState();
        if (currentState) {
            saveSearchState({ ...currentState, selectedSlug: plantSlug });
        }
    }

    return (
        <PageContainer>
            <HomeHero
                query={query}
                searchViewActive={searchViewActive}
                onQueryChange={setQuery}
                onSearch={runSearch}
                onClearSearch={clearSearch}
            />
            {!searchViewActive && (
                <RecommendationsSection
                    plants={recommendations}
                    loading={recommendationsLoading}
                    error={recommendationsError}
                />
            )}
            <PlantSearchSection
                plants={plants}
                loading={searchLoading}
                error={searchError}
                selectedSlug={selectedSlug}
                query={query}
                onOpenDetails={openDetails}
            />
        </PageContainer>
    );
}
