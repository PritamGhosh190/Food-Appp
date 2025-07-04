// routes/foodRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { createFood, getAllFoods, getFoodById, updateFood, deleteFood, filterFood, addCart, getCart, removeCart, deleteCart, calculateDistance, foodDetails, duplicateFoodToAllRestaurants } = require("../../Controllers/food");
const { userAuth, checkRole, serializeUser } = require('../../Controllers/auth');
const { log } = require('async');
const fs = require('fs');


const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Upload/Foods');
  },
  limits: { fileSize: 10 * 1024 * 1024 },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Date-based unique filename
  }
});
const upload = multer({ storage: storage });

// Create a new food entry
router.post('/add', checkRole(["admin", "seller"]), upload.single('image'), createFood);
router.get('/addduplicate', duplicateFoodToAllRestaurants);
// Update food details by ID
router.put('/update/:id', checkRole(["admin", "seller"]), upload.single('image'), updateFood);

// Get all food details
router.get('/foods', getAllFoods);

// Get a food detail by ID
router.get('/foods/:id', async (req, res) => {
  // console.log("gvgvgggvghhghg");

  await getFoodById(req, res)
});



// Delete food by ID
router.delete('/foods/:id', deleteFood);

//Filter foods
router.post('/filter', filterFood);

router.post('/cart/add', addCart);

router.get('/cart/get', getCart);
router.post('/cart/remove', removeCart);
router.post('/cart/delete', deleteCart);
router.post('/distance', calculateDistance);


module.exports = router;
