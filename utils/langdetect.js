const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();

const langMap = {
  english: "en",
  japanese: "ja",
  thai: "th",
  chinese: "zh-CN",
  korean: "ko",
  russian: "ru",
  vietnamese: "vi",
  indonesian: "id",
  tagalog: "tl",
  hindi: "hi",
  spanish: "es",
  french: "fr",
  german: "de"
};

function detectLanguage(text) {
  if (!text || typeof text !== "string") return "unknown";

  const result = lngDetector.detect(text, 1); // max 1 result
  const detectedName = result?.[0]?.[0];

  return langMap[detectedName] || "unknown";
}

module.exports = { detectLanguage };
