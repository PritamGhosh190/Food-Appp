const User = require('../../../models/User')
const mongoose = require('mongoose')

const removeUser = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId)

    const user = await User.findByIdAndDelete(userId)

    if (!user)
      return res.status(404).json({success: false, error: 'User not found'})
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = removeUser