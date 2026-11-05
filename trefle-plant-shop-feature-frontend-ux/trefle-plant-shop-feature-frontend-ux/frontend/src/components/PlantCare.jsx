import { getCareIcon, getCareStatus, getPlantCareSections } from "../utils/plantCare";

// # แสดงค่าการดูแลแบบคะแนนพร้อมสถานะ ไอคอนระดับ และคำแนะนำ
function CareMetric({ metric }) {
    if (metric.score !== null && metric.score !== undefined) {
        const score = Math.min(10, Math.max(0, Number(metric.score)));
        const details = getCareStatus(metric.label, score);
        const icon = getCareIcon(metric.label);

        return (
            <div className="care-metric">
                <div className="metric-header">
                    <span className="care-label">{metric.label}</span>
                    <span className="score-text"><strong>{score}</strong> / 10</span>
                </div>
                <p className="status-text">{details.text}</p>
                <div
                    className="care-icon-scale"
                    role="img"
                    aria-label={`${metric.label} ${score} จาก 10`}
                >
                    <span className="care-scale-endpoint">น้อย</span>
                    <span className="care-icon-list" aria-hidden="true">
                        {Array.from({ length: 10 }, (_, index) => (
                            <span
                                key={index}
                                className={`care-scale-icon${index >= Math.round(score) ? " is-muted" : ""}`}
                            >
                                {icon}
                            </span>
                        ))}
                    </span>
                    <span className="care-scale-endpoint">มาก</span>
                </div>
                <div className="care-tip-box">
                    <span className="tip-icon">ⓘ</span>
                    <p>{details.tip}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="care-metric">
            <span className="care-label">{metric.label}</span>
            <p className="care-value">{String(metric.value)}</p>
        </div>
    );
}

// # แสดงค่าการดูแลแบบข้อความ เช่น ช่วงอุณหภูมิหรือเดือนที่เหมาะสม
// # เลือกสีและไอคอนของหมวดตามชื่อหัวข้อ
function CareSection({ section }) {
    let themeClass = "";
    let icon = "🌿";
    if (section.title.includes("แสง")) {
        themeClass = "theme-yellow";
        icon = "☀️";
    } else if (section.title.includes("น้ำ")) {
        themeClass = "theme-blue";
        icon = "💧";
    } else if (section.title.includes("ดิน")) {
        themeClass = "theme-green";
        icon = "🌱";
    } else if (section.title.includes("เวลา") || section.title.includes("อุณหภูมิ")) {
        themeClass = "theme-purple";
        icon = "📅";
    }

    return (
        <section className={`care-section ${themeClass}`}>
            <h4 aria-label={section.title}>
                <span className="care-icon-box">{icon}</span>
                {section.title}
            </h4>
            {section.metrics.map(metric => (
                <CareMetric key={metric.label} metric={metric} />
            ))}
        </section>
    );
}

// # สร้างส่วนข้อมูลการดูแลทั้งหมดจากข้อมูลต้นไม้
export default function PlantCare({ plant }) {
    const sections = getPlantCareSections(plant);

    if (sections.length === 0) return null;

    return (
        <section className="plant-care">
            <h3>ข้อมูลการดูแล</h3>
            <div className="care-grid">
                {sections.map(section => (
                    <CareSection key={section.title} section={section} />
                ))}
            </div>
        </section>
    );
}
