async function sendLongMessage(channel, text, chunkSize = 1900) {
  if (!text) return;

  const chunks = [];
  let current = "";

  for (const line of text.split("\n")) {
    if ((current + line).length > chunkSize) {
      chunks.push(current);
      current = "";
    }
    current += line + "\n";
  }

  if (current.trim()) chunks.push(current);

  for (const chunk of chunks) {
    await channel.send(chunk.trim());
  }
}

module.exports = { sendLongMessage };
