const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Counter name (e.g., "bookingNumber")
  seq: { type: Number, default: 0 }, // Last used number
});

const Counter = mongoose.model("Counter", CounterSchema);
module.exports = Counter;
