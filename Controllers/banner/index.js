const Banner = require('../../models/Banner');
const path = require('path');


// Create Banner
exports.createBanner = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file;

        if (!title || !file) {
            return res.status(400).json({ message: 'Title and image are required' });
        }

        // Use relative path
        const imageUrl = path.join('Upload/Banner', file.filename).replace(/\\/g, '/');

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
        if (!banner) return res.status(404).json({ message: 'Banner not found' });
        res.json({ message: 'Banner deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
