# Trefle Plant Shop

โปรเจกต์ร้านขายต้นไม้โดยใช้ Trefle API

## Features

- ค้นหาชื่อต้นไม้
- แสดงดอกไม้แนะนำและข้อมูลการดูแล
- ดูรายละเอียดต้นไม้
- เรียงชื่อต้นไม้ A-Z
- เพิ่มต้นไม้ในรายการโปรด
- ลบต้นไม้ออกจากรายการโปรด

## Plant API

- `GET /api/plants/search?q=rose` ค้นหาต้นไม้จาก Trefle
- `GET /api/plants/recommendations` แสดงดอกไม้แนะนำ เรียงตามความครบถ้วนของข้อมูลดูแล
- `GET /api/plants/:id` ดูรายละเอียดพืชด้วย ID หรือ slug
- `GET /api/favorites` ดูรายการโปรด
- `POST /api/favorites` เพิ่มรายการโปรด โดยส่งข้อมูลต้นไม้เป็น JSON
- `GET /api/favorites/:slug` ตรวจสอบว่าต้นไม้อยู่ในรายการโปรดหรือไม่
- `DELETE /api/favorites/:slug` ลบต้นไม้ออกจากรายการโปรด
- ผลดอกไม้แนะนำถูกเก็บชั่วคราว 30 นาที ส่วนรายการโปรดเก็บในหน่วยความจำและจะถูกล้างเมื่อเซิร์ฟเวอร์เริ่มใหม่

## การตั้งค่า API

- กำหนด `TREFLE_TOKEN` ในไฟล์ `.env` ก่อนเริ่มเซิร์ฟเวอร์ในเครื่อง
- เมื่อนำขึ้น Vercel ให้เพิ่ม `TREFLE_TOKEN` ใน Project Settings > Environment Variables แล้ว deploy ใหม่
- หาก API ค้นหาไม่ได้ หน้าเว็บจะแสดงข้อความจากเซิร์ฟเวอร์เพื่อช่วยตรวจสอบสาเหตุ

## DSA

- Insertion Sort
- Hash Table

## Technologies

- Node.js
- Express
- Trefle API
- HTML
- CSS
- JavaScript