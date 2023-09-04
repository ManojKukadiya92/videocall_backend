const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const AdminController = require("./admin.controller");

const AdminMiddleware = require("../middleware/admin.Middleware");

router.get("/", AdminMiddleware, AdminController.getProfile);

router.post("/", AdminController.store);
router.post("/login", AdminController.login);
router.post("/sendemail", AdminController.forgotPassword);

router.put("/", AdminMiddleware, AdminController.uptPassword);

router.patch("/", AdminMiddleware, AdminController.update);
router.patch(
  "/updateImage",
  AdminMiddleware,
  upload.single("image"),
  AdminController.updateImage
);
router.post("/setpassword/:admin_id", AdminController.setPassword);

module.exports = router;
