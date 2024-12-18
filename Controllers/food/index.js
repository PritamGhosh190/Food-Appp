// controllers/foodController.js
const Food = require('../../models/Food');
const Restaurant = require("../../models/Restaurant")
const Cart = require("../../models/Cart")
const User = require("../../models/User")
require('dotenv').config();
const Joi = require('joi')
console.log("imageurl=======>>>", process.env.IMAGEURL);

// Create a new food detail
exports.createFood = async (req, res) => {
  try {
    // console.log("hiiiii",req.body);

    const { name, restaurant, distance, price, rating, category, type, cuisineType } = req.body;
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
    const { name, restaurant, cuisineType, category, type } = req.query;

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
    const resultFood = foods.map(food => {
      // const updatedPath = filePath.replace(/\\+/g, '/'); 
      food.image = process.env.IMAGEURL + food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
      return foods;
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

exports.filterFood = async (req, res) => {
  try {
    // Get the filter values from the body of the request
    const { name, type, cuisineType, restaurantName, restaurantId, category } = req.body;
    console.log("vfcfc", req.body);

    // Build the query object for the filter
    let filter = {};

    if (restaurantId) filter.restaurant = restaurantId;

    if (name) filter.name = new RegExp(name, 'i'); // Case-insensitive match
    if (type) filter.type = new RegExp(type, 'i');
    if (cuisineType) filter.cuisineType = new RegExp(cuisineType, 'i');
    if (category) filter.category = new RegExp(category, 'i');

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



    console.log("njhx", filter);


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
    console.log("foodssssss====",foods);
    
    res.json({ foods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


exports.addCart = async (req, res) => {
  // Validate the request body
  // const { error } = cartValidationSchema.validate(req.body);
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }
  try {

    const { food, quantity } = req.body;
    const user = req.user.userId;

    // Check if the item already exists in the user's cart
    if(quantity<=0)
    {
      res.status(206).json({ message: "You can't add 0 quantity in the cart item"});
    }
    else{
    const existingCartItem = await Cart.findOne({ user, food });
    
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

      const resultFood = cartDetils.map(cart => {
        cart.food.image = process.env.IMAGEURL + cart.food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
        if (!cart.food.restaurant.image.startsWith(process.env.IMAGEURL)) {
          cart.food.restaurant.image = process.env.IMAGEURL + cart.food.restaurant.image.replace(/\\+/g, '/');
        } else {
          cart.food.restaurant.image = cart.food.restaurant.image.replace(/\\+/g, '/');
        }
        return cartDetils;
      });

      // console.log("ngbjyvjctgcht",resultFood);

      return res.status(200).json({ message: "Item updated in cart", result: resultFood });
    } else {
      // If it doesn't exist, create a new cart item
      const newCartItem = new Cart({
        user,
        food,
        quantity,
      });

      await newCartItem.save();
      console.log("dffffffffffffffffffffffff");

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
      console.log("dffffffffffffffffffffffff", cartDetils);

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

    const resultFood = cartDetils.map(cart => {
      cart.food.image = process.env.IMAGEURL + cart.food.image.replace(/\\+/g, '/');  // Prepend the base URL to the image path
      if (!cart.food.restaurant.image.startsWith(process.env.IMAGEURL)) {
        cart.food.restaurant.image = process.env.IMAGEURL + cart.food.restaurant.image.replace(/\\+/g, '/');
      } else {
        cart.food.restaurant.image = cart.food.restaurant.image.replace(/\\+/g, '/');
      }
      // return cartDetils;
    });

    // console.log("ngbjyvjctgcht", cartDetils);

    return res.status(200).json({ message: "Fetched cart Details", result: cartDetils });
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
    console.log("bhbcjhb bhbjb======================>>>", userLat, userLng, restaurantLat, restaurantLng);


    // Calculate distance between user and restaurant using Haversine formula
    const distance = haversineDistance(userLat, userLng, restaurantLat, restaurantLng);

    console.log(`The distance between the user and the restaurant is: ${distance.toFixed(2)} kilometers.`);
  } catch (error) {
    console.error("Error occurred:", error);
  }
};