const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hostCallHistorySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    host_id: { type: Schema.Types.ObjectId, ref: "Host", default: null },
    time: { type: Number, default: 0 },
    coin: { type: Number, default: 0 },
    date: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HostCallHistory", hostCallHistorySchema);
