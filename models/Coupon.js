// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  discountType: { type: String, enum: ['flat', 'percentage'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 }, // For "above 999" type
  usageLimit: { type: Number, default: 1 }, // How many times user can use it
  orderNumberCondition: { type: Number }, // e.g., 1 for first order, 3 for third
  expiry: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

 const Coupon= mongoose.model('Coupon', couponSchema);
 module.exports= Coupon;