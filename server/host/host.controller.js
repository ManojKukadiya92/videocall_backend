const Host = require("./host.model");
const User = require("../user/user.model");
const Favorite = require("../favorite/favorite.model");
const arraySort = require("array-sort");
const fs = require("fs");
const { deleteFile, deleteVideo } = require("../../util/deleteFile");
const Language = require("../language/language.model");
const dayjs = require("dayjs");
const shuffle = require("../../util/shuffle");
const axios = require("axios");
const config = require("../../config");
const repeatArray = require("repeat-array");

//all host list
exports.hostList = async (req, res, next) => {
  try {
    // const start = req.query.start ? parseInt(req.query.start) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 25;

    // const total = await Host.find({ isDeleted: false }).countDocuments();

    // const host = await Host.find({ isDeleted: false })
    //   .populate("language")
    //   .sort({ createdAt: -1 })
    //   .skip((start - 1) * limit)
    //   .limit(limit);
    const host = await Host.find({ isDeleted: false })
      .populate("language")
      .sort({ createdAt: -1 });

    if (!host) {
      return res
        .status(200)
        .send({ status: false, error: "Internal server error" });
    }

    // return res.status(200).json({ status: true, host, total });
    return res.status(200).json({ status: true, host });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//create host
exports.hostStore = async (req, res, next) => {
  try {
    if (req.body.name && req.body.language && req.body.age && req.body.bio) {
      const isLanguageExist = await Language.findById(req.body.language);
      if (!isLanguageExist)
        return res
          .status(500)
          .json({ status: false, message: "Oops ! Language doesn't exist" });

      const host = new Host();
      host.name = req.body.name;
      host.language = req.body.language;
      host.age = req.body.age;
      host.bio = req.body.bio;
      host.image = config.serverPath + req.files.image[0].path;
      host.image1 = req.files.image1
        ? config.serverPath + req.files.image1[0].path
        : "null";
      host.image2 = req.files.image2
        ? config.serverPath + req.files.image2[0].path
        : "null";
      host.video =
        req.body.videoType === "link"
          ? req.body.video
          : req.files.video
          ? config.serverPath + req.files.video[0].path
          : "null";
      host.like = Math.floor(Math.random() * (500 - 100)) + 100;

      await host.save(async (error, host_) => {
        if (error)
          return res
            .status(200)
            .json({ status: false, error: error.message || "server error" });
        else {
          const host = await Host.findById(host_._id).populate("language");
          return res.status(200).json({
            status: true,
            message: "Host Add Successfully",
            host,
          });
        }
      });
    } else {
      if (req.files) deleteVideo(req.files);
      return res
        .status(500)
        .json({ status: false, message: "Invalid details" });
    }
  } catch (error) {
    if (req.files) deleteVideo(req.files);
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//edit host
exports.hostEdit = async (req, res, next) => {
  try {
    const host = await Host.findById(req.params.host_id);
    if (!host) {
      if (req.file) deleteFile(req.file);
      return res.status(500).json({
        status: false,
        message: "Oops ! host not found",
      });
    }

    const hostData = {};
    if (req.files.image) {
      if (fs.existsSync(host.image)) fs.unlinkSync(host.image);
      hostData.image = config.serverPath + req.files.image[0].path;
    }
    if (req.files.image1) {
      if (fs.existsSync(host.image1)) fs.unlinkSync(host.image1);
      hostData.image1 = config.serverPath + req.files.image1[0].path;
    }
    if (req.files.image2) {
      if (fs.existsSync(host.image2)) fs.unlinkSync(host.image2);
      hostData.image2 = config.serverPath + req.files.image2[0].path;
    }
    if (req.body.videoType === "link") {
      if (fs.existsSync(host.video)) fs.unlinkSync(host.video);
      hostData.video = req.body.video;
    } else if (req.files.video) {
      if (fs.existsSync(host.video)) fs.unlinkSync(host.video);
      hostData.video = config.serverPath + req.files.video[0].path;
    }
    let isLanguageExist;
    if (req.body.language) {
      isLanguageExist = await Language.findById(req.body.language);
      if (!isLanguageExist)
        return res
          .status(500)
          .json({ status: false, message: "Oops ! Language doesn't exist" });
    }

    hostData.name = req.body.name;

    hostData.language = req.body.language;

    hostData.age = req.body.age;
    hostData.bio = req.body.bio;

    await Host.updateOne({ _id: req.params.host_id }, { $set: hostData }).exec(
      async (errorUpdate) => {
        if (errorUpdate)
          return res.status(200).json({ status: false, errorUpdate });
        const host = await Host.findOne({ _id: req.params.host_id }).populate(
          "language"
        );

        return res.status(200).send({
          status: true,
          message: "Host details update successfully",
          host,
        });
      }
    );
  } catch (error) {
    if (req.file) deleteFile(req.file);
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//delete host
exports.hostDelete = async (req, res, next) => {
  try {
    const host = await Host.findById(req.params.host_id);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Host not found" });
    }

    if (fs.existsSync(host.image)) {
      fs.unlinkSync(host.image);
    }
    if (fs.existsSync(host.image1)) {
      fs.unlinkSync(host.image1);
    }
    if (fs.existsSync(host.image2)) {
      fs.unlinkSync(host.image2);
    }
    if (fs.existsSync(host.video)) {
      fs.unlinkSync(host.video);
    }
    await host.deleteOne();

    return res
      .status(200)
      .json({ status: true, message: "delete", result: true });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//delete host (temporary)
exports.deleteHost = async (req, res, next) => {
  try {
    if (!req.params.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host id is required." });
    const host = await Host.findById(req.params.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host not found" });
    }
    await Host.updateOne(
      { _id: req.params.host_id },
      {
        $set: {
          isDeleted: true,
          isDisable: true,
          isOnline: false,
          isBusy: false,
        },
      }
    ).exec(async (errorUpdate) => {
      if (errorUpdate)
        return res.status(200).json({ status: false, errorUpdate });

      return res.status(200).send({
        status: true,
        message: "Host delete  successfully",
      });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host enable-disable
exports.hostEnableDisable = async (req, res, next) => {
  try {
    const host = await Host.findById(req.params.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host not found" });
    }

    host.isDisable = !host.isDisable;
    host.isOnline = false;
    host.isBusy = false;
    await host.save((error, host) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res.status(200).json({ status: true, message: "success", host });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host profile
exports.hostProfileDetail = async (req, res, next) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findOne({ _id: req.query.host_id });

      if (!host)
        return res
          .status(200)
          .json({ status: false, message: "Oops ! something went wrong" });

      return res.status(200).json({ status: true, message: "success", host });
    } else
      return res.status(200).send({ status: false, error: "Invalid details" });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//when host is enter the app call this route for is online true
exports.hostOnline = async (req, res, next) => {
  try {
    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host id is required." });
    if (!req.query.token)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! token is required" });
    if (!req.query.channel)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! channel is required" });
    const host = await Host.findById(req.query.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host not found" });
    }
    if (host.isDisable === false) {
      host.isOnline = true;
      host.isBusy = false;
      host.token = req.query.token;
      host.channel = req.query.channel;
      host.LastOnlineDate = new Date().toISOString().slice(0, 10);
      await host.save((error, host) => {
        if (error)
          return res
            .status(200)
            .json({ status: false, error: error.message || "server error" });
        else return res.status(200).json({ status: true, message: "success" });
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! You are blocked by Admin" });
    }
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//when host is exit the app call this route for is online false
exports.hostOffline = async (req, res, next) => {
  try {
    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host id is required." });
    const host = await Host.findById(req.query.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host not found" });
    }
    host.isOnline = false;

    await host.save((error, host) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else return res.status(200).json({ status: true, message: "success" });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host thumb-list language wise
exports.globalThumbList = async (req, res, next) => {
  try {
    if (!req.query.language)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! language is Required" });

    if (!req.query.user_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! User id is Required" });

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const userExist = await User.exists({ _id: req.query.user_id });

    if (!userExist)
      return res.status(200).json({
        status: false,
        message: "Oops ! user doesn't exist",
      });

    let image;
    if (req.query.language === "ALL") {
      image = await Host.find({ isDisable: false })
        .sort({ createdAt: 1 })
        .populate("language");
    } else {
      image = await Host.find({
        language: req.query.language,
        isDisable: false,
        isDeleted: false,
      })
        .sort({ createdAt: 1 })
        .populate("language");
    }

    const IsLike = await Favorite.find({ user_id: req.query.user_id });

    const mainArr = await image.map((obj) => ({
      ...obj._doc,
      isLike: false,
    }));

    for (var i = 0; i < mainArr.length; i++) {
      await IsLike.map((IsLike) => {
        if (IsLike.host_id.toString() == mainArr[i]._id.toString()) {
          mainArr[i].isLike = true;
        }
      });
    }

    // arraySort(mainArr, "isOnline", { reverse: true });
    shuffle(mainArr);

    const data = mainArr.slice(start, 20 + start);

    return res.status(200).json({
      status: true,
      message: "success",
      thumbList: data,
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//get single thumb
exports.singleThumbList = async (req, res, next) => {
  try {
    if (!req.query.language)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! language is Required" });

    if (!req.query.user_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! User id is Required" });

    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! User id is Required" });

    const userExist = await User.exists({ _id: req.query.user_id });

    if (!userExist)
      return res.status(200).json({
        status: false,
        message: "Oops ! user doesn't exist",
      });

    let image;

    image = await Host.find({
      isDisable: false,
      isDeleted: false,
      _id: req.query.host_id,
    })
      .sort({ createdAt: 1 })
      .populate("language");

    const IsLike = await Favorite.find({ user_id: req.query.user_id });

    const mainArr = await image.map((obj) => ({
      ...obj._doc,
      isLike: false,
    }));

    for (var i = 0; i < mainArr.length; i++) {
      await IsLike.map((IsLike) => {
        if (IsLike.host_id.toString() == mainArr[i]._id.toString()) {
          mainArr[i].isLike = true;
        }
      });
    }

    shuffle(mainArr);
    arraySort(mainArr, "isBusy");
    return res.status(200).json({
      status: true,
      message: "success",
      thumbList: mainArr,
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//board (coin wise host)
exports.board = async (req, res, next) => {
  try {
    if (!req.query.user_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! User id is Required" });

    const userExist = await User.exists({ _id: req.query.user_id });

    if (!userExist)
      return res.status(200).json({
        status: false,
        message: "Oops ! user doesn't exist",
      });

    let image;
    image = await Host.find({ isDisable: false, isDeleted: false })
      .sort({ coin: -1 })
      .limit(30)
      .populate("language");

    const mainArr = await image.map((obj) => ({
      ...obj._doc,
      isLike: false,
    }));

    // arraySort(mainArr, "coin", { reverse: true });

    return res.status(200).json({
      status: true,
      message: "success",
      thumbList: mainArr,
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//random host (match)
exports.randomHost = async (req, res, next) => {
  try {
    let image;

    image = await Host.find({ isDisable: false, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate("language");

    const mainArr = await image.map((obj) => ({
      bio: obj.bio,
      image1: obj.image1 === "null" ? obj.image : obj.image1,
      image2: obj.image2,
      isOnline: obj.isOnline,
      isBusy: obj.isBusy,
      like: obj.like,
      isDisable: obj.isDisable,
      coin: obj.coin,
      isLogout: obj.isLogout,
      isDeleted: obj.isDeleted,
      fromAPI: obj.fromAPI,
      video: obj.video,
      videoType: obj.videoType,
      _id: obj._id,
      name: obj.name,
      language: obj.language ? obj.language : {},
      age: obj.age,
      image: obj.image,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      __v: 0,
      isLike: false,
    }));

    shuffle(mainArr);
    return res.status(200).json({
      status: true,
      message: "success",
      thumbList: mainArr,
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//top all host leaderBoard (currentWeek,lastWeek)
exports.topHost = async (req, res, next) => {
  try {
    const total = await Host.find({ isDeleted: false }).countDocuments();

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : total;

    const host = await Host.find({ isDisable: false, isDeleted: false })
      .populate("language")
      .sort({ coin: -1 })
      .sort({ createdAt: -1 })
      .skip((start - 1) * limit)
      .limit(limit);

    return res
      .status(200)
      .json({ status: true, message: "success", host, total });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//check host is busy or not
exports.isHostBusy = async (req, res, next) => {
  try {
    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host id is required." });
    const host = await Host.findById(req.query.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host not found" });
    }
    if (host.isBusy === true)
      return res
        .status(200)
        .json({ status: true, message: "This host is busy : true" });
    else
      return res
        .status(200)
        .json({ status: false, message: "This host is busy : false" });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//delete host
exports.deleteHost = async (req, res, next) => {
  try {
    if (!req.params.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host id is required." });
    const host = await Host.findById(req.params.host_id);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host not found" });
    }
    await Host.updateOne(
      { _id: req.params.host_id },
      {
        $set: {
          isDeleted: true,
          isDisable: true,
          isOnline: false,
          isBusy: false,
        },
      }
    ).exec(async (errorUpdate) => {
      if (errorUpdate)
        return res.status(200).json({ status: false, errorUpdate });

      return res.status(200).send({
        status: true,
        message: "Host delete  successfully",
      });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//update coin through admin
exports.hostCoinUpdate = async (req, res) => {
  try {
    const host = await Host.findById(req.params.host_id);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host not found" });
    }

    host.coin = req.body.coin;

    await host.save();

    return res.status(200).send({
      status: true,
      message: "Host Coin update successfully",
      host,
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//search host by their name for admin panel
exports.searchHostName = async (req, res, next) => {
  try {
    if (req.query.value) {
      const start = req.query.start ? parseInt(req.query.start) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 25;

      const value = await Host.find({
        isDeleted: false,
        $or: [
          { name: { $regex: req.query.value, $options: "i" } },
          { languageName: { $regex: req.query.value, $options: "i" } },
        ],
      }).populate("language");

      const populateValue = await Host.aggregate([
        {
          $lookup: {
            from: "languages",
            localField: "language",
            foreignField: "_id",
            as: "language",
          },
        },
        {
          $match: {
            "language.language": { $regex: req.query.value, $options: "i" },
          },
        },
      ]);
      // debugger;
      for (var i = 0; i < populateValue.length; i++) {
        populateValue[i].language = populateValue[i].language[0];
      }
      const concat = value.concat(populateValue);

      //remove duplicate object
      const uniq = Object.values(
        concat.reduce((acc, cur) => Object.assign(acc, { [cur._id]: cur }), {})
      );

      return res.status(200).json({
        status: true,
        host: uniq.slice((start - 1) * limit, limit),
        total: uniq.length,
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Detail!" });
    }
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ status: false, error: error.message });
  }
};

//update like
exports.like = async (req, res, next) => {
  try {
    const host = await Host.find();
    await host.map(async (host) => {
      host.like = Math.floor(Math.random() * (500 - 100)) + 100;
      await host.save();
    });

    return res.send("success!");
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ status: false, error: error.message });
  }
};

const videoArr = [
  "https://videocall.xitijapp.com/videos/1.mp4",
  "https://videocall.xitijapp.com/videos/2.mp4",
  "https://videocall.xitijapp.com/videos/3.mp4",
  "https://videocall.xitijapp.com/videos/4.mp4",
  "https://videocall.xitijapp.com/videos/5.mp4",
  "https://videocall.xitijapp.com/videos/6.mp4",
  "https://videocall.xitijapp.com/videos/7.mp4",
  "https://videocall.xitijapp.com/videos/8.mp4",
  "https://videocall.xitijapp.com/videos/9.mp4",
  "https://videocall.xitijapp.com/videos/10.mp4",
  "https://videocall.xitijapp.com/videos/11.mp4",
  "https://videocall.xitijapp.com/videos/12.mp4",
  "https://videocall.xitijapp.com/videos/13.mp4",
  "https://videocall.xitijapp.com/videos/14.mp4",
  "https://videocall.xitijapp.com/videos/15.mp4",
  "https://videocall.xitijapp.com/videos/16.mp4",
  "https://videocall.xitijapp.com/videos/17.mp4",
  "https://videocall.xitijapp.com/videos/18.mp4",
  "https://videocall.xitijapp.com/videos/19.mp4",
  "https://videocall.xitijapp.com/videos/20.mp4",
  "https://videocall.xitijapp.com/videos/21.mp4",
  "https://videocall.xitijapp.com/videos/22.mp4",
  "https://videocall.xitijapp.com/videos/23.mp4",
  "https://videocall.xitijapp.com/videos/24.mp4",
  "https://videocall.xitijapp.com/videos/25.mp4",
  "https://videocall.xitijapp.com/videos/26.mp4",
  "https://videocall.xitijapp.com/videos/27.mp4",
  "https://videocall.xitijapp.com/videos/28.mp4",
  "https://videocall.xitijapp.com/videos/29.mp4",
  "https://videocall.xitijapp.com/videos/30.mp4",
  "https://videocall.xitijapp.com/videos/31.mp4",
];

exports.updateVideo = async (req, res, next) => {
  //update user coin

  // const user = await User.find().sort({ createdAt: -1 });

  // await user.map(async (data) => {
  //   data.coin = 500;

  //   await data.save();
  // });

  //update host video
  const host = await Host.find();
  await host.map(async (data) => {
    data.video = videoArr[Math.floor(Math.random() * videoArr.length)];
    data.videoType = "link";

    await data.save();
  });

  return res.send("success");
};
