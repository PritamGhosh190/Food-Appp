// models/Food.js
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  restaurant: { type: String, required: true },
  image: { type: String, required: true }, // URL of the image (you can use multer for file upload)
  distance: { type: Number, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  category: { type: String, required: true },
  type:{ type: String, required: true },
  cuisineType: { type: String, required: true }
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
