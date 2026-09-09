const { SlashCommandBuilder } = require("discord.js");
const Bot = require("../../models/Bot");
const { botSearchResultMessage, errorMessage } = require("../components/statusMessages");
const { getConfig } = require("../../utils/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot-ara")
    .setDescription("Listedeki bir botu arar.")
    .addStringOption((option) =>
      option.setName("isim").setDescription("Aranacak bot adi").setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString("isim");
    const bot = await Bot.findOne({
      status: "approved",
      name: { $regex: query, $options: "i" },
    }).sort({ voteCount: -1 });

    if (!bot) {
      return interaction.reply({ ...errorMessage("Bu isimde onayli bir bot bulunamadi."), ephemeral: true });
    }

    const { site } = getConfig();
    await interaction.reply(botSearchResultMessage(bot, site.url));
  },
};
