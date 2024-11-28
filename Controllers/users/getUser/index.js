const mongoose = require('mongoose')
const User = require('../../../models/User')
const getUser = async (req, res) => {

  try {
    const userId = new mongoose.Types.ObjectId(req.user._id)

    const user = await User.findById(userId)

    if (!user)
      return res.status(404).json({success: false, error: 'User not found'})
    return res.status(200).json({
      success: true,
      user: user,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = getUser
