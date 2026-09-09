const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

function createClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.commands = new Collection();

  const commandsPath = path.join(__dirname, "commands");
  for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"))) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
  }

  const eventsPath = path.join(__dirname, "events");
  for (const file of fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"))) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }

  return client;
}

async function startBot() {
  const { getConfig } = require("../utils/config");
  const { bot } = getConfig();

  if (!bot.token) {
    logger.warn("Bot token bulunamadi, Discord istemcisi baslatilmiyor.");
    return null;
  }

  const client = createClient();
  await client.login(bot.token);
  return client;
}

module.exports = { createClient, startBot };
