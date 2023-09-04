const express = require("express");
const router = express.Router();

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

const HostCallHistoryController = require("./hostCallHistory.controller");

//when connect user and host store call history
router.post("/call/connect", HostCallHistoryController.callConnectHistory);

//when disconnect call
router.post("/call/disconnect", HostCallHistoryController.callDisconnect);

//add coin in host account after 30sec of video call
router.post("/add_coin", HostCallHistoryController.addCoin);

module.exports = router;
