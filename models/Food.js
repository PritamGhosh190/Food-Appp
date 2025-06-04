const mongoose = require('mongoose');
const Restaurant = require("./Restaurant");



const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Restaurant,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    set: v => Math.round(v * 10) / 10 // one decimal place
  },

  // Multiple enums (arrays of strings)
  category: {
    type: [String],
    required: true,
    enum: ['starter', 'main course', 'dessert', 'beverage', 'snack'],
    set: arr => arr.map(v => v.toLowerCase()),
    validate: {
      validator: arr => Array.isArray(arr) && arr.length > 0,
      message: 'At least one category is required'
    }
  },
  type: {
    type: [String],
    required: true,
    enum: ['veg', 'non-veg', 'vegan', 'jain', 'egg'],
    set: arr => arr.map(v => v.toLowerCase()),
    validate: {
      validator: arr => Array.isArray(arr) && arr.length > 0,
      message: 'At least one type is required'
    }
  },
  cuisineType: {
    type: [String],
    required: true,
    enum: ['indian', 'chinese', 'italian', 'mexican', 'thai', 'continental'],
    set: arr => arr.map(v => v.toLowerCase()),
    validate: {
      validator: arr => Array.isArray(arr) && arr.length > 0,
      message: 'At least one cuisine type is required'
    }
  },

  description: {
    type: String,
    default: ''
  },
  ingredients: {
    type: [String],
    default: [],
    validate: {
      validator: (val) => Array.isArray(val),
      message: 'Ingredients must be an array of strings.'
    }
  },
  available: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});



foodSchema.pre(/^find/, function (next) {
  this.where({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] });
  next();
});



const Food = mongoose.model('Food', foodSchema);

// Export the model to be used in other parts of the application
module.exports = Food;

// Define the food schema
// const foodSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   restaurant: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: Restaurant, // Reference to the Restaurant model
//     required: true 
//   },
//   image: { type: String, required: true }, // URL of the image (you can use multer for file upload)
//   distance: { type: Number},
//   price: { type: Number, required: true },
//   rating: { type: Number, required: true },
//   category: { type: String, required: true },
//   type: { type: String, required: true },
//   cuisineType: { type: String, required: true }
// });

// Create the Food model from the schema







// const mongoose = require('mongoose');
// const Restaurant = require('./Restaurant');




// Optional: Only return not deleted items by default in queries


// module.exports = mongoose.model('Food', foodSchema);



