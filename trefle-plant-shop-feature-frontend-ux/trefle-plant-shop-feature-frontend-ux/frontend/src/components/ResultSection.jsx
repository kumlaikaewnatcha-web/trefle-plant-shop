import PlantGrid from "./PlantGrid";
import SectionHeading from "./SectionHeading";

// # โครงสร้างส่วนผลลัพธ์ ประกอบด้วยหัวข้อ การกระทำเสริม และตารางรายการ
export default function ResultSection({ eyebrow, title, headingAction, children }) {
    return (
        <section className="result-section">
            <SectionHeading
                eyebrow={eyebrow}
                title={title}
                action={headingAction}
            />
            <PlantGrid aria-live="polite">
                {children}
            </PlantGrid>
        </section>
    );
}
