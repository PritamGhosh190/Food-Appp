const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getRestaurantBookings,
  updateBookingStatus,
  cancelBooking,
} = require("../controllers/bookingController");

// Create a new booking
router.post("/", createBooking);

// Get all bookings of a user
router.get("/user/:userId", getUserBookings);

// Get all bookings for a restaurant
router.get("/restaurant/:restaurantId", getRestaurantBookings);

// Update booking status (confirm, paid, etc.)
router.put("/:id/status", updateBookingStatus);

// Cancel a booking
router.delete("/:id", cancelBooking);

module.exports = router;
