const Role = require('../../../models/Role')

const updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.roleId, req.body)

    if (!role) {
      return res.status(404).json({
        message: 'Role not found'
      })
    }
    return res.status(200).json({
      message: 'Role updated successfully',
      // role
    })
  } catch (err) {
    return res.status(500).json({
      message: 'Unable to update role',
      error: err.message
    })
  }
}

module.exports = updateRole