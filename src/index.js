// # จุดเริ่มต้นของแอป Express และตัวเชื่อม route ของ API
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const plantRoutes = require("./routes/plantRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

// # สร้างแอป รับ JSON และเปิดให้บริการไฟล์หน้าบ้าน
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/plants", plantRoutes);

app.use("/api/favorites", favoriteRoutes);

// # ทำให้ข้อผิดพลาดจาก API ตอบกลับเป็น JSON รูปแบบเดียวกัน
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || error.status || 500;

    if (statusCode >= 500) {
        console.error(error);
    }

    res.status(statusCode).json({
        error: statusCode >= 500
            ? "เกิดข้อผิดพลาดในการให้บริการ"
            : error.message
    });
});

// # Endpoint สำหรับตรวจสอบว่าเซิร์ฟเวอร์พร้อมทำงาน
app.get("/api/test", (req, res) => {
    res.json({ message: "Trefle Plant Shop API is working!" });
});

// # เริ่มฟังพอร์ตในเครื่อง; บน Vercel ส่งออก app ให้แพลตฟอร์มจัดการ
const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;