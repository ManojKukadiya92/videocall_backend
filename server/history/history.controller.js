const History = require("./history.model");
const User = require("../user/user.model");
const Plan = require("../plan/plan.model");
const Host = require("../host/host.model");

// const DateTime = require("machinepack-datetime");

//store history and less coin for host charge from user Account (which is set by admin)
exports.lessCoinHostCharge = async (req, res, next) => {
  try {
    if (!req.body.user_call_id) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! user call id is required" });
    }
    // if (!req.body.host_id) {
    //   return res
    //     .status(200)
    //     .json({ status: false, message: "Oops ! host is required" });
    // }

    if (req.body.coin != 0 && !req.body.coin) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! coin is required" });
    }

    // const host = await Host.findById(req.body.host_id);
    // if (!host) {
    //   return res
    //     .status(200)
    //     .json({ status: false, message: "Oops ! host is not exist" });
    // }
    const userExistHistory = await History.findById(req.body.user_call_id);

    if (!userExistHistory)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Something went wrong" });

    const user = await User.findById(userExistHistory.user_id);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "Oops !  user is not exist" });
    }

    if (user.coin <= 0 || user.coin < req.body.coin) {
      return res.status(200).json({
        status: false,
        message: "Oops ! You have not enough coin!",
      });
    }

    user.coin = user.coin - parseInt(req.body.coin);

    user.save((error) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
    });

    userExistHistory.coin = userExistHistory.coin + req.body.coin;

    await userExistHistory.save((error) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res.status(200).json({
          status: true,
          message: "Success ",
          user,
        });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//store history when purchase coin (add coin)
exports.purchaseCoinTransaction = async (req, res, next) => {
  try {
    const userExist = await User.findById(req.body.user_id);

    if (!userExist) {
      return res
        .status(200)
        .json({ status: false, message: "Oops !  user does not exist" });
    }
    //when update coin from admin panel create history
    let history;
    if (req.body.plan_id != "111111111111111111111111") {
      const PlanExist = await Plan.findById(req.body.plan_id);
      if (!PlanExist) {
        return res
          .status(200)
          .json({ status: false, message: "Oops ! Plan is not exist" });
      }

      if (userExist && PlanExist) {
        userExist.coin = userExist.coin + parseInt(PlanExist.coin);
        userExist.save((error) => {
          if (error)
            return res
              .status(200)
              .json({ status: false, error: error.message || "server error" });
        });
      }
      history = new History();

      history.user_id = req.body.user_id;
      history.coin = PlanExist.coin;
      history.rupee = PlanExist.rupee;
      history.plan_id = req.body.plan_id;
    } else {
      history = new History();

      history.user_id = req.body.user_id;
      history.coin = req.body.coin;
      history.rupee = -1;
      history.plan_id = req.body.plan_id;
      history.paymentGateWay = req.body.paymentGateWay;
    }

    await history.save((error) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res.status(200).json({
          status: true,
          message: "Success",
          user: userExist,
        });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//recharge history
exports.getRechargeHistory = async (req, res, next) => {
  try {
    const user = await History.find({
      plan_id: { $exists: true, $ne: null },
    }).where({ user_id: req.query.user_id });
    if (!req.query.user_id) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! user id is required" });
    }
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : user.length;
    const userExist = await History.find({
      plan_id: { $exists: true, $ne: null },
    })
      .where({ user_id: req.query.user_id })
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(limit);

    if (!userExist) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! no data found" });
    }

    const rechargeHistory = await userExist.map((data) => ({
      coin: data.coin,
      data: data.rupee,
      date: data.createdAt.toISOString().slice(0, 10),
    }));

    return res
      .status(200)
      .json({ status: true, message: "success", data: rechargeHistory });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//coin outgoing history
exports.getCoinOutgoingHistory = async (req, res, next) => {
  try {
    const userLength = await History.find({
      user_id: req.query.user_id,
      coin: { $ne: 0 },
    })
      .where({ plan_id: null })
      .countDocuments();
    if (!req.query.user_id) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! user id is required" });
    }
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : userLength;
    const userExist = await History.find({
      user_id: req.query.user_id,
      coin: { $ne: 0 },
    })
      .where({ plan_id: null })
      .populate("host_id")
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(limit);

    if (!userExist) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! no data found" });
    }
    // let timeAgoString;
    var options = { timeZone: "UTC", timeZoneName: "short" };
    const recharge = await userExist.map((data) => ({
      coin: data.coin,
      data: data.host_id.name,
      name: data.host_id.name,
      date: data.createdAt.toISOString().slice(0, 10),
      image: data.host_id.image,
      time: data.createdAt.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      // timeAgoString = DateTime.timeFrom({
      //   toWhen: DateTime.parse({
      //     datetime: data.createdAt,
      //   }).execSync(),
      //   fromWhen: new Date().getTime(),
      // }).execSync();
    }));
    return res
      .status(200)
      .json({ status: true, message: "success", data: recharge });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
