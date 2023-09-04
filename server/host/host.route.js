const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const HostController = require("./host.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//host list
router.get("/", HostController.hostList);

router.post("/Video", HostController.updateVideo);

//search host name for admin panel
router.get("/search", HostController.searchHostName);

//create host
router.post(
  "/",
  upload.fields([
    { name: "image" },
    { name: "image1" },
    { name: "image2" },
    { name: "video" },
  ]),
  HostController.hostStore
);

//edit host
router.patch(
  "/edit/:host_id",
  upload.fields([
    { name: "image" },
    { name: "image1" },
    { name: "image2" },
    { name: "video" },
  ]),
  HostController.hostEdit
);

//update coin through admin
router.patch("/:host_id", HostController.hostCoinUpdate);

//update likr
router.put("/like", HostController.like);

//delete host (temporary)
router.delete("/delete/:host_id", HostController.deleteHost);

//delete host
router.delete("/:host_id", HostController.hostDelete);

//host enable-disable
router.get("/enable_disable/:host_id", HostController.hostEnableDisable);

//host profile
router.get("/profile", HostController.hostProfileDetail);

//when host is enter the app call this route for is online true
router.get("/online", HostController.hostOnline);

//when host is exit the app call this route for is online false
router.get("/offline", HostController.hostOffline);

//live host thumb-list
router.get("/thumblist", HostController.globalThumbList);

//get single thumb
router.get("/single/thumblist", HostController.singleThumbList);

//board (coin wise host)
router.get("/board", HostController.board);

//random host (match)
router.get("/random", HostController.randomHost);

//top 10 host leaderBoard (currentWeek,lastWeek)
router.get("/top", HostController.topHost);

//check host is busy or not
router.get("/isbusy", HostController.isHostBusy);

module.exports = router;
