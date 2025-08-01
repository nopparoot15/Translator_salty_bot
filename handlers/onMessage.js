const { AttachmentBuilder } = require("discord.js");
const { splitTextByLanguage } = require("../utils/langSplitter");
const { ocrFromImage } = require("../services/ocr");
const { speakMultiLang } = require("../services/tts");
const { translateText } = require("../services/translate");
const { sendLongMessage } = require("../utils/messaging");
const { detect } = require("langdetect");

const OCR_CHANNELS = new Set([
  "1400080777911472170",
  "1400214729384788109"
]);

const AUTO_TTS_CHANNELS = new Set([
  "1396150984329396334",
  "1400838099121999962"
]);

const TRANSLATION_CHANNELS = {
  "1400142485266763846": "multi",
  "1400151288871653456": "multi",
  "1396042947182596229": ["th", "ja"],
  "1400241948996141186": ["th", "en"],
  "1396057794297204877": ["th", "en"],
  "1396100631814471690": ["th", "zh"],
  "1396100850966990938": ["th", "ko"],
  "1396100885288976424": ["th", "ru"],
  "1396123234746896434": ["th", "id"],
  "1396123181127045204": ["th", "tl"],
  "1396406891596218479": ["th", "hi"],
  "1396410707175800944": ["th", "vi"],
  "1398616266809282670": ["th", "ja"]
};

module.exports = async function onMessage(message, client) {
  if (!message.guild || message.author.bot) return;

  const channelId = message.channel.id;

  // === OCR: ถอดข้อความจากภาพ ===
  if (OCR_CHANNELS.has(channelId) && message.attachments.size > 0) {
    for (const attachment of message.attachments.values()) {
      const filename = attachment.name.toLowerCase();
      if (!filename.endsWith(".png") && !filename.endsWith(".jpg") && !filename.endsWith(".jpeg")) continue;

      await message.channel.send("🔍 กำลังถอดข้อความจากภาพ...");
      const buffer = await attachment.attachment.download();
      const result = await ocrFromImage(buffer);
      await sendLongMessage(message.channel, result);
    }
    return;
  }

  // === Auto TTS Multi-Language ===
  if (AUTO_TTS_CHANNELS.has(channelId)) {
    const content = message.content.trim();
    if (!content) return;

    const parts = splitTextByLanguage(content);
    const cleanedParts = parts.map(([text, lang]) => {
      return [text, ["th", "en", "ja", "zh-CN", "ko", "ru", "id", "tl", "hi", "vi"].includes(lang) ? lang : "en"];
    });

    await speakMultiLang(message, cleanedParts, client);
    return;
  }

  // === Translation Channels ===
  if (!TRANSLATION_CHANNELS[channelId]) return;

  const config = TRANSLATION_CHANNELS[channelId];
  const text = message.content.trim();
  if (!text) return;

  const sourceLang = detect(text);

  // MULTI mode
  if (config === "multi") {
    const translated = await translateText(text, sourceLang, "th");
    await sendLongMessage(message.channel, `🇹🇭 ${translated}`);
    return;
  }

  // FIXED mode
  const [langA, langB] = config;
  const targetLang = sourceLang === langA ? langB : langA;
  const translated = await translateText(text, sourceLang, targetLang);
  await sendLongMessage(message.channel, `${getFlag(targetLang)} ${translated}`);

  // TTS พูดตามคำแปล
  const parts = [[translated, targetLang]];
  await speakMultiLang(message, parts, client);
};

function getFlag(lang) {
  return {
    th: "🇹🇭", en: "🇺🇸", ja: "🇯🇵", zh: "🇨🇳", ko: "🇰🇷",
    ru: "🇷🇺", id: "🇮🇩", tl: "🇵🇭", hi: "🇮🇳", vi: "🇻🇳"
  }[lang] || "";
}
