const FoodBilling = require('../../models/Billing');
// const User = require();
// const Restaurant = require('../models/restaurant');

// Create a new food bill
exports.createFoodBill = async (req, res) => {
    try {
        const { restaurantId, foodDetails, deliveryCharges, convenienceCharges, otherCharges, paymentStatus,totalAmount,grossAmount } = req.body;

        // Find the user and restaurant
        // const user = await User.findById(userId);
        // const restaurant = await Restaurant.findById(restaurantId);

        // if (!user || !restaurant) {
        //     return res.status(404).json({ message: 'User or Restaurant not found' });
        // }

        // // Calculate total and gross amount
        // let totalAmount = 0;
        // foodDetails.forEach(detail => {
        //     totalAmount += detail.quantity * detail.price;
        // });

        // const grossAmount = totalAmount + deliveryCharges + convenienceCharges + otherCharges;

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
            paymentStatus,
        });

        await foodBill.save();
        res.status(201).json({ message: 'Food Bill created successfully', data: foodBill });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all food bills
exports.getAllFoodBills = async (req, res) => {
    try {
        const foodBills = await FoodBilling.find().populate('userId restaurantId').exec();
        res.status(200).json({ data: foodBills });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
