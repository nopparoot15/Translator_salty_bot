const axios = require("axios");
const { translateText } = require("./translate");
const { detect } = require("langdetect");

const MAX_OCR_TEXT_LENGTH = 1900;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function ocrFromImage(imageBuffer) {
  if (!GOOGLE_API_KEY) return "❌ ไม่พบ GOOGLE_API_KEY ใน environment";

  const base64Image = imageBuffer.toString("base64");

  const payload = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION" }],
        imageContext: {
          languageHints: ["th", "en", "ja", "zh", "ko", "ru", "id", "tl", "vi"]
        }
      }
    ]
  };

  try {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      payload,
      { timeout: 10000 }
    );

    const annotations = response.data.responses[0]?.fullTextAnnotation;
    if (!annotations || !annotations.text) {
      return "❌ ไม่พบข้อความในภาพ";
    }

    let text = annotations.text.trim();
    if (text.length > MAX_OCR_TEXT_LENGTH) {
      text = text.slice(0, MAX_OCR_TEXT_LENGTH) + "\n... (ข้อความบางส่วนถูกตัด)";
    }

    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const translatedLines = [];

    for (const line of lines) {
      let lang = "unknown";
      try {
        lang = detect(line);
      } catch {}

      if (lang === "th") {
        translatedLines.push(line);
      } else {
        const prompt = `แปลข้อความต่อไปนี้เป็นภาษาไทยอย่างเป็นธรรมชาติ ห้ามใส่คำว่าแปลว่า หรืออธิบาย ให้แสดงเฉพาะคำแปลเท่านั้น:\n\n${line}`;
        const translated = await translateText(prompt, lang, "th");
        translatedLines.push(translated);
      }
    }

    return (
      `📝 ข้อความที่ถอดได้:\n${lines.join("\n")}\n\n` +
      `🇹🇭 แปลเป็นภาษาไทย:\n${translatedLines.join("\n")}`
    );
  } catch (error) {
    console.error("❌ OCR Error:", error);
    return "❌ เกิดข้อผิดพลาดขณะใช้ Google Vision API";
  }
}

module.exports = { ocrFromImage };
