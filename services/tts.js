const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const edgeTTS = require("edge-tts");
const gTTS = require("gtts");
const { createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require("@discordjs/voice");

const EDGE_VOICE_MAP = {
  th: "th-TH-PremwadeeNeural",
  en: "en-US-JennyNeural",
  ja: "ja-JP-NanamiNeural",
  "zh-CN": "zh-CN-XiaoxiaoNeural",
  ko: "ko-KR-SunHiNeural",
  ru: "ru-RU-SvetlanaNeural",
  id: "id-ID-GadisNeural",
  tl: "fil-PH-BlessicaNeural",
  hi: "hi-IN-SwaraNeural",
  vi: "vi-VN-HoaiMyNeural"
};

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
    const voiceLang = lang === "zh" ? "zh-CN" : lang;
    const ttsEngine = client.userTtsEngine.get(message.author.id) ||
                      client.serverTtsEngine.get(message.guild.id) || "gtts";

    try {
      if (ttsEngine === "edge") {
        const voice = EDGE_VOICE_MAP[voiceLang] || "en-US-JennyNeural";
        await edgeTTS
          .convertStream({ text, voice, format: "audio-24khz-48kbitrate-mono-mp3" })
          .then(result =>
            new Promise((resolve, reject) => {
              const stream = fs.createWriteStream(filename);
              result.stream.pipe(stream);
              stream.on("finish", resolve);
              stream.on("error", reject);
            })
          );
      } else {
        const tts = new gTTS(text, voiceLang);
        await new Promise((resolve, reject) => {
          tts.save(filename, err => (err ? reject(err) : resolve()));
        });
      }

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
    } catch (e) {
      console.error("❌ TTS error:", e);
    } finally {
      if (fs.existsSync(filename)) fs.unlinkSync(filename);
      queue.shift();
    }
  }
}

module.exports = { speakMultiLang };
