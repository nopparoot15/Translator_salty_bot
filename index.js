require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path");

// สำหรับกัน container ถูก kill บน Railway
setInterval(() => {}, 1000 * 60 * 60); // 1 ชม.

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

// โหลดคำสั่งจากโฟลเดอร์ commands
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // เรียก autoDisconnect ถ้ามี
  const autoDisconnectPath = path.join(__dirname, "utils", "autoDisconnect.js");
  if (fs.existsSync(autoDisconnectPath)) {
    const autoDisconnect = require(autoDisconnectPath);
    if (typeof autoDisconnect === "function") autoDisconnect(client);
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.content.trim()) return;

  // คำสั่งเริ่มต้นด้วย !
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

  // จัดการข้อความทั่วไป เช่น OCR, แปล, พูด
  require("./handlers/onMessage")(message, client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
