const Advertisement = require("./advertisement.model");

//create advertisement
exports.storeGoogleFb = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });

    const GoogleFb = new Advertisement();

    GoogleFb.native = req.body.native;
    GoogleFb.banner = req.body.banner;
    GoogleFb.interstitial = req.body.interstitial;
    GoogleFb.appOpenAd = req.body.appOpenAd;
    GoogleFb.type = req.body.type;

    await GoogleFb.save();

    if (!GoogleFb) {
      throw new Error();
    }
    return res.status(200).json({
      status: true,
      message: "success",
      data: GoogleFb,
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//update advertisement
exports.uptGoogleFb = async (req, res) => {
  try {
    const googleFb = await Advertisement.findOne({ _id: req.params.ad_id });

    if (!googleFb)
      return res.status(200).json({
        status: false,
        message: "Advertisement does not Exist",
      });

    if (req.body.native || req.body.native == "") {
      googleFb.native = req.body.native;
    }

    if (req.body.banner || req.body.banner == "") {
      googleFb.banner = req.body.banner;
    }
    if (req.body.interstitial || req.body.interstitial == "") {
      googleFb.interstitial = req.body.interstitial;
    }
    if (req.body.appOpenAd || req.body.appOpenAd == "") {
      googleFb.appOpenAd = req.body.appOpenAd;
    }

    await googleFb.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: googleFb });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//enable & disable advertisement
exports.showToggle = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.ad_id);

    if (!advertisement) {
      return res.status(200).send({
        status: false,
        message: "Advertisement does not exist",
      });
    }

    advertisement.show = !advertisement.show;
    await advertisement.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: advertisement });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//for android and backend
exports.googleFacebookAd = async (req, res) => {
  try {
    const add = await Advertisement.find({
      $or: [{ type: "google" }, { type: "google1" }],
    });

    if (!add) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    const data = add.map((ad) => ({
      [ad.type]: { ...ad._doc },
    }));
    return res.status(200).json({
      status: true,
      message: "Success",
      ...data[0],
      ...data[1],
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
