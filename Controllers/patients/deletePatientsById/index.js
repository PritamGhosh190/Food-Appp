const Patient = require('../../../models/Patient')
const LOT = require('../../../models/LOT')
const mongoose = require('mongoose')

const deletePatientsById = async (req, res) => {
  try {
    const { patientIds } = req.body

    const ids = patientIds.map((id) => new mongoose.Types.ObjectId(id))
    
    const patients = await Patient.updateMany(
      { _id: { $in: ids } },
      { $set: { is_deleted: true } }
    )

    if (!patients)
      return res.status(404).json({success: false, error: 'Patient not found'})

    return res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = deletePatientsById
