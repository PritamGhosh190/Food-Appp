const AuthButton = require('../../../models/AuthButton')

const removeAuthButton = async (req, res) => {
  try {
    const authButton = await AuthButton.findByIdAndDelete(req.params.authButtonId)

    if (!authButton) {
      return res.status(404).json({
        message: 'AuthButton not found'
      })
    }
    return res.status(200).json({
      message: 'AuthButton deleted successfully'
    })

  } catch (err) {
    return res.status(500).json({
      message: 'Unable to delete authButton',
      error: err.message
    })
  }
}

module.exports = removeAuthButton