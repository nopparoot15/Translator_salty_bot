# 🌐 Discord Translate + OCR + TTS Bot (Node.js)

บอท Discord สารพัดประโยชน์สำหรับ:
- ✅ แปลภาษาอัตโนมัติ (ไทย ↔ อังกฤษ/ญี่ปุ่น/จีน/ฯลฯ)
- 🗣️ Text-to-Speech (พูดได้หลายภาษา, เลือกเสียงได้)
- 🖼️ OCR ถอดข้อความจากภาพด้วย Google Vision API
- 🎙️ รองรับระบบพูดหลายภาษาในประโยคเดียว
- 🔧 เปลี่ยน TTS engine (`gtts` หรือ `edge-tts`) ได้แบบ per-user หรือ per-server

---

## 📦 คุณสมบัติหลัก

| ฟีเจอร์ | รายละเอียด |
|---------|------------|
| ✅ แปลภาษา | รองรับ 10+ ภาษา, ตรวจจับภาษาอัตโนมัติ |
| 🔊 พูดข้อความ | ใช้เสียงคุณภาพสูงจาก Edge TTS หรือ gTTS |
| 🖼️ OCR | ถอดข้อความจากภาพทุกภาษา และแปลเป็นไทยทันที |
| 🔁 ตั้งค่า TTS | ตั้ง engine แบบ user/server ด้วยคำสั่ง |
| 🚫 ล้างข้อความ | `!clear` ลบข้อความในแชนแนล |

---

## ⚙️ วิธีติดตั้ง

### 1. เตรียมสิ่งที่ต้องใช้
- Discord Bot Token
- OpenAI API Key
- Google Vision API Key (API Key แบบ URL-compatible, ไม่ใช่ credentials.json)

### 2. สร้าง `.env` ไฟล์ใน root

```env
DISCORD_BOT_TOKEN=ใส่โทเคนของคุณ
OPENAI_API_KEY=ใส่คีย์ของ OpenAI
GOOGLE_API_KEY=ใส่คีย์ของ Google Vision
