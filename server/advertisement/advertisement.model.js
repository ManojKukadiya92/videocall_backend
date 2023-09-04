const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const advertisementSchema = new Schema(
  {
    native: { type: String, default: null },
    banner: { type: String, default: null },
    interstitial: { type: String, default: null },
    type: { type: String, default: null },
    appOpenAd: { type: String, default: null },
    show: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Advertisement", advertisementSchema);
