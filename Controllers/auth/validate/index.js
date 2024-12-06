const User = require('../../../models/User')
const Joi = require('joi')

/**
 * Check if user account exist by username.
 * @async
 * @function validateUser
 * @param {string} mobileNumber - The username of the user.
 * @return {boolean} If the user has an account.
 */
const validateUser = async (mobileNumber) => {
  let user = await User.findOne({mobileNumber})
  return user ? false : true
}

/**
 * Check if user account exist by email.
 * @async
 * @function validateEmail
 * @param {string} email - The email of the user.
 * @return {boolean} If the user has an account.
 */
const validateEmail = async (email) => {
  let user = await User.findOne({email})
  return user ? false : true
}

/**
 * Sets a validation schema for signup request body.
 * @const signupSchema
 */
const signupSchema = Joi.object({
  name: Joi.string().min(2).required(),
  mobileNumber: Joi.string().min(10).required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
  Dob: Joi.date().iso(),
  password: Joi.string()
  .min(8)
  .required(),
  gender:Joi.string().required(),
  role: Joi.string().valid('admin', 'user', 'seller').required()
    // .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()]{3,30}$'))


})

/**
 * Sets a validation schema for login request body.
 * @const loginSchema
 */
const loginSchema = Joi.object({
  mobileNumber: Joi.string().min(10).required(),
  password: Joi.string()
  .min(8)
  .required(),
  role: Joi.string().valid('admin', 'user', 'seller').required()
})

module.exports = {
  validateEmail,
  validateUser,
  signupSchema,
  loginSchema,
}
