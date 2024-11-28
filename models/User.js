const {Schema, model, models} = require('mongoose')
const {ROLE} = require('../config/roles')

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
      enum: [ROLE.seller, ROLE.admin, ROLE.user],
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
    type:Date,
   }
  },
  {timestamps: true}
)

const User = models.users ? models.users : model('users', UserSchema)

module.exports = User
