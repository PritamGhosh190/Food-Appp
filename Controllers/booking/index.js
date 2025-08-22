const Booking = require("../../models/Booking");
const Restaurant = require("../../models/Restaurant");
const mongoose = require("mongoose");
const DeliverySetting = require("../../models/DeliveryMaster");

// Create a new booking
function parseTime12h(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

exports.createBooking1 = async (req, res) => {
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
    // console.error("Error creating booking:", error);
    if (
      error.code === 11000 &&
      error.keyPattern?.userId &&
      error.keyPattern?.date
    ) {
      return res.status(400).json({
        success: false,
        message: "You already have a booking for this date.",
      });
    }
    res.status(500).json({ error: "Server error" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { name, phone, groupSize, date, time, restaurantId, additional } =
      req.body;
    const userId = req.user.userId;

    // ✅ Parse date + time into full Date object
    const { hours, minutes } = parseTime12h(time);
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    // Find user's bookings for that date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const userBookings = await Booking.find({
      userId,
      status: { $ne: "cancelled" },
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Rule 1: Max 2 bookings per day
    if (userBookings.length >= 2) {
      return res.status(400).json({
        success: false,
        message: "You can only make 2 bookings per day.",
      });
    }

    // Rule 2: At least 4-hour gap
    for (let b of userBookings) {
      const { hours: bh, minutes: bm } = parseTime12h(b.time);
      const existingBookingDateTime = new Date(b.date);
      existingBookingDateTime.setHours(bh, bm, 0, 0);

      const diffHours = Math.abs(
        (bookingDateTime - existingBookingDateTime) / (1000 * 60 * 60)
      );

      if (diffHours < 4) {
        return res.status(400).json({
          success: false,
          message: "There must be at least a 4-hour gap between your bookings.",
        });
      }
    }

    // ✅ Passed validation → create booking
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

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating booking",
      error: error.message,
    });
  }
};

// Get bookings by user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({
      userId,
      status: { $ne: "cancelled" }, // ✅ exclude cancelled
    }).sort({ date: -1 });
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
  console.log("cancelling booking with ID:", req.params);

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
    const settings = await DeliverySetting.findOne({ is_deleted: false });

    if (!settings || settings.length === 0) {
      return res.status(404).json({ message: "No delivery settings found." });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateDeliverySetting = async (req, res) => {
  console.log(
    "Updating delivery setting with ID:",
    req.params,
    "and data:",
    req.body
  );

  try {
    const { id } = req.params;

    const updatedSetting = await DeliverySetting.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSetting) {
      return res.status(404).json({ message: "Delivery setting not found" });
    }

    return res.status(200).json(updatedSetting);
  } catch (error) {
    console.error("Error updating delivery setting:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
