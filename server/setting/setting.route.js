const express = require("express");
const router = express.Router();

const SettingController = require("./setting.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//get all setting list
router.get("/", SettingController.settingList);

//store setting value
router.post("/", SettingController.store);

//update setting value
router.patch("/:setting_id", SettingController.update);

//Is under maintenance or not
router.patch("/maintenance/:setting_id", SettingController.isUnderMaintenance);

//Is WhatsApp support or not
router.patch("/whatsApp/:setting_id", SettingController.isWhatsAppSupport);

//Is UPI Active or not
router.patch("/upi/:setting_id", SettingController.isUPIActive);

//Is PayUMoney Active or not
router.patch("/payUMoney/:setting_id", SettingController.isPayUMoneyActive);

//Is google payId enable or not
router.patch("/googlePayId/:setting_id", SettingController.isGooglePayIdActive);

module.exports = router;
