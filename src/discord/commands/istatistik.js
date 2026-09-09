const { SlashCommandBuilder } = require("discord.js");
const { statsMessage } = require("../components/statusMessages");
const { getPublicSiteStats } = require("../../services/statsService");

module.exports = {
  data: new SlashCommandBuilder().setName("istatistik").setDescription("Genel site istatistiklerini gosterir."),
  async execute(interaction) {
    const stats = await getPublicSiteStats();
    await interaction.reply(statsMessage(stats));
  },
};
