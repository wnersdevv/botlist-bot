const axios = require("axios");
const { getConfig } = require("../utils/config");
const User = require("../models/User");
const { recordLog } = require("../services/logService");

function buildAuthorizeUrl() {
  const { bot, discord } = getConfig();
  const params = new URLSearchParams({
    client_id: bot.clientId,
    redirect_uri: discord.redirectUri,
    response_type: "code",
    scope: "identify email",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

async function redirectToDiscord(req, res) {
  res.redirect(buildAuthorizeUrl());
}

async function handleCallback(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) return res.redirect("/auth/discord");

    const { bot, discord } = getConfig();

    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: bot.clientId,
        client_secret: bot.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: discord.redirectUri,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    const profileResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = profileResponse.data;

    const role = discord.adminIds.includes(profile.id) ? "admin" : undefined;

    const update = {
      username: profile.username,
      discriminator: profile.discriminator || "0",
      avatar: profile.avatar,
      email: profile.email,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      lastLoginAt: new Date(),
    };
    if (role) update.role = role;

    const user = await User.findOneAndUpdate(
      { discordId: profile.id },
      { $set: update, $setOnInsert: { discordId: profile.id } },
      { upsert: true, new: true }
    );

    if (user.banned) {
      return res.status(403).render("errors/403", { title: "Hesabin Askiya Alindi" });
    }

    req.session.userId = user._id.toString();
    await recordLog("user.login", { actor: user._id, ip: req.ip });

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

module.exports = { redirectToDiscord, handleCallback, logout };
