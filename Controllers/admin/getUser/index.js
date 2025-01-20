const mongoose = require('mongoose')
const User = require("../../../models/User");


const getUsers = async (req, res) => {

  try {

    const users = await User.find()

    if (!users)
      return res.status(203).json({success: false, error: 'User not found'})
    return res.status(200).json({
      success: true,
      users: users,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = getUsers
