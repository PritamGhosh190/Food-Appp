const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getRestaurantBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  getDeliverySettings,
  updateDeliverySetting,
} = require("../../Controllers/booking");

// Create a new booking
router.post("/", createBooking);

// Get all bookings of a user
router.get("/user/:userId", getUserBookings);
router.get("/", getAllBookings);
router.get("/deliverySettings", getDeliverySettings);
router.put("/deliverySettings/:id", updateDeliverySetting);

// Get all bookings for a restaurant
router.get("/restaurant/:restaurantId", getRestaurantBookings);

// Update booking status (confirm, paid, etc.)
router.put("/:id/status", updateBookingStatus);

// Cancel a booking
router.get("/delete/:id", cancelBooking);

module.exports = router;
