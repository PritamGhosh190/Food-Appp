const Role = require('../../../models/Role')

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.roleId)

    if (!role) {
      return res.status(404).json({
        message: 'Role not found'
      })
    }
    return res.status(200).json({
      message: 'Role deleted successfully'
    })

  } catch (err) {
    return res.status(500).json({
      message: 'Unable to delete role',
      error: err.message
    })
  }
}

module.exports = deleteRole