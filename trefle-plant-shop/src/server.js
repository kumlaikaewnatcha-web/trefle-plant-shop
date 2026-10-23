const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ให้ Express อ่าน JSON ได้
app.use(express.json());

// ให้เปิดไฟล์ในโฟลเดอร์ public ได้
app.use(express.static(path.join(__dirname, "../public")));

// หน้าแรก
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ทดสอบ Server
app.get("/api/test", (req, res) => {
  res.json({
    message: "Trefle Plant Shop API is working!"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});