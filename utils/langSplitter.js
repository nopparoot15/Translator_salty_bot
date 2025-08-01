const XRegExp = require("xregexp");

XRegExp.install("astral");

const pattern = XRegExp.union([
  { pattern: XRegExp('\\p{Script=Hiragana}|\\p{Script=Katakana}|[ー々]', 'g'), name: "ja" },
  { pattern: XRegExp('\\p{Script=Han}', 'g'), name: "zh" },
  { pattern: XRegExp('\\p{Script=Hangul}', 'g'), name: "ko" },
  { pattern: XRegExp('[ก-๙]', 'g'), name: "th" },
  { pattern: XRegExp('[а-яА-ЯёЁ]', 'g'), name: "ru" },
  { pattern: XRegExp('[\u0900-\u097F]', 'g'), name: "hi" },
  { pattern: XRegExp('[àáạảãâầấậẩẫăằắặẳẵêềếệểễôồốộổỗơờớợởỡưừứựửữ]', 'g'), name: "vi" },
  { pattern: XRegExp('[A-Za-z0-9]', 'g'), name: "en" }
]);

function splitTextByLanguage(text) {
  const matches = [];
  let buffer = "";
  let currentLang = null;

  for (const char of [...text]) {
    let detectedLang = null;
    for (const { pattern, name } of pattern) {
      if (XRegExp.test(char, pattern)) {
        detectedLang = name;
        break;
      }
    }

    if (detectedLang === currentLang) {
      buffer += char;
    } else {
      if (buffer) matches.push([buffer.trim(), currentLang || "unknown"]);
      buffer = char;
      currentLang = detectedLang;
    }
  }

  if (buffer) matches.push([buffer.trim(), currentLang || "unknown"]);
  return mergeAdjacent(matches);
}

function mergeAdjacent(parts) {
  const merged = [];
  for (const part of parts) {
    if (!merged.length) {
      merged.push(part);
      continue;
    }

    const [lastText, lastLang] = merged[merged.length - 1];
    const [currText, currLang] = part;

    if (lastLang === currLang) {
      merged[merged.length - 1] = [lastText + currText, lastLang];
    } else if (lastLang === "ja" && currLang === "en" && /^[a-zA-Z0-9]{1,3}$/.test(currText)) {
      merged[merged.length - 1] = [lastText + currText, "ja"];
    } else {
      merged.push(part);
    }
  }
  return merged;
}

module.exports = { splitTextByLanguage };
