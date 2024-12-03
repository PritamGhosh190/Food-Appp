// controllers/foodController.js
const Food = require('../../models/Food');
const Restaurant = require("../../models/Restaurant")
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
    const foods = await Food.aggregate([
      {
        $lookup: {
          from: "restaurants",  // The collection name containing restaurant data
          localField: "restaurant",  // The field in the foods collection that holds the restaurant ID
          foreignField: "_id",  // The field in the restaurants collection that contains the restaurant's _id
          as: "restaurant_info"  // The field name where the matched restaurant data will be stored
        }
      },
      {
        $unwind: "$restaurant_info"  // Flatten the restaurant_info array to get access to restaurant data
      },
      {
        $addFields: {
          restaurant: {  // Create a new field 'restaurant' that contains both the name and the _id of the restaurant
            name: "$restaurant_info.name",
            id: "$restaurant_info._id"
          }
        }
      },
      {
        $project: {
          "restaurant_info": 0  // Remove the extra restaurant_info field from the output
        }
      }
    ]);
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


//Filter by parameter

exports.filterFood= async (req, res) => {
  try {
    // Get the filter values from the body of the request
    const { name, type, cuisineType, restaurantName } = req.body;

    // Build the query object for the filter
    let filter = {};

    if (name) filter.name = new RegExp(name, 'i'); // Case-insensitive match
    if (type) filter.type = type;
    if (cuisineType) filter.cuisineType = cuisineType;

    // If restaurantName is provided, find the restaurant and add its ID to the filter
    if (restaurantName) {
      const restaurant = await Restaurant.findOne({ name: new RegExp(restaurantName, 'i') });
      if (restaurant) {
        filter.restaurant = restaurant._id;
      } else {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
    }

    // Testing

    // Query the Food collection with the filter
    const foods = await Food.find(filter).populate('restaurant'); // Populate restaurant details if needed

    res.json({ foods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
