const mongoose = require('mongoose');
const User = require("./User");
const Food = require("./Food");
const Restaurant = require("./Restaurant");

const foodDetailSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: Food },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const foodBillingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: Restaurant, required: true },
    foodDetails: [foodDetailSchema],
    totalAmount: { type: Number, required: true },
    grossAmount: { type: Number, required: true },
    deliveryCharges: { type: Number, required: true },
    convenienceCharges: { type: Number, required: true },
    otherCharges: { type: Number, required: true },
    CGST: { type: Number, required: true },
    SGST: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('FoodBilling', foodBillingSchema);
