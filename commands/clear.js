module.exports = {
  name: "clear",
  description: "ลบข้อความทั้งหมดในช่อง (เฉพาะผู้มีสิทธิ์)",
  async execute(message) {
    if (!message.member.permissions.has("ManageMessages")) {
      return message.channel.send("❌ คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้").then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }

    await message.delete().catch(() => {});
    const deleted = await message.channel.bulkDelete(100, true);
    const reply = await message.channel.send(`🧹 ลบข้อความแล้ว ${deleted.size} ข้อความ`);
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  }
};
