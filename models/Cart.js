const { required } = require('joi');
const mongoose = require('mongoose');
const User = require("./User");
const Food = require("./Food");
const Restaurant = require("./Restaurant");

// Define the food schema
const cartSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: User, // Reference to the User model
        required: true 
      },
  food: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: Food, // Reference to the Restaurant model
    required: true 
  },
  quantity:{ 
    type:Number,
    required:true
  }
 
});

// Create the Food model from the schema
const Cart = mongoose.model('Cart', cartSchema

);

// Export the model to be used in other parts of the application
module.exports = Cart;
