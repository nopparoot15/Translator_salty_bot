require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();
client.commandPrefix = "!";
client.ttsQueues = new Map();
client.userTtsEngine = new Map();
client.serverTtsEngine = new Map();

// Load command files
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.name, command);
}

// Event handlers
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  require("./utils/autoDisconnect")(client); // ตรวจสอบ VC ว่าง
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.content.trim()) return;

  // Run commands
  if (message.content.startsWith(client.commandPrefix)) {
    const args = message.content.slice(client.commandPrefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(message, args, client);
      } catch (error) {
        console.error(`❌ Error executing command ${commandName}:`, error);
        await message.reply("เกิดข้อผิดพลาดในการรันคำสั่งนี้");
      }
    }
    return;
  }

  // Custom message handling (OCR, auto translate, auto TTS)
  require("./handlers/onMessage")(message, client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
