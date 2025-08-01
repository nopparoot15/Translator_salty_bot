const fs = require("fs");
const path = require("path");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const googleTTS = require("google-tts-api");
const {
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
  getVoiceConnection
} = require("@discordjs/voice");

async function speakMultiLang(message, parts, client) {
  const guildId = message.guild.id;
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return;

  const queue = client.ttsQueues.get(guildId) || [];
  client.ttsQueues.set(guildId, queue);

  for (const part of parts) {
    queue.push({ message, text: part[0], lang: part[1] });
  }

  if (queue.length > 1) return; // wait in queue

  while (queue.length > 0) {
    const { text, lang } = queue[0];
    const filename = path.join(__dirname, "..", "temp", `tts_${uuidv4()}.mp3`);
    const voiceLang = normalizeLang(lang);

    try {
      await downloadTTS(text, voiceLang, filename);

      const connection =
        getVoiceConnection(guildId) ||
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guildId,
          adapterCreator: message.guild.voiceAdapterCreator
        });

      await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

      const player = createAudioPlayer();
      const resource = createAudioResource(filename);
      connection.subscribe(player);
      player.play(resource);

      await new Promise(resolve => {
        player.on("error", resolve);
        player.on("idle", resolve);
      });
    } catch (err) {
      console.error("❌ TTS Error:", err);
    } finally {
      if (fs.existsSync(filename)) fs.unlinkSync(filename);
      queue.shift();
    }
  }
}

function normalizeLang(lang) {
  if (lang === "zh") return "zh-CN";
  return ["th", "en", "ja", "zh-CN", "ko", "ru", "id", "tl", "hi", "vi"].includes(lang)
    ? lang
    : "en";
}

async function downloadTTS(text, lang = "th", filePath = "tts.mp3") {
  const url = googleTTS.getAudioUrl(text, {
    lang,
    slow: false,
    host: "https://translate.google.com"
  });

  const file = fs.createWriteStream(filePath);
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
      file.on("error", reject);
    });
  });
}

module.exports = { speakMultiLang };
