module.exports = {
  name: "tts",
  description: "ตั้งค่า TTS engine per user หรือ per server",
  async execute(message, args, client) {
    await message.delete().catch(() => {});

    if (args.length !== 3 || args[0].toLowerCase() !== "engine") {
      return message.channel.send("❗ ใช้งาน: `!tts engine [user|server] [gtts|edge]`").then(msg =>
        setTimeout(() => msg.delete().catch(() => {}), 8000)
      );
    }

    const scope = args[1].toLowerCase();
    const engine = args[2].toLowerCase();

    if (!["user", "server"].includes(scope) || !["gtts", "edge"].includes(engine)) {
      return message.channel.send("❗ ใช้งาน: `!tts engine [user|server] [gtts|edge]`").then(msg =>
        setTimeout(() => msg.delete().catch(() => {}), 8000)
      );
    }

    if (scope === "user") {
      client.userTtsEngine.set(message.author.id, engine);
      return message.channel.send(`✅ ตั้งค่า TTS ของคุณเป็น \`${engine}\``).then(msg =>
        setTimeout(() => msg.delete().catch(() => {}), 5000)
      );
    }

    if (scope === "server") {
      if (!message.member.permissions.has("Administrator")) {
        return message.channel.send("❌ ต้องเป็นแอดมินถึงจะตั้งค่าเซิร์ฟเวอร์ได้").then(msg =>
          setTimeout(() => msg.delete().catch(() => {}), 6000)
        );
      }
      client.serverTtsEngine.set(message.guild.id, engine);
      return message.channel.send(`✅ ตั้งค่า TTS สำหรับเซิร์ฟเวอร์นี้เป็น \`${engine}\``).then(msg =>
        setTimeout(() => msg.delete().catch(() => {}), 5000)
      );
    }
  }
};
