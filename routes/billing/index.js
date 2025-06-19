const express = require("express");
const router = express.Router();
const foodBillingController = require("../../Controllers/billing");

// Route to create a new food bill
router.post("/create", foodBillingController.createFoodBill);

// Route to get all food bills
router.get("/", foodBillingController.getAllFoodBills);
router.get("/allOrder", foodBillingController.getFoodBillings);

// PATCH: Update a billing record (admin/seller access)
router.patch("/:id", foodBillingController.updateFoodBilling);

module.exports = router;
