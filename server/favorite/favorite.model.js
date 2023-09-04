const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavoriteSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    host_id: { type: Schema.Types.ObjectId, ref: "Host" }, // live host thumbList host_id (favorite host)
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Favorite", FavoriteSchema);
