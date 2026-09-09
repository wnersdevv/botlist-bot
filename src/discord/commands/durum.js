const { SlashCommandBuilder } = require("discord.js");
const { helpMenuMessage } = require("../components/statusMessages");
const { getConfig } = require("../../utils/config");

module.exports = {
  data: new SlashCommandBuilder().setName("durum").setDescription("Bot ve site durumunu gosterir."),
  async execute(interaction) {
    const { site } = getConfig();
    await interaction.reply(helpMenuMessage(site.url));
  },
};
