const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
