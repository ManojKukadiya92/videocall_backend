const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SettingSchema = new Schema(
  {
    loginBonus: { type: Number, default: 0 },
    upiId: { type: String, default: null },
    isUpi: { type: Boolean, default: false },
    userCharge: { type: Number, default: 0 },
    policyLink: String,
    minCoins: { type: Number, default: 10000 },
    toCurrency: { type: Number, default: 1 },
    howManyCoins: { type: Number, default: 2000 },
    minFreeSecond: { type: Number, default: 30 },
    durationBetweenCall: { type: Number, default: 60 },
    howManyFreeCall: { type: Number, default: 3 },
    whatsAppNo: { type: String, default: null },
    isWpSupport: { type: Boolean, default: false },
    isAppActive: { type: Boolean, default: true },
    isPayUMoneyActive: { type: Boolean, default: true },
    merchantKey: { type: String, default: null },
    merchantId: { type: String, default: null },
    merchantSalt: { type: String, default: null },
    maxSecondForCall: { type: Number, default: 1 },
    isGooglePayId: { type: Boolean, default: false },
    googlePayId: { type: String, default: null },
    adRefreshRate: { type: Number, default: 5000 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", SettingSchema);
