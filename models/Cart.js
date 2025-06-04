const mongoose = require('mongoose');
const User = require("./User");
const Food = require("./Food");
const Restaurant = require("./Restaurant");

// Define the cart schema
const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: User,
    required: true 
  },
  food: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: Food,
    required: true 
  },
  quantity: { 
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['delivery','dineIn','takeaway'], // ✅ Define enum values here
    required: true,
    default: 'delivery'
  }
});

// Create and export the Cart model
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
