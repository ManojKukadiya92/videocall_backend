const HostCallHistory = require("./hostCallHistory.model");
const Host = require("../host/host.model");
const User = require("../user/user.model");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const arraySort = require("array-sort");
const Device = require("../device/device.model");
const Setting = require("../setting/setting.model");
const History = require("../history/history.model");

//when connect user and host store call history or set host isBusy (true)
exports.callConnectHistory = async (req, res, next) => {
  try {
    debugger;
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! user id is required" });

    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host is required" });

    if (!req.body.device_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Device id is required" });

    const host = await Host.findById(req.body.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Host not found" });
    }
    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! User not found" });
    }

    const device = await Device.findOne({ deviceId: req.body.device_id });
    if (!device) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Device not found" });
    }

    await Device.updateOne(
      { deviceId: req.body.device_id },
      { $inc: { callCount: 1 } }
    );

    // if (host.isBusy == false) {
    const history = new HostCallHistory();
    history.host_id = req.body.host_id;
    history.user_id = req.body.user_id;
    history.date = new Date().toISOString().slice(0, 10);
    host.isBusy = true;

    host.save((error) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
    });
    //also add history of user in user history table
    const userHistory = new History();

    userHistory.user_id = req.body.user_id;
    userHistory.host_id = req.body.host_id;
    userHistory.coin = 0;

    userHistory.save();

    await history.save((error, history) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res.status(200).json({
          status: true,
          message: "Success",
          history,
          userHistoryId: userHistory._id,
        });
    });
    // }
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//when disconnect call set host isBusy (false)
exports.callDisconnect = async (req, res, next) => {
  try {
    if (!req.body.call_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! call is required" });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host is required" });

    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! user id is required" });

    if (!req.body.time)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! time is required" });

    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! User not found" });
    }

    const host = await Host.findById(req.body.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Host not found" });
    }

    host.isBusy = false;

    host.save((error) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
    });
    const history = await HostCallHistory.findById(req.body.call_id);
    if (history) {
      // console.log(req.body.time);
      await HostCallHistory.updateOne(
        { _id: history._id },
        { $set: { time: req.body.time } }
      ).exec(async (errorUpdate) => {
        if (errorUpdate)
          return res.status(200).json({ status: false, errorUpdate });
        else
          return res.status(200).send({
            status: true,
            message: "success",
          });
      });
    }
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//add coin in host account after 30sec of video call
exports.addCoin = async (req, res, next) => {
  try {
    if (!req.body.call_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! call id is required" });
    if (!req.body.coin)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! coin is required" });

    const history = await HostCallHistory.findById(req.body.call_id);

    const host = await Host.findById(history.host_id);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Host not found" });
    }

    host.coin = host.coin + parseInt(req.body.coin);
    host.save((error) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
    });

    if (history) {
      await HostCallHistory.updateOne(
        { _id: history._id },
        { $set: { coin: history.coin + parseInt(req.body.coin) } }
      ).exec(async (errorUpdate) => {
        if (errorUpdate)
          return res.status(200).json({ status: false, errorUpdate });
        else
          return res.status(200).send({
            status: true,
            message: "success",
          });
      });
    }
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "error message" });
  }
};

// disconnect call after maximum second  for call (if host off mobile data)
exports.AutoCallDisconnect = async (req, res, next) => {
  try {
    const setting = await Setting.find();
    // debugger;
    const callHistory = await HostCallHistory.find({
      time: { $gt: setting[0].maxSecondForCall },
    });

    await callHistory.map(async (data) => {
      const host = await Host.findById(data.host_id);
      if (!host) {
        // console.log("Something went wrong");
      }

      host.isBusy = false;

      await host.save((error) => {
        if (error) {
          // console.log("Something went wrong");
        }
      });

      const history = await HostCallHistory.findById(data._id);
      if (history) {
        await HostCallHistory.updateOne(
          { _id: history._id },
          { $set: { time: setting[0].maxSecondForCall } }
        ).exec(async (errorUpdate) => {
          if (errorUpdate) {
            // console.log("Something went wrong");
          } else {
            //  console.log("Success");
          }
        });
      }
    });
  } catch (error) {
    // console.log(error);
  }
};

// disconnect call after maximum second  for call (if host off mobile data)
exports.AutoDeleteHistory = async (req, res, next) => {
  try {
    const history = await HostCallHistory.find();
    const setting = await Setting.find();

    let array = [];
    let now = dayjs();

    await history.map(async (host_, index) => {
      const sec = now.diff(host_.createdAt, "second");

      // if (dayjs.duration(sec).seconds() >= setting[0].maxSecondForCall) {
      if (sec >= setting[0].maxSecondForCall) {
        // array.push(host);
        if (host_.coin >= 0 && host_.time === 0) {
          const host = await Host.findById(host_.host_id);
          await HostCallHistory.findByIdAndDelete(host._id);
          host.isBusy = false;
          host.save();
          // console.log("success");
        }
      }
    });
    // await array.map(async (data) => {
    //   if (data.coin >= 0 && data.time === 0) {
    //     await HostCallHistory.findByIdAndDelete(data._id);
    //     const host = await Host.findById(data.host_id);
    //     host.isBusy = false;
    //     host.save();
    //     console.log("success");
    //   }
    // });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ status: false, error: error.message });
  }
};
