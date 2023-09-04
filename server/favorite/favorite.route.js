const express = require("express");
const router = express.Router();

const FavoriteController = require("./favorite.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//create user's favorite list
router.post("/", FavoriteController.store);

//get user's favorite list
router.get("/", FavoriteController.getUserFavoriteList);

module.exports = router;
