//Express
const express = require("express");
const route = express.Router();

//Multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

//Dev and Security Key
const checkAccessWithSecretKey = require("../../checkAccess");

//Controller
const CategoryController = require("./category.controller");

//Get
route.get("/", checkAccessWithSecretKey(), CategoryController.get);

//Store Category
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), CategoryController.storeCategory);

//Update Category
route.patch(
  "/update", checkAccessWithSecretKey(),
  upload.single("image"),
  CategoryController.updateCategory
);

//Delete Category
route.delete(`/delete`, checkAccessWithSecretKey(), CategoryController.destroyCategory);

module.exports = route;
