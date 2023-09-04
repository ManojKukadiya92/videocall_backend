const express = require("express");
const router = express.Router();

const AdvertisementController = require("./advertisement.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//for android and backend
router.get("/", AdvertisementController.googleFacebookAd);

//create advertisement
router.post("/", AdvertisementController.storeGoogleFb);

//enable & disable advertisement
router.patch("/:ad_id", AdvertisementController.showToggle);

//update advertisement
router.patch("/googleFb/:ad_id", AdvertisementController.uptGoogleFb);

module.exports = router;
