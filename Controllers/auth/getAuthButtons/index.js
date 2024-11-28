const e = require('express')
const AuthButton = require('../../../models/AuthButton')

const getAuthButtons = async (req, res) => {
  try {
    const role = req.user.role
    const authButtons = await AuthButton.find({
      role: role,
    })

    const authButtonCount = await AuthButton.countDocuments()

    const buttonsMap = {}

    authButtons.forEach((item) => {
      const name = item.name
      const buttonsList = item.buttonsList

      const buttonNames = buttonsList.map((button) => {
        const hasRole = button.role.includes(role)

        if (hasRole) {
          return button.name
        } else {
          return null
        }
      })

      buttonsMap[name] = buttonNames
    })
    //remove null values
    
    for (const key in buttonsMap) {
      buttonsMap[key] = buttonsMap[key].filter((item) => item !== null)
    }

    return res.status(200).json({
      success: true,
      authButtons: buttonsMap,
      totalCount: authButtonCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = getAuthButtons
