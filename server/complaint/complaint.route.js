const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const ComplaintController = require("./complaint.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//all complaint list
router.get("/list", ComplaintController.complaintList);

//store complaint
router.post(
  "/",
  upload.fields([{ name: "image" }, { name: "image1" }, { name: "image2" }]),
  ComplaintController.storeComplaint
);

//view ticket (show user complaint list of particular user)
router.get("/", ComplaintController.viewComplaint);

//complaint open or not
router.patch("/:complaint_id", ComplaintController.openComplaint);

//pending complain
router.get("/pending", ComplaintController.pendingComplain);

//solved complain
router.get("/solved", ComplaintController.solvedComplain);

//pending date list
router.get("/pending/date", ComplaintController.pendingDateList);

//solved date list
router.get("/solved/date", ComplaintController.solvedDateList);

module.exports = router;
