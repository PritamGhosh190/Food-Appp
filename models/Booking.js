const mongoose = require("mongoose");
const Counter = require("./Counter"); // Ensure path is correct

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    groupSize: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., "19:30"

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["booked", "confirmed", "cancelled", "paid"],
      default: "booked",
    },
    additional: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Pre-save hook to generate bookingId like BRD0001
bookingSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Only generate on new docs

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "bookingNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const number = String(counter.seq).padStart(4, "0"); // 0001, 0002, etc.
    this.bookingId = `BRD${number}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
