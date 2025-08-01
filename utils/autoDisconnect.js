const { getVoiceConnection } = require("@discordjs/voice");

module.exports = function autoDisconnect(client) {
  setInterval(() => {
    for (const [guildId, connection] of client.voice.adapters) {
      const channelId = connection.channelId;
      const guild = client.guilds.cache.get(guildId);
      const voiceChannel = guild?.channels.cache.get(channelId);

      if (!voiceChannel || voiceChannel.members.size <= 1) {
        const conn = getVoiceConnection(guildId);
        if (conn) {
          conn.destroy();
          console.log(`🛑 Disconnected from empty VC in ${guild?.name || guildId}`);
        }
      }
    }
  }, 60_000);
};
