const Language = require("./language.model");
const Host = require("../host/host.model");

//language list
exports.languageList = async (req, res, next) => {
  try {
    const total = await Language.find().countDocuments();
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : total;

    const language_ = await Language.find()
      .sort({ createdAt: -1 })
      .skip((start - 1) * limit)
      .limit(limit);

    if (!language_) {
      return res
        .status(200)
        .send({ status: false, error: "Internal server error" });
    }

    let language = [];
    for (var i = 0; i < language_.length; i++) {
      const count = await Host.find({
        language: language_[i]._id,
      })
        .where({ isDeleted: false })
        .countDocuments();

      language.push({
        _id: language_[i]._id,
        language: language_[i].language,
        count: count || 0,
        createdAt: language_[i].createdAt,
        updatedAt: language_[i].updatedAt,
      });
    }

    return res
      .status(200)
      .json({ status: true, message: "success", language, total });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ status: error });
  }
};

//store language
exports.store = async (req, res, next) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details" });
    if (!req.body.language)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! language is required!" });

    const language = new Language();

    language.language = req.body.language.toUpperCase();

    await language.save((error, language) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res
          .status(200)
          .json({ status: true, message: "success", language });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//update language
exports.languageUpdate = async (req, res, next) => {
  try {
    const language = await Language.findById(req.params.language_id);

    if (!language) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! language not found" });
    }

    const languageData = {
      language: req.body.language.toUpperCase(),
    };

    await Language.updateOne(
      { _id: req.params.language_id },
      { $set: languageData }
    ).exec(async (errorUpdate) => {
      if (errorUpdate)
        return res.status(200).json({ status: false, errorUpdate });
      const language = await Language.findOne({ _id: req.params.language_id });
      return res.status(200).send({
        status: true,
        message: "Language  update successfully",
        language,
      });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//delete language
exports.languageDestroy = async (req, res) => {
  try {
    const language = await Language.findById(req.params.language_id);

    if (!language) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! language not found" });
    }

    await language.deleteOne();

    await Host.updateMany(
      { language: req.params.language_id },
      { $set: { isDisable: true } }
    ).exec(async (errorUpdate) => {
      if (errorUpdate)
        return res.status(200).json({ status: false, errorUpdate });
    });

    return res
      .status(200)
      .json({ status: true, message: "language Delete success", result: true });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//search language for admin panel
exports.searchLanguage = async (req, res, next) => {
  try {
    if (req.query.value) {
      const start = req.query.start ? parseInt(req.query.start) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 25;

      const language_ = await Language.find({
        language: { $regex: req.query.value, $options: "i" },
      })

        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit);

      if (!language_) {
        return res
          .status(200)
          .send({ status: false, error: "Internal server error" });
      }
      let language = [];
      for (var i = 0; i < language_.length; i++) {
        const count = await Host.find({
          language: language_[i]._id,
        })
          .where({ isDeleted: false })
          .countDocuments();

        language.push({
          _id: language_[i]._id,
          language: language_[i].language,
          count: count || 0,
          createdAt: language_[i].createdAt,
          updatedAt: language_[i].updatedAt,
        });
      }

      return res
        .status(200)
        .json({ status: true, language, total: language.length });
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
