const { startBot } = require("./client");
const { botApprovedMessage, botRejectedMessage } = require("./components/statusMessages");
const { getConfig } = require("../utils/config");
const logger = require("../utils/logger");

let clientRef = null;

function registerClient(client) {
  clientRef = client;
}

async function sendDmToOwner(bot, payload) {
  if (!clientRef) return;
  const User = require("../models/User");
  const owner = await User.findById(bot.ownerId);
  if (!owner) return;

  try {
    const discordUser = await clientRef.users.fetch(owner.discordId);
    await discordUser.send(payload);
  } catch (err) {
    logger.warn(`Kullaniciya DM gonderilemedi: ${err.message}`);
  }
}

async function notifyBotApproved(bot) {
  const { site } = getConfig();
  await sendDmToOwner(bot, botApprovedMessage(bot, site.url));
}

async function notifyBotRejected(bot) {
  await sendDmToOwner(bot, botRejectedMessage(bot));
}

module.exports = { registerClient, notifyBotApproved, notifyBotRejected };
