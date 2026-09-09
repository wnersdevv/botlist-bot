const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    discriminator: { type: String, default: "0" },
    avatar: { type: String, default: null },
    email: { type: String, default: null },
    role: {
      type: String,
      enum: ["user", "moderator", "admin", "owner"],
      default: "user",
    },
    banned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    tokenExpiresAt: { type: Date, select: false },
    bio: { type: String, maxlength: 300, default: "" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bot" }],
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.hasRoleAtLeast = function (role) {
  const order = ["user", "moderator", "admin", "owner"];
  return order.indexOf(this.role) >= order.indexOf(role);
};

module.exports = mongoose.model("User", userSchema);
