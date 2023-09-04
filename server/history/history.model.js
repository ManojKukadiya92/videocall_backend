const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    host_id: { type: Schema.Types.ObjectId, ref: "Host", default: null },
    coin: { type: Number, default: 0 },
    rupee: { type: Number, default: 0 },
    plan_id: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
    paymentGateWay: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);
