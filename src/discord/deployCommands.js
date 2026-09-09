const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { getConfig } = require("../utils/config");
const logger = require("../utils/logger");

async function deploy() {
  const { bot, discord } = getConfig();
  const commandsPath = path.join(__dirname, "commands");
  const commands = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".js"))
    .map((f) => require(path.join(commandsPath, f)).data.toJSON());

  const rest = new REST().setToken(bot.token);

  const route = discord.guildId
    ? Routes.applicationGuildCommands(bot.clientId, discord.guildId)
    : Routes.applicationCommands(bot.clientId);

  await rest.put(route, { body: commands });
  logger.info(`${commands.length} komut yayinlandi.`);
}

if (require.main === module) {
  deploy().catch((err) => {
    logger.error(err);
    process.exit(1);
  });
}

module.exports = { deploy };
