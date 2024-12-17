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
        console.log("njdjncnkcjc",foodBill);
        
        await foodBill.save();
        await Cart.deleteMany({ user: req.user.userId });
        res.status(201).json({ message: 'Food Bill created successfully', data: foodBill });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
function getFormattedDateTimeWithAMPM(dateString) {
    const date = new Date(dateString); // Create a Date object
    
    // Format the date
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Months are 0-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get the hours, and format for 12-hour clock
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    // Determine AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour should be 12 (12:00 AM)
    
    // Combine both parts into a formatted string
    return `${year}-${month}-${day} ${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  }

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
            if (!e.restaurantId.image.startsWith(process.env.IMAGEURL)) {
                // Prepend the base URL to the restaurant image only if it's missing
                e.restaurantId.image = process.env.IMAGEURL +  e.restaurantId.image.replace(/\\+/g, '/');
              } else {
                // If it already has the base URL, just fix the slashes
                e.restaurantId.image =  e.restaurantId.image.replace(/\\+/g, '/');
              }
            e.createdAt="abc"+e.createdAt;
            let abc= getFormattedDateTimeWithAMPM(e.createdAt)
            console.log(abc);
            e.formattedCreatedAt = abc;
            return e
        })
      
      console.log(resFoodBills);
        res.status(200).json({ data: foodBills });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
