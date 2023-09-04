const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: String,
    image: String,
    username: String,
    coin: { type: Number, default: 0 },
    identity: { type: String, default: null },
    email: String,
    password: { type: String, default: null },
    isLogout: { type: Boolean, default: false },
    isBlock: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    guest: { type: String, default: null },
    analyticDate: { type: String },

    // loginType: { type: String }, // quick , gmail
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
