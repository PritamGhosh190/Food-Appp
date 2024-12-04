const mongoose = require('mongoose');
const Restaurant = require("./Restaurant");


// Define the food schema
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: Restaurant, // Reference to the Restaurant model
    required: true 
  },
  image: { type: String, required: true }, // URL of the image (you can use multer for file upload)
  distance: { type: Number, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  cuisineType: { type: String, required: true }
});

// Create the Food model from the schema
const Food = mongoose.model('Food', foodSchema);

// Export the model to be used in other parts of the application
module.exports = Food;
