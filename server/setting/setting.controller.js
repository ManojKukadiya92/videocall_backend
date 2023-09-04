const Setting = require("./setting.model");

//setting list
exports.settingList = async (req, res, next) => {
  try {
    await Setting.find()
      .sort({ createdAt: -1 })
      .exec((error, setting) => {
        if (error)
          return res
            .status(200)
            .send({ status: false, error: "Internal server error" });
        else
          return res
            .status(200)
            .json({ status: true, message: "success", setting: setting[0] });
      });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//create setting
exports.store = async (req, res, next) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });

    if (!req.body.policyLink)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! policy link is required" });

    const setting = new Setting();

    setting.policyLink = req.body.policyLink;

    await setting.save((error) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res
          .status(200)
          .json({ status: true, message: "success", setting });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//update setting
exports.update = async (req, res, next) => {
  try {
    const setting = await Setting.findById(req.params.setting_id);

    if (!setting) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! id not found" });
    }

    const settingData = {
      loginBonus: req.body.loginBonus,
      upiId: req.body.upiId,
      userCharge: req.body.userCharge,
      policyLink: req.body.policyLink,
      redeemGateway: req.body.redeemGateway,
      minCoins: req.body.minCoins,
      toCurrency: req.body.toCurrency,
      howManyCoins: req.body.howManyCoins,
      minFreeSecond: req.body.minFreeSecond,
      durationBetweenCall: req.body.durationBetweenCall,
      howManyFreeCall: req.body.howManyFreeCall,
      whatsAppNo: req.body.whatsAppNo,
      merchantKey: req.body.merchantKey,
      merchantId: req.body.merchantId,
      merchantSalt: req.body.merchantSalt,
      maxSecondForCall: req.body.maxSecondForCall,
      googlePayId: req.body.googlePayId,
    };

    await Setting.updateOne(
      { _id: req.params.setting_id },
      { $set: settingData }
    ).exec(async (errorUpdate) => {
      if (errorUpdate)
        return res.status(200).json({ status: false, errorUpdate });
      const setting = await Setting.findOne({ _id: req.params.setting_id });

      return res.status(200).send({
        status: true,
        message: "Setting update successfully",
        setting,
      });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//Is under maintenance or not
exports.isUnderMaintenance = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.setting_id);
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.isAppActive = !setting.isAppActive;
    await setting.save((error, setting) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res
          .status(200)
          .json({ status: true, message: "success", setting });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//Is WhatsApp support or not
exports.isWhatsAppSupport = async (req, res, next) => {
  try {
    const setting = await Setting.findById(req.params.setting_id);
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.isWpSupport = !setting.isWpSupport;

    await setting.save((error, setting) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res
          .status(200)
          .json({ status: true, message: "success", setting });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//Is UPI Active or not
exports.isUPIActive = async (req, res, next) => {
  try {
    const setting = await Setting.findById(req.params.setting_id);
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.isUpi = !setting.isUpi;

    await setting.save((error, setting) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res
          .status(200)
          .json({ status: true, message: "success", setting });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//Is PayUMoney Active or not
exports.isPayUMoneyActive = async (req, res, next) => {
  try {
    const setting = await Setting.findById(req.params.setting_id);
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.isPayUMoneyActive = !setting.isPayUMoneyActive;

    await setting.save((error, setting) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res
          .status(200)
          .json({ status: true, message: "success", setting });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//Is google payId enable or not
exports.isGooglePayIdActive = async (req, res, next) => {
  try {
    const setting = await Setting.findById(req.params.setting_id);
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.isGooglePayId = !setting.isGooglePayId;

    await setting.save((error, setting) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res
          .status(200)
          .json({ status: true, message: "success", setting });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
