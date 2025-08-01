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
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Co
