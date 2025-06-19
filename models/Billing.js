const mongoose = require("mongoose");
const User = require("./User");
const Food = require("./Food");
const Restaurant = require("./Restaurant");
const Address = require("./Address");
const Coupon = require("./Coupon");

const foodDetailSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: Food },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const foodBillingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Restaurant,
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Address,
      required: true,
    },
    foodDetails: [foodDetailSchema],
    totalAmount: { type: Number, required: true },
    discount: { type: Number },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: Coupon },
    couponCode: { type: String },
    grossAmount: { type: Number, required: true },

    type: {
      type: String,
      enum: ["delivery", "dineIn", "takeaway"],
      required: true,
    },

    deliveryCharges: {
      type: Number,
      validate: {
        validator: function (v) {
          if (this.type === "delivery") return v !== null && v !== undefined;
          return true; // For dineIn/takeaway, allow null or undefined
        },
        message: "Delivery charges are required for delivery type",
      },
    },

    convenienceCharges: { type: Number, required: true },
    otherCharges: { type: Number, required: true },
    CGST: { type: Number, required: true },
    SGST: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["Ordered", "Accepted", "Out of Delivery", "Delivered"],
      default: "Pending",
    },
    deliveryTime: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoodBilling", foodBillingSchema);
