const mongoose = require('mongoose')
const User = require("../../../models/User");


const getSellers = async (req, res) => {

  try {

    const sellers = await User.find({ role: 'seller' });

    if (!sellers)
      return res.status(203).json({success: false, error: 'User not found'})
    return res.status(200).json({
      success: true,
      sellers: sellers,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = getSellers
