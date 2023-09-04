const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = require("../../util/multer");

const upload = multer({
  storage,
});

const UserController = require("./user.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//user profile
router.get("/profile", UserController.userProfileDetail);

//Display list of all Users
router.get("/", UserController.userList);

//search user for admin panel
router.get("/search", UserController.searchUser);

//signup or store or login error
router.post("/signup", UserController.userSignup);

//for form login check user is exist or not
router.post("/existUser", UserController.existUser);

//check username exist or not
router.post("/check_username", UserController.checkUsername);

//update user
router.post("/edit_profile", upload.single("image"), UserController.userUpdate);

//user logout
router.post("/logout", UserController.userLogout);

//user block-unblock
router.get("/block/:user_id", UserController.userBlockUnblock);

//isfreecall or not
router.get("/freecall", UserController.isFreeCall);

//when user switch account from one device to another device change user identity
router.post("/switch", UserController.changeIdentity);

//update coin through admin
router.patch("/:user_id", UserController.userCoinUpdate);

// router.delete("/destroy", UserController.destroyUser);

module.exports = router;
