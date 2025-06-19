const Food = require("../../models/Food");
const Restaurant = require("../../models/Restaurant");
require('dotenv').config();  // Assuming the model is named 'Food.js'
const superagent = require('superagent');
const mongoose = require('mongoose');




// Assuming the 'uploads' folder is publicly accessible via URL

// console.log(process.env.IMAGEURL);


exports.createrestaurant = async (req, res) => {

  try {

    // Ensure the image is uploaded before creating the restaurant
    if (!req.file) {
      return res.status(205).json({ message: 'No image uploaded' });
    }
    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        return JSON.parse(field);
      } catch {
        // If not JSON parseable, treat as single value in array
        return [field];
      }
    };

    // Parse fields to arrays if necessary
    const categories = parseArrayField(req.body.category);
    const types = parseArrayField(req.body.type);
    const cuisineTypes = parseArrayField(req.body.cuisineType);


    // Check if lat/lng is provided
    if (req.body.lat && req.body.lng) {
      const newRestaurant = new restaurant({
        name: req.body.name,
        image: req.file.path,
        address: req.body.address,
        rating: req.body.rating,
        category: categories,
        type: types,
        cuisineType: cuisineTypes,
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
        // console.log("dbsddsdhj", data);

        const location = data.results?.[0]?.geometry?.location;

        if (location?.lat && location?.lng) {
          req.body.lat = location.lat;
          req.body.lng = location.lng;
        } else {
          return res.status(422).json({
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
        category: categories,
        type: types,
        cuisineType: cuisineTypes,
        location: req.body.location,
        lat: req.body.lat,
        lng: req.body.lng,
        assignUser: req.body.assignedUser, // Map assignUser
      });

      const savedRestaurant = await newRestaurant.save();
      return res.status(201).json(savedRestaurant);
    }

    return res.status(422).json({ message: 'Either lat/lng or address is required.' });
  } catch (err) {
    // console.log("hbhdhdhd", err);

    if (err.code === 11000 && err.keyPattern?.assignUser) {
      // Handle unique constraint violation for assignUser
      // console.error('Error creating restaurant from here :', err);

      return res.status(209).json({ message: 'This user is already assigned to a restaurant.' });
    }

    console.error('Error creating restaurant:', err);
    return res.status(500).json({ message: 'Error creating restaurant', error: err.message });
  }
};

exports.getRestaurantAndFoods = async (req, res) => {

  try {
    // If an image is uploaded, we add it to the update
    const restaurant = await Restaurant.findOne({ assignUser: new mongoose.Types.ObjectId(req.user.userId) });
    restaurant.image = process.env.IMAGEURL + restaurant.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
    if (restaurant) {
      const foods = await Food.find({ restaurant: new mongoose.Types.ObjectId(restaurant.id) })
      // console.log("gghjjgjgjh",foods);
      if (foods) {
        const resultFood = foods.map(food => {
          // const updatedPath = filePath.replace(/\\+/g, '/'); 
          food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
          return foods;
        });
      }
      res.status(200).json({ restaurant, foods });

    }

  } catch (err) {
    console.log(err);

    res.status(500).json({ message: 'Error updating restaurant', error: err });
  }
};





exports.updaterestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        return JSON.parse(field);
      } catch {
        // If not JSON parseable, treat as single value in array
        return [field];
      }
    };

    // Parse fields to arrays if necessary
    const categories = req.body.category ? parseArrayField(req.body.category) : undefined;
    const types = req.body.type ? parseArrayField(req.body.type) : undefined;
    const cuisineTypes = req.body.cuisineType ? parseArrayField(req.body.cuisineType) : undefined;


    // Find the existing restaurant first
    const existingRestaurant = await Restaurant.findById(restaurantId);
    if (!existingRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update image if new file is uploaded
    if (req.file) {
      req.body.image = req.file.path;
    }

    // If lat/lng are provided, no need to fetch from address
    if (req.body.lat && req.body.lng) {
      // continue as normal
    } else if (req.body.address) {
      // Get lat/lng from address
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
    }

    // Prepare update payload
    const updateData = {
      name: req.body.name || existingRestaurant.name,
      image: req.body.image || existingRestaurant.image,
      address: req.body.address || existingRestaurant.address,
      rating: req.body.rating || existingRestaurant.rating,
      category: categories !== undefined ? categories : existingRestaurant.category,
      type: types !== undefined ? types : existingRestaurant.type,
      cuisineType: cuisineTypes !== undefined ? cuisineTypes : existingRestaurant.cuisineType,
      location: req.body.location || existingRestaurant.location,
      lat: req.body.lat || existingRestaurant.lat,
      lng: req.body.lng || existingRestaurant.lng,
      assignUser: req.body.assignedUser || existingRestaurant.assignUser,
    };

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedRestaurant);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ message: 'Error updating restaurant', error: err.message });
  }
};

exports.getAllRestaurants1 = async (req, res) => {
  try {
    // console.log(req.user, "User Details");

    // Define the query condition based on user type
    let query = {};
    if (req.user.role === 'seller') {
      // console.log(req.user, "User Details2222222");

      query.assignUser = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId
    }

    // Fetch restaurants based on the query
    const restaurants = await Restaurant.find(query).populate('assignUser');

    // Add the base URL to the image path
    const baseUrl = process.env.IMAGEURL; // Use environment variable for base URL

    const restaurantsWithImages = restaurants.map(restaurant => {
      restaurant.image = baseUrl + restaurant.image.replace(/\\+/g, '/');
      return restaurant;
    });

    // console.log("hxhsjhdd", restaurantsWithImages);

    res.status(200).json(restaurantsWithImages);
  } catch (err) {
    console.log("Error fetching restaurants:", err);
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;
    const baseUrl = process.env.IMAGEURL;
    const radius = 50;
    let query = {};

    if (role === 'seller') {
      // Seller: Only assigned restaurant
      query.assignUser = new mongoose.Types.ObjectId(userId);

    } else if (role === 'user') {
      // User: Filter by geolocation within a given radius
      const { lat, lng } = req.query;
      // console.log("ddsssssssssss", req.query);

      if (!lat || !lng || !radius) {
        return res.status(400).json({
          message: 'Latitude, Longitude, and Radius are required for users.',
          status: false
        });
      }

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const distanceInMeters = parseFloat(radius) * 1000; // convert km to meters

      query.locationCoordinates = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat]
          },
          $maxDistance: distanceInMeters
        }
      };
    }

    // Fetch from DB
    const restaurants = await Restaurant.find(query).populate('assignUser');

    // Format image URLs
    const formatted = restaurants.map(r => {
      r.image = baseUrl + r.image.replace(/\\+/g, '/');
      return r;
    });

    console.log("jbhhjbhjvvvvvvvvvvvvv",formatted);
    
    return res.status(200).json(formatted);

  } catch (err) {
    console.error("Error fetching restaurants:", err);
    return res.status(500).json({
      message: 'Error fetching restaurants',
      error: err.message
    });
  }
};
