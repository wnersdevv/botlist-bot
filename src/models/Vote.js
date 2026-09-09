const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    bot: { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ipHash: { type: String, required: true },
  },
  { timestamps: true }
);

voteSchema.index({ bot: 1, user: 1, createdAt: -1 });

module.exports = mongoose.model("Vote", voteSchema);
