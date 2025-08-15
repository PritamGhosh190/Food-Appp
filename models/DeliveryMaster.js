const mongoose = require("mongoose");

const deliverySettingSchema = new mongoose.Schema(
  {
    minimum_distance: {
      type: Number,
      required: true,
      min: 0,
    },
    convenience_charges_type: {
      type: String,
      enum: ["flat", "percentage"],
      required: true,
    },
    convenience_charges_value: {
      type: Number,
      required: true,
      min: 0,
    },
    delivery_charges_type: {
      type: String,
      enum: ["flat", "percentage", "distance"],
      required: true,
    },
    delivery_charges_value: {
      type: Number,
      required: true,
      min: 0,
    },
    Cgst: {
      type: String,
      default: "0%", // or "2.5%" if you prefer
    },
    Sgst: {
      type: String,
      default: "0%",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const DeliverySetting = mongoose.model(
  "DeliverySetting",
  deliverySettingSchema
);

module.exports = DeliverySetting;
