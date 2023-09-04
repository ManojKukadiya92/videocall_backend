//Express
const express = require("express");
const route = express.Router();

//authentication access
const checkAccessWithSecretKey = require("../../checkAccess");
// route.use(checkAccessWithSecretKey()());

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

//controller
const GameController = require("./game.controller");

//route
//get game
route.get("/", checkAccessWithSecretKey(), GameController.get);
//get top game
route.get("/topGame", checkAccessWithSecretKey(), GameController.getTopGame);

//create game
route.post(
  "/create",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),

  GameController.store
);
//update game
route.patch(
  "/update",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  GameController.update
);

//delete game
route.delete("/delete", checkAccessWithSecretKey(), GameController.destroy);

//isTop
route.put("/top", checkAccessWithSecretKey(), GameController.top);
//search
route.post("/search", checkAccessWithSecretKey(), GameController.search);

//insert game
route.post('/insert', checkAccessWithSecretKey(), GameController.insert);
route.post('/insertCategory', checkAccessWithSecretKey(), GameController.insertCategory);

module.exports = route;
