const { log } = require("console");
const Banner = require("../../models/Banner");
const path = require("path");

// Create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    // console.log("req.body", req.body, "hjbjvgjc", req.file);

    if (!title || !file) {
      return res.status(400).json({ message: "Title and image are required" });
    }

    // Use relative path
    const imageUrl = path
      .join("Upload/Banner", file.filename)
      .replace(/\\/g, "/");

    const banner = new Banner({ title, imageUrl });
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a Banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update isActive status of a banner
exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean" });
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/banner/all
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({
      isActive: { $in: [true, false] },
    }).sort({ createdAt: -1 });
    res.status(200).json(banners); // all banners
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
