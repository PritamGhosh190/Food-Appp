const Role = require('../../../models/Role')

const addRole = async (req, res) => {
  try {
    const role = new Role(req.body)

    await role.save()
    return res.status(200).json({
      message: 'Role added successfully',
      // role
    })
  }catch (err) {
    return res.status(500).json({
      message: 'Unable to add role',
      error: err.message
    })
  }
}

module.exports = addRole