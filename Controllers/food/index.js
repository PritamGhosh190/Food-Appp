// controllers/foodController.js
const Food = require('../../models/Food');
require('dotenv').config(); 
// Create a new food detail
exports.createFood = async (req, res) => {
  try {
    // console.log("hiiiii",req.body);
    
    const { name, restaurant, distance, price, rating, category, type,cuisineType } = req.body;
    const image = req.file.path; // Get image path from multer

    const newFood = new Food({
      name,
      image,
      restaurant,
      distance,
      price,
      rating,
      category,
      type,
      cuisineType
    });

    await newFood.save();
    res.status(201).json({ message: 'Food detail created successfully', food: newFood });
  } catch (error) {
    // console.log("errror",error);
    
    res.status(400).json({ message: 'Error creating food detail', error: error.message });
  }
};

// Get all food details with optional filters
exports.getAllFoods = async (req, res) => {
  try {
    // Get query parameters
    const { name, restaurant, cuisineType, category,type } = req.query;

    // Build the filter object
    let filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search for name
    if (type) filter.name = { $regex: type, $options: 'i' }; // Case-insensitive search for name
    if (restaurant) filter.restaurant = { $regex: restaurant, $options: 'i' }; // Case-insensitive search for restaurant
    if (cuisineType) filter.cuisineType = { $regex: cuisineType, $options: 'i' }; // Case-insensitive search for cuisineType
    if (category) filter.category = { $regex: category, $options: 'i' }; // Case-insensitive search for category

    // Query the database with the filter object
    const foods = await Food.find(filter);
    const resultFood=foods.map(food => {
      // const updatedPath = filePath.replace(/\\+/g, '/'); 
      food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
      return restaurant;
    });

    if (foods.length === 0) {
      return res.status(404).json({ message: 'No food details found matching the filters' });
    }

    res.status(200).json(foods);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching food details', error: error.message });
  }
};

// Get a specific food detail by ID
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json(food);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching food detail', error: error.message });
  }
};

// Update food details by ID
exports.updateFood = async (req, res) => {
  try {
    const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json({ message: 'Food detail updated successfully', food: updatedFood });
  } catch (error) {
    res.status(400).json({ message: 'Error updating food detail', error: error.message });
  }
};

// Delete food by ID
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting food detail', error: error.message });
  }
};
