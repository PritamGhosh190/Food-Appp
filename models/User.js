const { Schema, model, models } = require('mongoose')

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: ["seller", "admin", "user"],
    },
    gender: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
    },
    Dob:
    {
      type: Date,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  { timestamps: true }
)

const User = models.users ? models.users : model('users', UserSchema)

module.exports = User
