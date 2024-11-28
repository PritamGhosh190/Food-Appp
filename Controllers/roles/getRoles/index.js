const Role = require('../../../models/Role')

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find()

    return res.status(200).json({
      message: 'Roles retrieved successfully',
      roles
    })

  } catch (err) {
    return res.status(500).json({
      message: 'Unable to retrieve roles',
      error: err.message
    })
  }
}

module.exports = getRoles