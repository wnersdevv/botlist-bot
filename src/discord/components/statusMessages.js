const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

function baseContainer(accentColor) {
  return new ContainerBuilder().setAccentColor(accentColor);
}

function withPayload(container) {
  return { components: [container], flags: MessageFlags.IsComponentsV2 };
}

function botApprovedMessage(bot, siteUrl) {
  const container = baseContainer(0x2dd4bf)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${bot.name} onaylandi**`),
      new TextDisplayBuilder().setContent(`Botun listeye eklendi ve artik herkes tarafindan gorulebilir.`)
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Bot Sayfasini Gor").setURL(`${siteUrl}/bot/${bot.botId}`)
      )
    );
  return withPayload(container);
}

function botRejectedMessage(bot) {
  const container = baseContainer(0xef4444)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${bot.name} reddedildi**`),
      new TextDisplayBuilder().setContent(`Neden: ${bot.statusReason || "Belirtilmedi"}`)
    );
  return withPayload(container);
}

function voteConfirmedMessage(bot, voteCount) {
  const container = baseContainer(0x7c6cff)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Oyun kaydedildi**`),
      new TextDisplayBuilder().setContent(`${bot.name} icin oy verdin. Toplam oy: ${voteCount}`)
    );
  return withPayload(container);
}

function errorMessage(text) {
  const container = baseContainer(0xef4444).addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Hata olustu**`),
    new TextDisplayBuilder().setContent(text)
  );
  return withPayload(container);
}

function helpMenuMessage(siteUrl) {
  const container = baseContainer(0x7c6cff)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Komutlar**`),
      new TextDisplayBuilder().setContent("/durum - Bot ve site durumunu gosterir"),
      new TextDisplayBuilder().setContent("/bot-ara - Listedeki bir botu arar"),
      new TextDisplayBuilder().setContent("/istatistik - Genel site istatistiklerini gosterir")
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Siteyi Ac").setURL(siteUrl)
      )
    );
  return withPayload(container);
}

function statsMessage(stats) {
  const container = baseContainer(0x7c6cff).addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Site Istatistikleri**`),
    new TextDisplayBuilder().setContent(`Toplam Bot: ${stats.totalBots}`),
    new TextDisplayBuilder().setContent(`Onayli Bot: ${stats.approvedBots}`),
    new TextDisplayBuilder().setContent(`Kullanici: ${stats.totalUsers}`),
    new TextDisplayBuilder().setContent(`Toplam Oy: ${stats.totalVotes}`)
  );
  return withPayload(container);
}

function botSearchResultMessage(bot, siteUrl) {
  const container = baseContainer(bot.verified ? 0x2dd4bf : 0x7c6cff)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${bot.name}**${bot.verified ? " ✓" : ""}`),
      new TextDisplayBuilder().setContent(bot.shortDescription),
      new TextDisplayBuilder().setContent(`Oy: ${bot.voteCount} | Sunucu: ${bot.serverCount}`)
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Detaylari Gor").setURL(`${siteUrl}/bot/${bot.botId}`),
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Davet Et").setURL(bot.inviteUrl)
      )
    );
  return withPayload(container);
}

module.exports = {
  botApprovedMessage,
  botRejectedMessage,
  voteConfirmedMessage,
  errorMessage,
  helpMenuMessage,
  statsMessage,
  botSearchResultMessage,
};
