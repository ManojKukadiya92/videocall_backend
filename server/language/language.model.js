const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LanguageSchema = new Schema(
  {
    language: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Language", LanguageSchema);
