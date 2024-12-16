const User = require("../../models/User");
const FoodBilling = require("../../models/Billing");
const Cart = require("../../models/Cart");
// const Restaurant = require('../models/restaurant');
require('dotenv').config();


// Create a new food bill
exports.createFoodBill = async (req, res) => {
    try {
        const { restaurantId, foodDetails, deliveryCharges, convenienceCharges, otherCharges, paymentStatus,totalAmount,grossAmount,CGST,SGST } = req.body;
        // Create food bill
        const foodBill = new FoodBilling({
            userId:req.user.userId,
            restaurantId,
            foodDetails,
            totalAmount,
            grossAmount,
            deliveryCharges,
            convenienceCharges,
            otherCharges,
            SGST,
            CGST,
            paymentStatus,
        });

        await foodBill.save();
        await Cart.deleteMany({ user: req.user.userId });
        res.status(201).json({ message: 'Food Bill created successfully', data: foodBill });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all food bills
exports.getAllFoodBills = async (req, res) => {
    const userId=req.user.userId;
    try {
        const foodBills = await FoodBilling.find({ userId })
        .populate('userId')  // Populate the userId field with the User document
        .populate('restaurantId')  // Populate the restaurantId field with the Restaurant document
        .populate('foodDetails.foodId')  // Populate the foodId field inside the foodDetails array
        .exec();
        const resFoodBills=foodBills.map((e)=>{
            e.restaurantId.image=process.env.IMAGEURL + e.restaurantId.image.replace(/\\+/g, '/');
        })
      
      console.log(foodBills);
        res.status(200).json({ data: foodBills });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
