const restaurant = require("../../models/Restaurant ");
require('dotenv').config();  // Assuming the model is named 'Food.js'

// Assuming the 'uploads' folder is publicly accessible via URL

// console.log(process.env.IMAGEURL);

exports.createrestaurant = async (req, res) => {
  try {
    // Ensure the image is uploaded before creating the restaurant
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Create new restaurant object, including the image URL (relative to public path)
    const newrestaurant = new restaurant({
      name: req.body.name,
      image: req.file.path,  // Save the relative path to the image
      address: req.body.address,
      rating: req.body.rating,
      category: req.body.category,
      type: req.body.type,
      cuisineType: req.body.cuisineType,
      location: req.body.location,
    });

    // Save the new restaurant to the database
    const savedrestaurant = await newrestaurant.save();
    res.status(201).json(savedrestaurant);
  } catch (err) {
    // console.log("error",err);
    
    res.status(500).json({ message: 'Error creating restaurant', error: err });
  }
};

exports.updaterestaurant = async (req, res) => {
  try {
    // If an image is uploaded, we add it to the update
    if (req.file) {
      req.body.image = req.file.path; // Update with new image path
    }

    const updatedrestaurant = await restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedrestaurant) {
      return res.status(404).json({ message: 'restaurant not found' });
    }

    res.status(200).json(updatedrestaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error updating restaurant', error: err });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    // Fetch all restaurants from the database
    const restaurants = await restaurant.find();

    // Define the base URL for the images (local IP address and port)
    const baseUrl = 'http://192.168.0.201:3006/';

    // Add the base URL to the image path for each restaurant
    const restaurantsWithImages = restaurants.map(restaurant => {
      // const updatedPath = filePath.replace(/\\+/g, '/'); 
      restaurant.image = process.env.IMAGEURL + restaurant.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
      return restaurant;
    });

    // Return the updated restaurant data with full image URLs
    res.status(200).json(restaurantsWithImages);
  } catch (err) {
    // console.log("Error fetching restaurants:", err);
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

