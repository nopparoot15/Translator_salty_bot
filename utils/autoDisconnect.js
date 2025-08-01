const { getVoiceConnection } = require("@discordjs/voice");

function autoDisconnect(client) {
  setInterval(() => {
    for (const [guildId, connection] of client.voice.connections) {
      const channel = connection.joinConfig.channelId;
      const guild = client.guilds.cache.get(guildId);
      const voiceChannel = guild?.channels?.cache.get(channel);

      if (!voiceChannel || voiceChannel.members.size <= 1) {
        connection.destroy();
        console.log(`🛑 Disconnected from empty channel in guild ${guildId}`);
      }
    }
  }, 60_000); // ตรวจสอบทุก 60 วินาที
}

module.exports = { autoDisconnect };
