// routes/foodRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { createFood, getAllFoods, getFoodById, updateFood, deleteFood } = require("../../Controllers/food");

const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Upload/Foods');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Date-based unique filename
  }
});
const upload = multer({ storage: storage });

// Create a new food entry
router.post('/add', upload.single('image'), createFood);

// Get all food details
router.get('/foods', getAllFoods);

// Get a food detail by ID
router.get('/foods/:id', getFoodById);

// Update food details by ID
router.put('/foods/:id', updateFood);

// Delete food by ID
router.delete('/foods/:id', deleteFood);

module.exports = router;
