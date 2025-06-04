const mongoose = require('mongoose');
const User = require("./User");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['delivery', 'dineIn', 'takeaway'],
    required: true
  },
  address: {
    type: String,
    default: null
  },
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["seller", "admin", "user"],
    default: 'user'
  },
  mobilenum: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // 10-digit number
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  }
}, {
  timestamps: true
});

// ✅ Conditional validation using pre-save hook
addressSchema.pre('validate', function (next) {
  if (this.type === 'delivery') {
    if (!this.address) {
      return next(new Error('Address is required for delivery type.'));
    }
    if (this.lat == null || this.lng == null) {
      return next(new Error('Latitude and Longitude are required for delivery type.'));
    }
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
