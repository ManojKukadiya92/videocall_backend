const Game = require("./game.model");
const fs = require("fs");
const axios = require("axios");
const Category = require("../category/category.modal");
const { serverPath } = require("../../config");

//get game list
exports.get = async (req, res) => {
  try {
    var game;
    if (req.query.category_id === "ALL") {
      game = await Game.find()
        .populate("category", { _id: 1, name: 1 })
        .sort({ createdAt: -1 });
    } else {
      game = await Game.find({ category: req.query.category_id })
        .populate("category", { _id: 1, name: 1 })
        .sort({ createdAt: -1 });
    }

    const randomGame = shuffle(game);

    return res
      .status(200)
      .json({ status: true, message: "Successful !!", game: randomGame });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Shuffle For getting random game response
const shuffle = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
};

//get top game
exports.getTopGame = async (req, res) => {
  try {
    const game = await Game.find({ isTop: true }).populate("category", {
      _id: 1,
      name: 1,
    });

    if (!game) {
      return res
        .status(200)
        .json({ status: false, message: "Game not Found !" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Successful !!", game });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//create game
exports.store = async (req, res) => {
  try {
    if (
      req.body &&
      req.body.description &&
      req.body.name &&
      req.body.ratting &&
      req.body.link &&
      req.body.category &&
      req.files
    ) {
      const game = new Game();
      game.thumbnail = serverPath + req.files.thumbnail[0].path;
      game.description = req.body.description;
      game.name = req.body.name;
      game.ratting = req.body.ratting;
      game.link = req.body.link;

      const gameArray = req.body.category.split(",");

      game.category = gameArray;
      game.logo = serverPath + req.files.logo[0].path;

      await game.save(async (error, game) => {
        if (error) {
          return res
            .status(500)
            .json({ status: false, error: error.message || "Server Error" });
        } else {
          const data = await Game.findById(game._id).populate("category", {
            _id: 1,
            name: 1,
          });

          return res.status(200).json({
            status: true,
            message: "Created Game Successful !!",
            game: data,
          });
        }
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update game
exports.update = async (req, res) => {
  try {
    const game = await Game.findById(req.query.game_id);

    if (!game) {
      return res
        .status(200)
        .json({ status: false, message: "Game not Found !" });
    }

    if (req.files.logo) {
      const game_ = game.logo.split("storage");
      if (game_) {
        if (fs.existsSync("storage" + game_[1])) {
          fs.unlinkSync("storage" + game_[1]);
        }
        game.logo = serverPath + req.files.logo[0].path;
      }
    }

    if (req.files.thumbnail) {
      const game_ = game.thumbnail.split("storage");
      if (game_) {
        if (fs.existsSync("storage" + game_[1])) {
          fs.unlinkSync("storage" + game_[1]);
        }
        game.thumbnail = serverPath + req.files.thumbnail[0].path;
      }
    }

    if (
      req.body &&
      req.body.description &&
      req.body.name &&
      req.body.ratting &&
      req.body.link &&
      req.body.category
    ) {
      game.description = req.body.description;
      game.ratting = req.body.ratting;
      game.link = req.body.link;
      game.name = req.body.name;
      const gameArray = req.body.category.split(",");

      game.category = gameArray;

      await game.save(async (error, game) => {
        if (error) {
          return res
            .status(500)
            .json({ status: false, error: error.message || "Server Error" });
        } else {
          const data = await Game.findById(game._id).populate("category", {
            _id: 1,
            name: 1,
          });

          return res.status(200).json({
            status: true,
            message: "Created Game Successful !!",
            game: data,
          });
        }
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//delete game
exports.destroy = async (req, res) => {
  try {
    const game = await Game.findById(req.query.game_id);

    if (!game) {
      return res
        .status(404)
        .json({ status: false, message: "game Does not Exists !" });
    }

    const game_ = game.logo.split("storage");
    if (game_) {
      if (fs.existsSync("storage" + game_[1])) {
        fs.unlinkSync("storage" + game_[1]);
      }
    }

    const game2_ = game.thumbnail.split("storage");
    if (game2_) {
      if (fs.existsSync("storage" + game2_[1])) {
        fs.unlinkSync("storage" + game2_[1]);
      }
    }

    await game.deleteOne();

    return res
      .status(200)
      .json({ status: true, message: "Delete Successful ✔" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//top game
exports.top = async (req, res) => {
  try {
    const game = await Game.findById(req.query.game_id);

    if (!game) {
      return res
        .status(404)
        .json({ status: false, message: "game Does not Exists !" });
    }

    game.isTop = !game.isTop;
    await game.save(async (error, game) => {
      if (error) {
        return res
          .status(500)
          .json({ status: false, error: error.message || "Server Error" });
      } else {
        const data = await Game.findById(game._id).populate("category", {
          _id: 1,
          name: 1,
        });

        return res.status(200).json({
          status: true,
          message: "Created Game Successful !!",
          game: data,
        });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//search in game
exports.search = async (req, res) => {
  try {
    const regex = new RegExp(req.body.search, "i");

    const game = await Game.find({ $or: [{ name: regex }] }).populate(
      "category",
      { _id: 1, name: 1 }
    );
    if (!game) {
      return res
        .status(404)
        .json({ status: false, message: "game Does not Exists !" });
    }

    return res.status(200).json({
      status: true,
      message: " Successful !!",
      game,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//game insert api
exports.insert = async (req, res) => {
  try {
    axios
      .get(`https://pub.gamezop.com/v3/games?id=loFaAXh0l`)
      .then(async (result) => {
        const data = result.data;
        data.games.map(async (game) => {
          const gameCategory = await Category.findOne({
            name: game.categories.en[0],
          });
          if (gameCategory.name === game.categories.en[0]) {
            const newGame = new Game();
            newGame.description = game.description.en;
            newGame.name = game.name.en;
            newGame.ratting = game.rating;
            newGame.link = game.url;
            newGame.category = gameCategory._id;
            newGame.thumbnail = game.assets.wall;
            newGame.logo = game.assets.square;
            newGame.save();
          }
        });

        return res
          .status(200)
          .json({ status: true, message: "Insert Games Successful ✔", data });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//category insert api
exports.insertCategory = async (req, res) => {
  try {
    const category = await Category.find().sort("name");
    var previousName;
    category.map((category) => {
      var name = category.name;
      if (name === previousName) {
        category.remove();
      }
      previousName = name;
    });

    return res.status(200).json({
      status: true,
      message: "Insert Games Successful ✔",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
