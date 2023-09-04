const Plan = require("./plan.model");
const arraySort = require("array-sort");

//get plan list
exports.planList = async (req, res) => {
  try {
    const total = await Plan.find().countDocuments();
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : total;

    await Plan.find()
      .sort({ createdAt: -1 })
      .skip((start - 1) * limit)
      .limit(limit)
      .exec((error, plan) => {
        if (error)
          return res
            .status(200)
            .send({ status: false, error: "Internal server error" });
        else {
          arraySort(plan, "rupee");
          return res
            .status(200)
            .json({ status: true, message: "success", plan, total });
        }
      });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//create plan
exports.store = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.coin)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! coin is required" });
    if (!req.body.rupee)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! rupee is required" });
    // if (!req.body.currency)
    //   return res
    //     .status(200)
    //     .json({ status: false, message: "currency is required" });
    if (!req.body.productKey)
      return res.status(200).json({
        status: false,
        message: "Oops !  Product Key is required",
      });

    const plan = new Plan();

    plan.coin = req.body.coin;
    plan.rupee = req.body.rupee;
    plan.productKey = req.body.productKey;
    plan.discount = req.body.discount ? req.body.discount : null;

    // plan.googleProductId = req.body.googleProductId;

    await plan.save((error, country) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res.status(200).json({ status: true, message: "success", plan });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update Plan
exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.coin)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! coin is required" });
    if (!req.body.rupee)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! rupee is required" });

    if (!req.body.productKey)
      return res.status(200).json({
        status: false,
        message: "Oops !  Product Key is required",
      });

    const plan = await Plan.findById(req.params.plan_id);

    if (!plan) {
      return res
        .status(200)
        .json({ status: false, message: "oops ! Plan not found" });
    }

    const planData = {
      coin: req.body.coin,
      rupee: req.body.rupee,
      productKey: req.body.productKey,
      discount: req.body.discount,

      // googleProductId: req.body.googleProductId,
    };

    await Plan.updateOne({ _id: req.params.plan_id }, { $set: planData }).exec(
      async (errorUpdate) => {
        if (errorUpdate)
          return res.status(200).json({ status: false, errorUpdate });
        const plan = await Plan.findOne({ _id: req.params.plan_id });
        return res.status(200).send({
          status: true,
          message: "Plan update successfully",
          plan,
        });
      }
    );
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//delete plan
exports.destroy = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.plan_id);
    if (!plan) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Plan not found" });
    }

    await plan.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Plan deleted successfully",
      result: true,
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
