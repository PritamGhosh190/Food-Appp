const AuthButton = require('../../../models/AuthButton')

const updateAuthButton = async (req, res) => {
  try {
    const authButton = await AuthButton.findByIdAndUpdate(req.params.authButtonId, req.body)

    if (!authButton) {
      return res.status(404).json({
        message: 'AuthButton not found'
      })
    }

    return res.status(200).json({
      message: 'AuthButton updated successfully',
      // authButton
    })

  } catch (err) {
    return res.status(500).json({
      message: 'Unable to update authButton',
      error: err.message
    })
  }
}

module.exports = updateAuthButton