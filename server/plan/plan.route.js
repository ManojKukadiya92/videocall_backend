const express = require("express");
const router = express.Router();

const PlanController = require("./plan.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//get plan list
router.get("/", PlanController.planList);

//create plan
router.post("/", PlanController.store);

//update plan
router.patch("/:plan_id", PlanController.update);

//delete plan
router.delete("/:plan_id", PlanController.destroy);

module.exports = router;
