const express = require('express');
const router = express.Router();
const foodBillingController = require('../../Controllers/billing');

// Route to create a new food bill
router.post('/create', foodBillingController.createFoodBill);

// Route to get all food bills
router.get('/', foodBillingController.getAllFoodBills);

module.exports = router;
