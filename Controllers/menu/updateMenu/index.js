const Menu = require('../../../models/Menu')

const updateMenu = async (req, res) => {
  const {_id: menuId, path, element, meta, children} = req.body

  try {
    const updatedMenu = await Menu.findByIdAndUpdate(
      menuId,
      {
        path,
        element,
        meta,
        children,
      },
      {new: true}
    )

    if (!updatedMenu) {
      res.status(404).json({error: 'Menu item not found'})
    } else {
      res.status(200).json({
        message: 'Menu updated successfully',
        updatedMenu,
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: 'Unable to update menu',
      error: err.message,
    })
  }
}

module.exports = updateMenu
