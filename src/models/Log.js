const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    target: { type: String, default: null },
    targetType: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
