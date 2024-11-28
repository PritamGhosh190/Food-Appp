const Menu = require('../../../models/Menu')

const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.menuId)

    if (!menu) {
      return res.status(404).json({
        message: 'Menu not found'
      })
    }
    return res.status(200).json({
      message: 'Menu deleted successfully'
    })

  } catch (err) {
    return res.status(500).json({
      message: 'Unable to delete menu',
      error: err.message
    })
  }
 }

module.exports = deleteMenu