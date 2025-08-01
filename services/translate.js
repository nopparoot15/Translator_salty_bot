const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function translateText(prompt, sourceLang = "", targetLang = "th") {
  if (!OPENAI_API_KEY) return "❌ ไม่พบ OPENAI_API_KEY ใน environment";

  const fullPrompt = sourceLang === "th"
    ? `แปลข้อความต่อไปนี้เป็น${getLangName(targetLang)} โดยแสดงเฉพาะคำแปลที่เจ้าของภาษาจะพูดจริง ห้ามใส่คำว่าแปลว่า หรืออธิบาย ห้ามใส่วงเล็บ หรือชื่อภาษา:\n\n${prompt}`
    : prompt;

  const payload = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: fullPrompt }],
    temperature: 0.3,
    max_tokens: 2048
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices?.[0]?.message?.content?.trim() || "❌ ไม่พบคำตอบจากโมเดล";
  } catch (err) {
    console.error("❌ Translation error:", err.response?.data || err.message);
    return "❌ เกิดข้อผิดพลาดระหว่างการแปล";
  }
}

// ชื่อภาษาสำหรับ prompt ภาษาไทย
function getLangName(code) {
  const map = {
    en: "ภาษาอังกฤษ",
    ja: "ภาษาญี่ปุ่น",
    zh: "ภาษาจีน",
    "zh-CN": "ภาษาจีน",
    ko: "ภาษาเกาหลี",
    th: "ภาษาไทย",
    ru: "ภาษารัสเซีย",
    id: "ภาษาอินโดนีเซีย",
    tl: "ภาษาตากาล็อก",
    hi: "ภาษาฮินดี",
    vi: "ภาษาเวียดนาม"
  };
  return map[code] || `ภาษา ${code}`;
}

module.exports = { translateText };
