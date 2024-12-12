const mongoose = require('mongoose');
const User = require("./User");


// Create the Address Schema
const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  address: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    enum: ["seller", "admin", "user"],
  },
  mobilenum: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); // Ensure the mobile number is 10 digits
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  }
}, {
  timestamps: true // To automatically create createdAt and updatedAt fields
});

// Create the Address model based on the schema
const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
