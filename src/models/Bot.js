const mongoose = require("mongoose");

const botSchema = new mongoose.Schema(
  {
    botId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coOwners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    shortDescription: { type: String, required: true, maxlength: 200 },
    longDescription: { type: String, required: true, maxlength: 4000 },
    avatar: { type: String, default: null },
    banner: { type: String, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    prefix: { type: String, default: "/", maxlength: 10 },
    website: { type: String, default: null },
    supportServer: { type: String, default: null },
    github: { type: String, default: null },
    inviteUrl: { type: String, required: true },
    language: { type: String, default: "tr" },
    nsfw: { type: Boolean, default: false },
    features: [{ type: String, maxlength: 60 }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    statusReason: { type: String, default: null },
    verified: { type: Boolean, default: false },
    serverCount: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    monthlyVoteCount: { type: Number, default: 0 },
    weeklyVoteCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

botSchema.index({ name: "text", shortDescription: "text", longDescription: "text" });
botSchema.index({ voteCount: -1 });
botSchema.index({ createdAt: -1 });
botSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("Bot", botSchema);
