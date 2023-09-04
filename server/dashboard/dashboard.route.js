const express = require("express");
const router = express.Router();

const DashboardController = require("./dashboard.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

router.get("/", DashboardController.dashboard);

module.exports = router;
