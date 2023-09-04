const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const complaintSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    host_id: { type: Schema.Types.ObjectId, ref: "Host", default: null },
    title: { type: String },
    message: { type: String },
    contact: { type: String },
    image: { type: String, default: "null" },
    image1: { type: String, default: "null" },
    image2: { type: String, default: "null" },
    isOpen: { type: Boolean, default: false },
    date: String,
    id: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
