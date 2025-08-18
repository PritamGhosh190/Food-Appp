const Food = require("../../models/Food");
const Restaurant = require("../../models/Restaurant");
require("dotenv").config(); // Assuming the model is named 'Food.js'
const superagent = require("superagent");
const mongoose = require("mongoose");

// Assuming the 'uploads' folder is publicly accessible via URL

// console.log(process.env.IMAGEURL);

exports.createrestaurant = async (req, res) => {
  try {
    // Ensure the image is uploaded before creating the restaurant
    if (!req.file) {
      return res.status(205).json({ message: "No image uploaded" });
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
            message: "Invalid address. Please provide a proper address.",
          });
        }
      } else {
        return res
          .status(500)
          .json({ message: "Failed to fetch geolocation." });
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

    return res
      .status(422)
      .json({ message: "Either lat/lng or address is required." });
  } catch (err) {
    // console.log("hbhdhdhd", err);

    if (err.code === 11000 && err.keyPattern?.assignUser) {
      // Handle unique constraint violation for assignUser
      // console.error('Error creating restaurant from here :', err);

      return res
        .status(209)
        .json({ message: "This user is already assigned to a restaurant." });
    }

    console.error("Error creating restaurant:", err);
    return res
      .status(500)
      .json({ message: "Error creating restaurant", error: err.message });
  }
};

exports.getRestaurantAndFoods = async (req, res) => {
  try {
    console.log("hghghg");

    // If an image is uploaded, we add it to the update
    const restaurant = await Restaurant.findOne({
      assignUser: new mongoose.Types.ObjectId(req.user.userId),
    });
    restaurant.image =
      process.env.IMAGEURL + restaurant.image.replace(/\\+/g, "/"); // Prepend the base URL to the image path
    if (restaurant) {
      const foods = await Food.find({
        restaurant: new mongoose.Types.ObjectId(restaurant.id),
      });
      console.log("gghjjgjgjh", foods.length);
      if (foods) {
        const resultFood = foods.map((food) => {
          // const updatedPath = filePath.replace(/\\+/g, '/');
          food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, "/"); // Prepend the base URL to the image path
          return foods;
        });
      }
      res.status(200).json({ restaurant, foods });
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error updating restaurant", error: err });
  }
};

exports.updaterestaurant = async (req, res) => {
  console.log("Updating restaurant with body:", req.body);

  try {
    const restaurantId = req.params.id;

    const parseArrayField = (field) => {
      if (field === undefined || field === null) return undefined;
      if (Array.isArray(field)) return field;
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [field];
      }
    };

    const parseBool = (val) => {
      if (val === undefined) return undefined;
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const lower = val.toLowerCase();
        if (lower === "true") return true;
        if (lower === "false") return false;
      }
      return Boolean(val);
    };

    const isValidObjectId = (id) => {
      // Accept only 24 hex char strings; tweak if using mongoose.isValidObjectId
      return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
    };

    // Parse complex fields
    const categories = parseArrayField(req.body.category);
    const types = parseArrayField(req.body.type);
    const cuisineTypes = parseArrayField(req.body.cuisineType);

    // Parse booleans
    const isActive = parseBool(req.body.isActive);
    const isDelivery = parseBool(req.body.isDelivery);
    const isTakeaway = parseBool(req.body.isTakeaway);
    const isDineIn = parseBool(req.body.isDineIn);

    // Find existing
    const existingRestaurant = await Restaurant.findById(restaurantId);
    if (!existingRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Handle image
    if (req.file) {
      req.body.image = req.file.path;
    }

    // Geocoding if needed
    if (req.body.lat && req.body.lng) {
      // use provided
    } else if (req.body.address) {
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
            message: "Invalid address. Please provide a proper address.",
          });
        }
      } else {
        return res
          .status(500)
          .json({ message: "Failed to fetch geolocation." });
      }
    }

    // Build update payload, preserving existing values when undefined
    const updateData = {
      name: req.body.name ?? existingRestaurant.name,
      image: req.body.image ?? existingRestaurant.image,
      address: req.body.address ?? existingRestaurant.address,
      rating:
        req.body.rating !== undefined
          ? Number(req.body.rating)
          : existingRestaurant.rating,
      category:
        categories !== undefined ? categories : existingRestaurant.category,
      type: types !== undefined ? types : existingRestaurant.type,
      cuisineType:
        cuisineTypes !== undefined
          ? cuisineTypes
          : existingRestaurant.cuisineType,
      location: req.body.location ?? existingRestaurant.location,
      lat:
        req.body.lat !== undefined
          ? Number(req.body.lat)
          : existingRestaurant.lat,
      lng:
        req.body.lng !== undefined
          ? Number(req.body.lng)
          : existingRestaurant.lng,
      // Booleans
      isActive: isActive !== undefined ? isActive : existingRestaurant.isActive,
      isDelivery:
        isDelivery !== undefined ? isDelivery : existingRestaurant.isDelivery,
      isTakeaway:
        isTakeaway !== undefined ? isTakeaway : existingRestaurant.isTakeaway,
      isDineIn: isDineIn !== undefined ? isDineIn : existingRestaurant.isDineIn,
    };

    // Handle assignUser safely:
    // - Ignore empty string or null/undefined
    // - Only set when a valid ObjectId is provided
    // If you want to allow clearing, send a dedicated flag like clearAssignedUser=true
    const { assignedUser, clearAssignedUser } = req.body;

    if (clearAssignedUser === "true" || clearAssignedUser === true) {
      updateData.assignUser = undefined;
      // If the field exists and you want to unset it: use $unset below instead of setting undefined.
    } else if (isValidObjectId(assignedUser)) {
      updateData.assignUser = assignedUser;
    } else {
      // keep existing if invalid/empty was sent
      updateData.assignUser = existingRestaurant.assignUser;
    }

    // If you need to truly remove assignUser when clearing:
    // Use findByIdAndUpdate with $unset when clearAssignedUser is true
    let updatedRestaurant;
    if (clearAssignedUser === "true" || clearAssignedUser === true) {
      const { assignUser, ...rest } = updateData;
      updatedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        { $unset: { assignUser: "" }, $set: rest },
        { new: true }
      );
    } else {
      updatedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        updateData,
        { new: true }
      );
    }

    return res.status(200).json(updatedRestaurant);
  } catch (err) {
    console.error("Error updating restaurant:", err);
    return res
      .status(500)
      .json({ message: "Error updating restaurant", error: err.message });
  }
};

