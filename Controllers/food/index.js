// controllers/foodController.js
const Food = require('../../models/Food');
const Restaurant = require("../../models/Restaurant")
const Cart = require("../../models/Cart")
const User = require("../../models/User")
require('dotenv').config();
const Joi = require('joi')
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');


// console.log("imageurl=======>>>", process.env.IMAGEURL);

// Create a new food detai

exports.createFood = async (req, res) => {
  try {
    const {
      name,
      restaurant,
      price,
      rating,
      description = '',
      available = true,
      stock = 0
    } = req.body;

    // Parse fields that might be strings or arrays
    const parseArray = (field) => {
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          return [field]; // fallback: single string to array
        }
      }
      return Array.isArray(field) ? field : [field];
    };

    const category = parseArray(req.body.category);
    const type = parseArray(req.body.type);
    const cuisineType = parseArray(req.body.cuisineType);
    const ingredients = parseArray(req.body.ingredients ?? []);

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const image = req.file.path;

    const newFood = new Food({
      name,
      restaurant,
      image,
      price,
      rating,
      category,
      type,
      cuisineType,
      description,
      ingredients,
      available,
      stock
    });

    await newFood.save();

    return res.status(201).json({
      message: 'Food detail created successfully',
      food: newFood
    });

  } catch (error) {
    console.error('Error creating food detail:', error);
    return res.status(400).json({
      message: 'Error creating food detail',
      error: error.message
    });
  }
};



// Get all food details with optional filters
exports.getAllFoods = async (req, res) => {
  try {
    const {
      name,
      cuisineType,
      category,
      type,
      restaurantId,
      lat,
      lng,
      distance = 500,
      page = 1,
      limit = 10
    } = req.query;

    // console.log("Query params:", req.query);

    const radiusInMeters = parseFloat(distance) * 1000;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    const restaurantMatch = {};
    if (restaurantId) {
      restaurantMatch._id = new mongoose.Types.ObjectId(restaurantId);
    }

    const foodMatch = {};

    if (cuisineType) {
      foodMatch["foods.cuisineType"] = {
        $in: Array.isArray(cuisineType) ? cuisineType : [cuisineType]
      };
    }

    if (category) {
      foodMatch["foods.category"] = {
        $in: Array.isArray(category) ? category : [category]
      };
    }

    if (type) {
      foodMatch["foods.type"] = {
        $in: Array.isArray(type) ? type : [type]
      };
    }

    if (name) {
      const rawName = Array.isArray(name) ? name[0] : name;
      const safeName = typeof rawName === 'string' ? rawName : String(rawName);

      // Optional: Escape special regex characters
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      foodMatch["foods.name"] = {
        $regex: escapeRegex(safeName),
        $options: "i"
      };
    }




    const pipeline = [];

    if (lat && lng) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: "distance",
          // maxDistance: radiusInMeters,
          spherical: true,
          query: restaurantMatch
        }
      });
    } else if (Object.keys(restaurantMatch).length > 0) {
      pipeline.push({ $match: restaurantMatch });
    }

    pipeline.push({
      $lookup: {
        from: "foods",
        localField: "_id",
        foreignField: "restaurant",
        as: "foods"
      }
    });

    pipeline.push({ $unwind: "$foods" });

    if (Object.keys(foodMatch).length > 0) {
      pipeline.push({ $match: foodMatch });
    }

    pipeline.push({
      $project: {
        _id: 0,
        restaurant: {
          id: "$_id",
          name: "$name",
          location: "$location",
          distance: "$distance"
        },
        food: "$foods"
      }
    });

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parsedLimit });

    const results = await Restaurant.aggregate(pipeline);

    const processed = results.map(item => {
      if (item.food.image) {
        item.food.image = process.env.IMAGEURL + item.food.image.replace(/\\+/g, "/");
      }
      return item;
    });

    const countPipeline = JSON.parse(JSON.stringify(pipeline));
    countPipeline.splice(-2); // remove skip and limit
    countPipeline.push({ $count: "total" });

    const countResult = await Restaurant.aggregate(countPipeline);
    const totalFoods = countResult.length > 0 ? countResult[0].total : 0;

    res.status(200).json({
      data: processed,
      page: parseInt(page),
      limit: parsedLimit,
      count: processed.length,
      total: totalFoods
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Error fetching food list",
      error: error.message
    });
  }
};









