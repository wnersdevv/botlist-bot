const logger = require("../../utils/logger");

module.exports = {
  name: "clientReady",
  once: true,
  execute(client) {
    logger.info(`Discord istemcisi ${client.user.tag} olarak giris yapti.`);
  },
};
