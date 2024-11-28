const Menu = require('../../../models/Menu')

const addMenu = async (req, res) => {
  try {
    
    const menu = new Menu(req.body)

    await menu.save()
    return res.status(200).json({
      message: 'Menu added successfully',
      // menu
    })
  }catch (err) {
    return res.status(500).json({
      message: 'Unable to add menu',
      error: err.message
    })
  }
}
 
module.exports = addMenu