exports.getAllRestaurants1 = async (req, res) => {
  try {
    console.log(req.user, "User Details");

    // Define the query condition based on user type
    let query = {};
    if (req.user.role === "seller") {
      // console.log(req.user, "User Details2222222");

      query.assignUser = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId
    }

    // Fetch restaurants based on the query
    const restaurants = await Restaurant.find(query).populate("assignUser");

    // Add the base URL to the image path
    const baseUrl = process.env.IMAGEURL; // Use environment variable for base URL

    const restaurantsWithImages = restaurants.map((restaurant) => {
      restaurant.image = baseUrl + restaurant.image.replace(/\\+/g, "/");
      return restaurant;
    });

    // console.log("hxhsjhdd", restaurantsWithImages);

    res.status(200).json(restaurantsWithImages);
  } catch (err) {
    console.log("Error fetching restaurants:", err);
    res
      .status(500)
      .json({ message: "Error fetching restaurants", error: err.message });
  }
};

exports.getAllRestaurants2 = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;
    const baseUrl = process.env.IMAGEURL;
    const radius = 50;
    let query = {};

    if (role === "seller") {
      // Seller: Only assigned restaurant
      query.assignUser = new mongoose.Types.ObjectId(userId);
    } else if (role === "user") {
      // User: Filter by geolocation within a given radius
      const { lat, lng } = req.query;
      // console.log("ddsssssssssss", req.query);

      if (!lat || !lng || !radius) {
        return res.status(400).json({
          message: "Latitude, Longitude, and Radius are required for users.",
          status: false,
        });
      }

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const distanceInMeters = parseFloat(radius) * 1000; // convert km to meters

      query.locationCoordinates = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          $maxDistance: distanceInMeters,
        },
      };
    }

    // Fetch from DB
    const restaurants = await Restaurant.find(query).populate("assignUser");

    // Format image URLs
    const formatted = restaurants.map((r) => {
      r.image = baseUrl + r.image.replace(/\\+/g, "/");
      return r;
    });

    console.log("jbhhjbhjvvvvvvvvvvvvv", formatted);

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    return res.status(500).json({
      message: "Error fetching restaurants",
      error: err.message,
    });
  }
};
exports.getAllRestaurants = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;
    const baseUrl = process.env.IMAGEURL;
    // console.log("role");
    // console.log("userId", userId);
    // console.log("baseUrl", baseUrl);

    if (role === "seller") {
      // Seller: Only assigned restaurant
      const restaurants = await Restaurant.find({
        assignUser: new mongoose.Types.ObjectId(userId),
      }).populate("assignUser");

      const formatted = restaurants.map((r) => {
        r.image = baseUrl + r.image.replace(/\\+/g, "/");
        return r;
      });

      return res.status(200).json(formatted);
    }

    // User: Get only nearest restaurant
    if (role === "user") {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          message: "Latitude and Longitude are required for users.",
          status: false,
        });
      }

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      const nearestRestaurant = await Restaurant.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [userLng, userLat],
            },
            distanceField: "distance",
            spherical: true,
          },
        },
        { $limit: 1 },
        {
          $lookup: {
            from: "users",
            localField: "assignUser",
            foreignField: "_id",
            as: "assignUser",
          },
        },
        {
          $unwind: {
            path: "$assignUser",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      // Format image
      const formatted = nearestRestaurant.map((r) => {
        if (r.image) {
          r.image = baseUrl + r.image.replace(/\\+/g, "/");
        }
        return r;
      });

      return res.status(200).json(formatted);
    }
    if (role === "admin") {
      // Admin: Get all restaurants
      const restaurants = await Restaurant.find().populate("assignUser");

      const formatted = restaurants.map((r) => {
        r.image = baseUrl + r.image.replace(/\\+/g, "/");
        return r;
      });

      return res.status(200).json(formatted);
    }

    // Fallback for unrecognized role
    return res.status(403).json({
      message: "Unauthorized role",
    });
  } catch (err) {
    console.error("Error fetching nearest restaurant:", err);
    return res.status(500).json({
      message: "Error fetching nearest restaurant",
      error: err.message,
    });
  }
};

exports.restaurantList = async (req, res) => {
  try {
    const restaurantList = await Restaurant.find(); // Fetch all documents
    res.status(200).json({ success: true, data: restaurantList });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
