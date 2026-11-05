// # ตารางจัดวางการ์ดหรือข้อความผลลัพธ์ โดยส่งต่อคุณสมบัติให้ element หลัก
export default function PlantGrid({ children, ...props }) {
    return (
        <div className="plant-grid" {...props}>
            {children}
        </div>
    );
}
