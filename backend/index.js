// # จุดเริ่มต้นของแอป Express และการเชื่อมต่อเส้นทาง API
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const plantRoutes = require("./routes/plantRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

// # สร้างแอป แปลงข้อมูล JSON และให้บริการไฟล์หน้าเว็บ
const app = express();

app.use(express.json());

app.use("/api/plants", plantRoutes);

app.use("/api/favorites", favoriteRoutes);

// # Endpoint สำหรับตรวจสอบว่าเซิร์ฟเวอร์พร้อมทำงานหรือไม่
app.get("/api/test", (req, res) => {
    res.json({ message: "Trefle Plant Shop API is working!" });
});

app.use("/api", (req, res) => {
    res.status(404).json({ error: "API route not found" });
});

const frontendDirectory = path.join(__dirname, "../dist");
if (fs.existsSync(frontendDirectory)) {
    app.use(express.static(frontendDirectory));
    app.get("*splat", (req, res, next) => {
        res.sendFile(path.join(frontendDirectory, "index.html"), error => {
            if (error) {
                next(error);
            }
        });
    });
}

// # ส่งข้อผิดพลาดของ API กลับในรูปแบบ JSON ที่สอดคล้องกัน
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
            ? "An error occurred while processing the request"
            : error.message
    });
});

// # เปิดพอร์ตสำหรับใช้งานในเครื่อง ส่วน Vercel จะจัดการแอปที่ส่งออกให้เอง
const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;