const AuthButton = require('../../../models/AuthButton')

const addAuthButton = async (req, res) => {
  try {
    const authButton = new AuthButton(req.body)

    await authButton.save()
    return res.status(200).json({
      message: 'AuthButton added successfully',
      // authButton
    })
  }catch (err) {
    return res.status(500).json({
      message: 'Unable to add authButton',
      error: err.message
    })
  }
}

module.exports = addAuthButton