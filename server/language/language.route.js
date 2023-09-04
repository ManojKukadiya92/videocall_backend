const express = require("express");
const router = express.Router();

const LanguageController = require("./language.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//get language list
router.get("/", LanguageController.languageList);

//search language
router.get("/search", LanguageController.searchLanguage);

//store language name
router.post("/", LanguageController.store);

//update language
router.patch("/:language_id", LanguageController.languageUpdate);

//delete language
router.delete("/:language_id", LanguageController.languageDestroy);

module.exports = router;
