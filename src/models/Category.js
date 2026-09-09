const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    icon: { type: String, default: null },
    botCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
