const e = require("express")
const { userRegister } = require("../../auth")

const addUser = async (req, res) => {
  try {
    const role = req.body.role
    
    const user = {
      mobileNumber: req.body.mobileNumber,
      password: req.body.password,
      email: req.body.email,
      name: req.body.name,
      Dob:req.body.dateofBirth,
      address:req.body.address,
      gender:req.body.gender,
      role:req.body.role,
    }
    console.log("ccfgcgxgxxg",user)

    await userRegister(user, role, res)
  }catch (err) {
    return res.status(500).json({
      message: 'Unable to add user',
      error: err.message
    })
  }e
}

module.exports = addUser