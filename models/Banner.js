const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true }, // Store relative path
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for full image URL
bannerSchema.virtual('fullImageUrl').get(function () {
    const baseUrl = process.env.IMAGEURL || '';
    return `${baseUrl}${this.imageUrl}`;
});

// Automatically exclude inactive banners from find queries
function autoFilterActive(next) {
    this.where({ isActive: true });
    next();
}

bannerSchema.pre('find', autoFilterActive);
// bannerSchema.pre('findOne', autoFilterActive);
// bannerSchema.pre('findOneAndUpdate', autoFilterActive);
// bannerSchema.pre('count', autoFilterActive);
bannerSchema.pre('countDocuments', autoFilterActive);

module.exports = mongoose.model('Banner', bannerSchema);
