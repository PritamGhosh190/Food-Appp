const Booking = require("../../models/Booking");
const Restaurant = require("../../models/Restaurant");
const mongoose = require("mongoose");
const DeliverySetting = require("../../models/DeliveryMaster");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, groupSize, date, time, restaurantId, additional } =
      req.body;
    const userId = req.user.userId;

    const booking = new Booking({
      name,
      phone,
      groupSize,
      date,
      time,
      restaurantId,
      userId,
      additional,
      status: "booked",
    });

    await booking.save();
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get bookings by user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user bookings" });
  }
};

// Get bookings by restaurant
exports.getRestaurantBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const bookings = await Booking.find({ restaurantId }).sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Error fetching restaurant bookings" });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["booked", "confirmed", "cancelled", "paid"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res
      .status(200)
      .json({ message: "Booking status updated", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ error: "Error updating booking status" });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ error: "Error cancelling booking" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { status } = req.query;
    // console.log(role, userId, "vctjtfft");

    let match = {};

    if (role === "user") {
      match.userId = new mongoose.Types.ObjectId(userId);
    } else if (role === "seller") {
      const restaurant = await Restaurant.findOne({
        assignUser: new mongoose.Types.ObjectId(userId),
      });
      if (!restaurant) {
        return res
          .status(404)
          .json({ message: "No restaurant assigned to this seller" });
      }
      match.restaurantId = restaurant._id;
    }

    if (status) {
      match.status = status;
    }

    // 🧠 Use aggregation to sort by combined date + time
    const bookings = await Booking.aggregate([
      { $match: match },
      // {
      //   $addFields: {
      //     bookingDateTime: {
      //       $dateFromString: {
      //         dateString: {
      //           $concat: [
      //             { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      //             "T",
      //             {
      //               $let: {
      //                 vars: {
      //                   parts: { $split: ["$time", " "] }, // ["12:30", "PM"]
      //                 },
      //                 in: {
      //                   $let: {
      //                     vars: {
      //                       hourMinute: { $arrayElemAt: ["$$parts", 0] }, // "12:30"
      //                       ampm: { $arrayElemAt: ["$$parts", 1] },
      //                     },
      //                     in: {
      //                       $let: {
      //                         vars: {
      //                           hour: {
      //                             $toInt: {
      //                               $arrayElemAt: [
      //                                 { $split: ["$$hourMinute", ":"] },
      //                                 0,
      //                               ],
      //                             },
      //                           },
      //                           minute: {
      //                             $arrayElemAt: [
      //                               { $split: ["$$hourMinute", ":"] },
      //                               1,
      //                             ],
      //                           },
      //                         },
      //                         in: {
      //                           $let: {
      //                             vars: {
      //                               finalHour: {
      //                                 $cond: [
      //                                   { $eq: ["$$ampm", "AM"] },
      //                                   {
      //                                     $cond: [
      //                                       { $eq: ["$$hour", 12] },
      //                                       "00", // 12 AM → 00
      //                                       {
      //                                         $cond: [
      //                                           { $lt: ["$$hour", 10] },
      //                                           {
      //                                             $concat: [
      //                                               "0",
      //                                               { $toString: "$$hour" },
      //                                             ],
      //                                           },
      //                                           { $toString: "$$hour" },
      //                                         ],
      //                                       },
      //                                     ],
      //                                   },
      //                                   {
      //                                     $cond: [
      //                                       { $eq: ["$$hour", 12] },
      //                                       "12", // 12 PM → 12
      //                                       {
      //                                         $toString: {
      //                                           $add: ["$$hour", 12],
      //                                         },
      //                                       }, // e.g. 1 PM → 13
      //                                     ],
      //                                   },
      //                                 ],
      //                               },
      //                             },
      //                             in: {
      //                               $concat: ["$$finalHour", ":", "$$minute"],
      //                             },
      //                           },
      //                         },
      //                       },
      //                     },
      //                   },
      //                 },
      //               },
      //             },
      //             ":00",
      //           ],
      //         },
      //       },
      //     },
      //   },
      // },
      { $sort: { createdAt: -1 } }, // Sort by latest booking datetime
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    res.status(200).json({ status: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// controllers/deliverySettingController.js

// Fetch all delivery settings (optionally only non-deleted)
exports.getDeliverySettings = async (req, res) => {
  try {
    const settings = await DeliverySetting.find({ is_deleted: false });

    if (!settings || settings.length === 0) {
      return res.status(404).json({ message: "No delivery settings found." });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
