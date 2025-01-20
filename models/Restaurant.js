// models/Food.js
const mongoose = require('mongoose');
const User = require("./User");


const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // URL of the image (you can use multer for file upload)
  address: { type: String, required: true },
  rating: { type: Number, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  category: { type: String, required: true },
  type:{ type: String, required: true },
  cuisineType: { type: String, required: true },
  location: { type: String, required: true },
  assignUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: User, // Reference to the User model
      required: true 
    },
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
