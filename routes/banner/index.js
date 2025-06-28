const express = require("express");
const router = express.Router();
const bannerController = require("../../Controllers/banner");
const upload = require("../../config/multerConfig");

// Create a new banner
router.post(
  "/addBanner",
  upload.single("image"),
  bannerController.createBanner
);

// Get all banners
router.get("/", bannerController.getBanners);

router.get("/getAll", bannerController.getAllBanners);

// Delete banner by ID
router.delete("/:id", bannerController.deleteBanner);

router.patch("/updateBanner/:id", bannerController.updateBannerStatus);

module.exports = router;
