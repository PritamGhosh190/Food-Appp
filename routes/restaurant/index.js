const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {userAuth, checkRole, serializeUser} = require('../../Controllers/auth')
// const {userAuth, checkRole, serializeUser} = require('../Controllers/auth')


const restaurantController = require("../../Controllers/restaurant");
const { log } = require('console');


// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Upload/Restaurant/'); // Save files in 'uploads' folder
    },
    limits: { fileSize: 10 * 1024 * 1024 },
    filename: (req, file, cb) => {
        // Set the file name as the current timestamp + original file name
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Initialize multer with the defined storage and file filter
const upload = multer({ storage: storage });
// router.post("/fileUpload", async (req, res) => {
//     console.log("byggy",req.file);
    
//     console.log("fileUpload");
//     try {
//         img_upload1(req, res, async (err) => {
//             if (err) {
//                 console.error("Error in uploading:", err);
//                 return res.status(500).json(err);
//             }
//             if (req.file && req.file.filename !== undefined && req.file !== null) {
//                 return res.status(200).json({
//                     code: 0,
//                     status: true,
//                     result: "File uploaded",
//                 });
//             } else {
//                 client.close();
//                 return res.status(201).json({
//                     code: 1,
//                     result: "Please fill the mandatory fields !!",
//                     message: "Mandatory Field Missing !!",
//                 });
//             }
//         });
//     } catch (err) {
//         // console.error("Error:", err);
//         return res.status(500).json(err);
//     }
// });



// Route to create a new restaurant (with image upload)
router.post('/add',checkRole(["admin","seller"]), upload.single('Restaurant_image'), restaurantController.createrestaurant);

// Route to update an existing restaurant (with image upload)
// router.put('/:id', upload.single('image'), restaurantController.updaterestaurant);

// // Other routes remain unchanged
router.get('/', restaurantController.getAllRestaurants);
// router.get('/:id', restaurantController.getrestaurantById);
// router.delete('/:id', restaurantController.deleterestaurant);

module.exports = router;
