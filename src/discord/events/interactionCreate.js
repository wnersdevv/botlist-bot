const { errorMessage } = require("../components/statusMessages");
const logger = require("../../utils/logger");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error(`Komut hatasi (${interaction.commandName}):`, err.message);
      const payload = errorMessage("Komut calistirilirken bir hata olustu.");
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ ...payload, ephemeral: true });
      } else {
        await interaction.reply({ ...payload, ephemeral: true });
      }
    }
  },
};
