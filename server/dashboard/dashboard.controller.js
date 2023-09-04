const Complaint = require("../complaint/complaint.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const Language = require("../language/language.model");

const Plan = require("../plan/plan.model");

exports.dashboard = async (req, res) => {
  try {
    let total_count = {};

    total_count.user = await User.countDocuments();
    total_count.complain = await Complaint.find({
      isOpen: false,
    }).countDocuments();
    total_count.host = await Host.find({ isDeleted: false }).countDocuments();
    total_count.onlineHost = await Host.find({
      isOnline: true,
    }).countDocuments();
    total_count.busyHost = await Host.find({
      isBusy: true,
      isOnline: true,
    }).countDocuments();
    total_count.language = await Language.countDocuments();

    total_count.plan = await Plan.countDocuments();

    return res
      .status(200)
      .json({ status: true, message: "success", data: total_count });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
