// # แสดงสถานะระหว่างรอข้อมูล พร้อมหัวข้อและข้อความเสริมที่เลือกได้
export function LoadingState({ title = "Loading...", message }) {
    return (
        <div className="loading-state">
            <div className="loading-icon">🌿</div>
            <h3>{title}</h3>
            {message && <p>{message}</p>}
        </div>
    );
}

// # แสดงข้อความแจ้งข้อผิดพลาดให้ผู้ใช้รับรู้
export function ErrorState({ title = "Something went wrong", message = "Please try again." }) {
    return (
        <div className="error-state" role="alert">
            <div className="error-icon">🌱</div>
            <h3>{title}</h3>
            <p>{message}</p>
        </div>
    );
}

// # แสดงข้อความเมื่อยังไม่มีข้อมูล พร้อมพื้นที่ใส่ปุ่มหรือลิงก์เพิ่มเติม
export function EmptyState({ title, message, children }) {
    return (
        <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>{title}</h3>
            {message && <p>{message}</p>}
            {children}
        </div>
    );
}
