const { createServer } = require("./src/api/server");
const { connectDatabase } = require("./src/database/connection");
const { startBot } = require("./src/discord/client");
const { registerClient } = require("./src/discord/notifier");
const { getConfig } = require("./src/utils/config");
const logger = require("./src/utils/logger");

async function bootstrap() {
  try {
    await connectDatabase();

    const discordClient = await startBot();
    if (discordClient) registerClient(discordClient);

    const app = createServer();
    const { website } = getConfig();

    app.listen(website.port, () => {
      logger.info(`Web sunucusu http://localhost:${website.port} adresinde calisiyor.`);
    });
  } catch (err) {
    logger.error("Baslatma hatasi:", err.message);
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  logger.error("Yakalanmamis promise hatasi:", err);
});

bootstrap();
