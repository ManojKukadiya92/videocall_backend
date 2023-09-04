const Favorite = require("./favorite.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const Language = require("../language/language.model");
const arraySort = require("array-sort");
// const FakeVideo = require("../fakeVideo/fakeVideo.model");

//create user's favorite list (increment host like count)
exports.store = async (req, res, next) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details" });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! host id is required!" });
    if (!req.body.user_id)
      return res.status(200).json({
        status: false,
        message: "Oops ! favorite User id is required!",
      });

    const favoriteUserExist = await User.exists({
      _id: req.body.user_id,
    });

    if (!favoriteUserExist)
      return res.status(200).json({
        status: false,
        message: "Oops ! favorite user doesn't exist",
      });

    const hostExist = await Host.exists({ _id: req.body.host_id });

    if (!hostExist)
      return res.status(200).json({
        status: false,
        message: "Oops ! host doesn't exist",
      });

    const exist = await Favorite.find({
      user_id: req.body.user_id,
      host_id: req.body.host_id,
    });

    if (exist.length === 0) {
      const favorite = new Favorite();

      favorite.user_id = req.body.user_id;
      favorite.host_id = req.body.host_id;

      await Host.updateOne({ _id: req.body.host_id }, { $inc: { like: 1 } });

      await favorite.save((error, favorite) => {
        if (error)
          return res
            .status(200)
            .json({ status: false, error: error.message || "server error" });
        else
          return res.status(200).json({
            status: true,
            message: "favorite",
          });
      });
    } else {
      await Host.updateOne(
        { _id: req.body.host_id },
        { $inc: { like: -1 } }
      ).where({ like: { $gt: 0 } });
      await exist.map((data) => {
        data.deleteOne();
      });
      return res.status(200).json({
        status: true,
        message: "unfavorite",
      });
    }
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//get user favorite list of (host)
exports.getUserFavoriteList = async (req, res, next) => {
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

    const favoriteUser = await Favorite.find({
      user_id: req.query.user_id,
    })
      .populate("host_id")
      .skip(start)
      .limit(limit);

    let mainArr = [];

    for (var i = 0; i < favoriteUser.length; i++) {
      if (req.query.language === "ALL") {
        const language = await Language.findOne({
          _id: favoriteUser[i].host_id.language,
        });

        if (
          favoriteUser[i].host_id.isOnline === true &&
          favoriteUser[i].host_id.isDisable === false &&
          favoriteUser[i].host_id.isDeleted === false
        ) {
          const obj = {
            bio: favoriteUser[i].host_id.bio,
            image1: favoriteUser[i].host_id.image1,
            image2: favoriteUser[i].host_id.image2,
            isOnline: favoriteUser[i].host_id.isOnline,
            isBusy: favoriteUser[i].host_id.isBusy,
            like: favoriteUser[i].host_id.like,
            isDisable: favoriteUser[i].host_id.isDisable,
            coin: favoriteUser[i].host_id.coin,
            isLogout: favoriteUser[i].host_id.isLogout,
            isDeleted: favoriteUser[i].host_id.isDeleted,
            fromAPI: favoriteUser[i].host_id.fromAPI,
            video: favoriteUser[i].host_id.video,
            _id: favoriteUser[i].host_id._id,
            name: favoriteUser[i].host_id.name,
            language: language,
            age: favoriteUser[i].host_id.age,
            image: favoriteUser[i].host_id.image,
            createdAt: favoriteUser[i].host_id.createdAt,
            updatedAt: favoriteUser[i].host_id.updatedAt,
            __v: 0,
            isLike: true,
          };
          mainArr.push(obj);
        }
      }
      if (favoriteUser[i].host_id.language == req.query.language) {
        const language = await Language.findOne({
          _id: favoriteUser[i].host_id.language,
        });

        if (
          favoriteUser[i].host_id.isOnline === true &&
          favoriteUser[i].host_id.isDisable === false
        ) {
          const obj = {
            bio: favoriteUser[i].host_id.bio,
            image1: favoriteUser[i].host_id.image1,
            image2: favoriteUser[i].host_id.image2,
            isOnline: favoriteUser[i].host_id.isOnline,
            isBusy: favoriteUser[i].host_id.isBusy,
            like: favoriteUser[i].host_id.like,
            isDisable: favoriteUser[i].host_id.isDisable,
            coin: favoriteUser[i].host_id.coin,
            isLogout: favoriteUser[i].host_id.isLogout,
            isDeleted: favoriteUser[i].host_id.isDeleted,
            fromAPI: favoriteUser[i].host_id.fromAPI,
            video: favoriteUser[i].host_id.video,
            _id: favoriteUser[i].host_id._id,
            name: favoriteUser[i].host_id.name,
            language: language,
            age: favoriteUser[i].host_id.age,
            image: favoriteUser[i].host_id.image,
            createdAt: favoriteUser[i].host_id.createdAt,
            updatedAt: favoriteUser[i].host_id.updatedAt,
            __v: 0,
            isLike: true,
          };
          mainArr.push(obj);
        }
      }
    }

    var setObj = new Set(); // create key value pair from array of array

    var result = mainArr.reduce((acc, item) => {
      if (!setObj.has(item._id)) {
        setObj.add(item._id, item);
        acc.push(item);
      }
      return acc;
    }, []);

    arraySort(result, "isBusy");

    return res.status(200).json({
      status: true,
      message: "success",
      thumbList: result.slice(start, 10 + start),
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