// Get a specific food detail by ID
exports.getFoodById = async (req, res) => {
  // console.log("vhfhffhfhvvhgh");

  try {
    const food = await Food.findById(req.params.id).populate('restaurant'); // Populate restaurant details if needed;
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path

    // Prepend the base URL to the restaurant image only if it's missing
    food.restaurant.image = process.env.IMAGEURL + food.restaurant.image.replace(/\\+/g, '/');
    res.status(200).json(food);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching food detail', error: error.message });
  }
};



exports.filterFood = async (req, res) => {
  try {
    // Get the filter values from the body of the request
    const { name, type, cuisineType, restaurantName, restaurantId, category } = req.body;

    // Build the query object for the filter
    let filter = {};

    if (restaurantId) filter.restaurant = restaurantId;

    if (name) filter.name = new RegExp(name, 'i'); // Case-insensitive match
    if (type) filter.type = new RegExp(type, 'i');
    if (cuisineType) filter.cuisineType = new RegExp(cuisineType, 'i');
    if (category) filter.category = new RegExp(category, 'i');

    // console.log("vfcfc", req.body, "fdgdffffty", filter);
    // if (restaurantId){
    //   const foods = await Food.find({restaurant:restaurantId}).populate('restaurant');
    // }

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



    // console.log("njhx", filter);


    // Query the Food collection with the filter
    const foods = await Food.find(filter).populate('restaurant'); // Populate restaurant details if needed

    const resultFood = foods.map(food => {
      // const updatedPath = filePath.replace(/\\+/g, '/'); 
      food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
      // console.log("bhhgvghvfcfxf==============>>>>>",food.restaurant.image);

      if (!food.restaurant.image.startsWith(process.env.IMAGEURL)) {
        // Prepend the base URL to the restaurant image only if it's missing
        food.restaurant.image = process.env.IMAGEURL + food.restaurant.image.replace(/\\+/g, '/');
      } else {
        // If it already has the base URL, just fix the slashes
        food.restaurant.image = food.restaurant.image.replace(/\\+/g, '/');
      }//to the image path
      return foods;
    });
    // console.log("foodssssss====", foods);

    res.json({ foods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update food details by ID


exports.updateFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    // console.log("req. body",req.body);

    // Find the existing food document
    const existingFood = await Food.findById(foodId);
    if (!existingFood) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if a new image is uploaded
    if (req.file) {
      // Delete the old image from the file system
      const oldImagePath = existingFood.image;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      // Update the image field with the new image path
      req.body.image = req.file.path;
    }

    // Parse category, type, cuisineType if they exist and are strings
    if (req.body.category && typeof req.body.category === "string") {
      try {
        req.body.category = JSON.parse(req.body.category);
      } catch {
        // fallback if not JSON, maybe comma-separated string
        req.body.category = req.body.category.split(",").map((v) => v.trim());
      }
    }

    if (req.body.type && typeof req.body.type === "string") {
      try {
        req.body.type = JSON.parse(req.body.type);
      } catch {
        req.body.type = req.body.type.split(",").map((v) => v.trim());
      }
    }

    if (req.body.cuisineType && typeof req.body.cuisineType === "string") {
      try {
        req.body.cuisineType = JSON.parse(req.body.cuisineType);
      } catch {
        req.body.cuisineType = req.body.cuisineType.split(",").map((v) => v.trim());
      }
    }

    // If ingredients is sent as comma-separated string, convert to array
    if (req.body.ingredients && typeof req.body.ingredients === "string") {
      req.body.ingredients = req.body.ingredients.split(",").map((v) => v.trim());
    }

    // Update the food document
    const updatedFood = await Food.findByIdAndUpdate(foodId, req.body, { new: true });

    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json({ message: 'Food detail updated successfully', food: updatedFood });
  }
  catch (error) {
    console.error('Error updating food detail:', error);
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



// exports.foodDetails = async (req, res) => {
//   const id=req.params.id;
//   try {

//     const foods = await Food.findById(id).populate('restaurant'); // Populate restaurant details if needed

//     const resultFood = foods.map(food => {
//       food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path

//       if (!food.restaurant.image.startsWith(process.env.IMAGEURL)) {
//         // Prepend the base URL to the restaurant image only if it's missing
//         food.restaurant.image = process.env.IMAGEURL + food.restaurant.image.replace(/\\+/g, '/');
//       } else {
//         // If it already has the base URL, just fix the slashes
//         food.restaurant.image = food.restaurant.image.replace(/\\+/g, '/');
//       }//to the image path
//       return foods;
//     });
//     console.log("foodssssss====",foods);

//     res.json({ foods });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// }


exports.addCart = async (req, res) => {

  // Validate the request body
  // const { error } = cartValidationSchema.validate(req.body);
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }
  try {

    const { food, quantity, type } = req.body;
    const user = req.user.userId;
    // console.log("hjdhhdshjds", req.body);

    // Check if the item already exists in the user's cart
    if (quantity <= 0) {
      res.status(206).json({ message: "You can't add 0 quantity in the cart item" });
    }
    else {
      const existingCartItem = await Cart.findOne({ user, food, type });

      if (existingCartItem) {
        // If the item exists, update the quantity
        existingCartItem.quantity += quantity; // Add new quantity to the existing one
        await existingCartItem.save();
        const cartDetils = await Cart.find({ user })
          .populate('user')
          .populate({
            path: 'food',

            model: Food,
            populate: {
              path: 'restaurant',
              model: Restaurant
            }
          });

        // console.log("ngbjyvjctgcht",resultFood);
        const resultFood = cartDetils.map(cart => {
          cart.food.image = process.env.IMAGEURL + cart.food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
          if (!cart.food.restaurant.image.startsWith(process.env.IMAGEURL)) {
            cart.food.restaurant.image = process.env.IMAGEURL + cart.food.restaurant.image.replace(/\\+/g, '/');
          } else {
            cart.food.restaurant.image = cart.food.restaurant.image.replace(/\\+/g, '/');
          }
          return cartDetils;
        });


        return res.status(200).json({ message: "Item updated in cart", result: resultFood });
      } else {
        // If it doesn't exist, create a new cart item
        const newCartItem = new Cart({
          user,
          food,
          quantity,
          type
        });

        await newCartItem.save();
        // console.log("dffffffffffffffffffffffff");

        const cartDetils = await Cart.find({ user })
          .populate('user')
          .populate({
            path: 'food',
            model: Food,
            populate: {
              path: 'restaurant',
              model: Restaurant
            }
          });
        // console.log("dffffffffffffffffffffffff", cartDetils);

        const resultCart = cartDetils.map((cart) => {
          cart.food.image = process.env.IMAGEURL + cart.food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
          if (!cart.food.restaurant.image.startsWith(process.env.IMAGEURL)) {
            cart.food.restaurant.image = process.env.IMAGEURL + cart.food.restaurant.image.replace(/\\+/g, '/');
          } else {
            cart.food.restaurant.image = cart.food.restaurant.image.replace(/\\+/g, '/');
          }
          return cartDetils;
        });
        res.status(201).json({ message: "Added to the Cart", result: resultCart });
      }
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCart = async (req, res) => {
  try {
    const cartDetils = await Cart.find({ user: req.user.userId })
      .populate('user')
      .populate({
        path: 'food',
        model: Food,
        populate: {
          path: 'restaurant',
          model: Restaurant
        }
      });

    // console.log("the cart items is ", cartDetils);

    const resultFood = cartDetils.map(cart => {
      if (cart.food) {
        if (cart.food.image) {
          cart.food.image = process.env.IMAGEURL + cart.food.image.replace(/\\+/g, '/');
        }

        if (cart.food.restaurant) {
          if (cart.food.restaurant.image) {
            if (!cart.food.restaurant.image.startsWith(process.env.IMAGEURL)) {
              cart.food.restaurant.image = process.env.IMAGEURL + cart.food.restaurant.image.replace(/\\+/g, '/');
            } else {
              cart.food.restaurant.image = cart.food.restaurant.image.replace(/\\+/g, '/');
            }
          }
        }
      }
      return cart;
    });
    // console.log("bxdjhdhjf11111111111111", resultFood[0].food.restaurant);


    return res.status(200).json({ message: "Fetched cart Details", result: resultFood });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Item from Cart (DELETE /cart/:id)
exports.deleteCart = async (req, res) => {
  const cartItemId = req.body.id;

  try {

    // Find the cart item by ID and delete it
    const cartItem = await Cart.findByIdAndDelete(cartItemId);

    if (!cartItem) {
      return res.status(404).send('Cart item not found');
    }

    res.status(200).json({ message: 'cart Item  deleted successfully' });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// // Edit Cart Item (PUT /cart/:id)
exports.removeCart = async (req, res) => {
  const cartItemId = req.body.id;
  const operation = req.body.operation;

  try {
    // Validate the request body for quantity and operation
    const { error } = Joi.object({
      id: Joi.string().required(),
      operation: Joi.string().valid('plus', 'minus').required(), // operation must be either 'plus' or 'minus'
    }).validate(req.body);

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // Find the cart item by ID
    const cartItem = await Cart.findById(cartItemId);

    if (!cartItem) {
      return res.status(404).send('Cart item not found');
    }

    // Modify quantity based on operation
    if (operation === 'plus') {
      cartItem.quantity += 1; // Increase quantity by 1
    } else if (operation === 'minus') {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1; // Decrease quantity by 1, but don't go below 1
      } else {
        return res.status(400).send('Quantity cannot be less than 1');
      }
    }

    // Save the updated cart item
    await cartItem.save();

    res.status(200).json({ message: 'Cart item updated successfully', quantity: cartItem.quantity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Function to fetch user and restaurant and calculate distance
exports.calculateDistance = async () => {
  try {
    // Fetch the user and restaurant data from database by their _id
    const user = await User.findById('6752a0ecbeddc2e748509200');  // Example user _id
    const restaurant = await Restaurant.findById('6752a1f8beddc2e748509204');  // Example restaurant _id

    if (!user || !restaurant) {
      throw new Error('User or Restaurant not found');
    }

    // Extracting lat and lng from the user and restaurant data
    const userLat = user.lat;
    const userLng = user.lng;
    const restaurantLat = restaurant.lat;
    const restaurantLng = restaurant.lng;
    // console.log("bhbcjhb bhbjb======================>>>", userLat, userLng, restaurantLat, restaurantLng);


    // Calculate distance between user and restaurant using Haversine formula
    const distance = haversineDistance(userLat, userLng, restaurantLat, restaurantLng);

    // console.log(`The distance between the user and the restaurant is: ${distance.toFixed(2)} kilometers.`);
  } catch (error) {
    console.error("Error occurred:", error);
  }
};




exports.duplicateFoodToAllRestaurants = async () => {
  try {
    const originalRestaurantId = new mongoose.Types.ObjectId('6836b9d9b99ea3bca88d1617');

    // STEP 1: Get food items of the source restaurant
    const foodItems = await Food.find({ restaurant: originalRestaurantId });
    if (!foodItems.length) {
      throw new Error('No food items found for the original restaurant');
    }

    // STEP 2: Get all restaurants except the source one
    const restaurants = await Restaurant.find({ _id: { $ne: originalRestaurantId } });

    // STEP 3: Prepare cloned food items
    const bulkInsert = [];

    for (const restaurant of restaurants) {
      for (const food of foodItems) {
        const newFood = {
          ...food.toObject(),
          _id: new mongoose.Types.ObjectId(), // new _id
          restaurant: restaurant._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Optional cleanup
        delete newFood.__v;

        bulkInsert.push(newFood);
      }
    }

    // STEP 4: Bulk insert all cloned foods
    if (bulkInsert.length > 0) {
      await Food.insertMany(bulkInsert);
      // console.log(`✅ Successfully copied ${foodItems.length} food items to ${restaurants.length} restaurants.`);
    } else {
      // console.log('⚠️ No restaurants found to copy food to.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  //  finally {
  //   // mongoose.connection.close();
  // }
}
