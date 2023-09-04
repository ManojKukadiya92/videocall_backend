const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: String,
    thumbnail: String,
    description: String,
    ratting: { type: Number, default: 0 },
    link: String,
    logo: String,
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    isTop: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Game", gameSchema);
