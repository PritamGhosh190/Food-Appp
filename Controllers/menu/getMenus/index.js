const Menu = require('../../../models/Menu')

const getMenus = async (req, res) => {
  try {
    const role = req.user.role

    const menus = await Menu.find(
      {
        role: role,
      },
      {
        role: 0,
        'children.role': 0,
      }
    )

    const menuCount = await Menu.countDocuments({
      role: role,
    })

    return res.status(200).json({
      success: true,
      menus: menus,
      totalCount: menuCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = getMenus
