const Food = require("../../models/Food");
const Restaurant = require("../../models/Restaurant");
require('dotenv').config();  // Assuming the model is named 'Food.js'
const superagent = require('superagent');



// Assuming the 'uploads' folder is publicly accessible via URL

// console.log(process.env.IMAGEURL);


exports.createrestaurant = async (req, res) => {
  try {
    // Ensure the image is uploaded before creating the restaurant
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Check if lat/lng is provided
    if (req.body.lat && req.body.lng) {
      const newRestaurant = new restaurant({
        name: req.body.name,
        image: req.file.path,
        address: req.body.address,
        rating: req.body.rating,
        category: req.body.category,
        type: req.body.type,
        cuisineType: req.body.cuisineType,
        location: req.body.location,
        lat: req.body.lat,
        lng: req.body.lng,
        assignUser: req.body.assignedUser, // Map assignUser
      });

      const savedRestaurant = await newRestaurant.save();
      return res.status(201).json(savedRestaurant);
    }

    // If lat/lng is not provided, use address to fetch geolocation
    if (req.body.address) {
      const geoApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        req.body.address
      )}&key=${process.env.GOOGLEAPIKEY}`;

      const response = await superagent.get(geoApiUrl);

      if (response.status === 200) {
        const data = JSON.parse(response.text);
        const location = data.results?.[0]?.geometry?.location;

        if (location?.lat && location?.lng) {
          req.body.lat = location.lat;
          req.body.lng = location.lng;
        } else {
          return res.status(400).json({
            message: 'Invalid address. Please provide a proper address.',
          });
        }
      } else {
        return res.status(500).json({ message: 'Failed to fetch geolocation.' });
      }

      const newRestaurant = new Restaurant({
        name: req.body.name,
        image: req.file.path,
        address: req.body.address,
        rating: req.body.rating,
        category: req.body.category,
        type: req.body.type,
        cuisineType: req.body.cuisineType,
        location: req.body.location,
        lat: req.body.lat,
        lng: req.body.lng,
        assignUser: req.body.assignedUser, // Map assignUser
      });

      const savedRestaurant = await newRestaurant.save();
      return res.status(201).json(savedRestaurant);
    }

    return res.status(400).json({ message: 'Either lat/lng or address is required.' });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.assignUser) {
      // Handle unique constraint violation for assignUser
    // console.error('Error creating restaurant from here :', err);

      return res.status(203).json({ message: 'This user is already assigned to a restaurant.' });
    }

    console.error('Error creating restaurant:', err);
    return res.status(500).json({ message: 'Error creating restaurant', error: err.message });
  }
};

exports.getRestaurantAndFoods = async (req, res) => {
  // console.log("gghjjgjgjh",req.user.userId);
  
  try {
    // If an image is uploaded, we add it to the update
   const restaurant=await Restaurant.findOne({assignUser:req.user.userId});
   restaurant.image = process.env.IMAGEURL + restaurant.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
   if(restaurant)
   {
    const foods= await Food.find({restaurant:restaurant.id})
    if(foods)
    {
      const resultFood = foods.map(food => {
        // const updatedPath = filePath.replace(/\\+/g, '/'); 
        food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
        return foods;
      });
    }
    res.status(200).json({restaurant,foods});

   }

  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: 'Error updating restaurant', error: err });
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
    console.log("Error fetching restaurants:", err);
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};
