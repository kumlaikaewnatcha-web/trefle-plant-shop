import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DetailPanel from "../components/DetailPanel";
import PlantDetail from "../components/PlantDetail";
import { ErrorState, LoadingState } from "../components/Feedback";
import PageContainer from "../components/PageContainer";
import { getPlant } from "../services/plantApi";
import { recordPlantView } from "../utils/plantUtils";

// # อ่าน slug จาก URL โหลดรายละเอียดต้นไม้ และแสดงหน้ารายละเอียด
export default function PlantDetailPage() {
    const location = useLocation();
    const [plant, setPlant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const recordedSlug = useRef(null);
    // # รองรับพารามิเตอร์ id แบบเดิมและ slug ที่ใช้ในลิงก์ปัจจุบัน
    const slug = new URLSearchParams(location.search).get("id") ||
        new URLSearchParams(location.search).get("slug");

    // # โหลดข้อมูลเมื่อ slug เปลี่ยน ตรวจสอบข้อมูล และบันทึกประวัติการดู
    useEffect(() => {
        document.title = "Plant Detail | Trefle Plant Shop";
        let active = true;
        setPlant(null);
        setLoading(true);
        setError(false);

        if (!slug) {
            setError(true);
            setLoading(false);
            return () => { active = false; };
        }

        getPlant(slug)
            .then(result => {
                const loadedPlant = result.data;
                if (!loadedPlant || (!loadedPlant.common_name && !loadedPlant.scientific_name)) {
                    throw new Error("Plant name unavailable.");
                }
                if (active) {
                    setPlant(loadedPlant);
                    if (recordedSlug.current !== slug) {
                        recordPlantView(loadedPlant);
                        recordedSlug.current = slug;
                    }
                }
            })
            .catch(requestError => {
                console.error("Plant Detail Error:", requestError);
                if (active) setError(true);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [slug]);

    return (
        <PageContainer>
            <DetailPanel>
                {loading
                    ? <LoadingState />
                    : error
                        ? <ErrorState title="Unable to load plant information" />
                        : <PlantDetail plant={plant} />}
            </DetailPanel>
        </PageContainer>
    );
}
