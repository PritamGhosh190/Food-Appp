const mongoose = require('mongoose');
const User = require("./User");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },

  // Multi-select enums as arrays
  category: {
    type: [String],
    enum: ['Fine Dining', 'Café', 'Takeaway', 'Buffet', 'Fast Food'],
    required: true
  },

  type: {
    type: [String],
    enum: ['Veg', 'Non-Veg', 'Both'],
    required: true
  },

  cuisineType: {
    type: [String],
    enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Continental'],
    required: true
  },

  location: { type: String, required: true },

  assignUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
    unique: true
  }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
