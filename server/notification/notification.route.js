const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

const NotificationController = require("./notification.controller");

//send notification
router.post("/", upload.single("image"), NotificationController.send);

module.exports = router;
