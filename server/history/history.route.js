const express = require("express");
const router = express.Router();

const HistoryController = require("./history.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

//store history and less coin for host charge from user Account (which is set by admin)
router.post("/coin/less", HistoryController.lessCoinHostCharge);

//store history when purchase coin (add coin)
router.post("/coin/purchase", HistoryController.purchaseCoinTransaction);

//recharge history
router.get("/recharge/history", HistoryController.getRechargeHistory);

//coin outgoing history
router.get("/coin/outgoing", HistoryController.getCoinOutgoingHistory);

module.exports = router;
