const mongoose = require('mongoose')
const Patient = require('../../../models/Patient')

const getPatientById = async (req, res) => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.params.patientId)

    const patient = await Patient.aggregate([
      {
        $lookup: {
          from: 'lots',
          localField: '_id',
          foreignField: 'patient',
          as: 'lots',
        },
      },
      {
        $lookup: {
          from: 'progressiveData',
          localField: '_id',
          foreignField: 'patient',
          as: 'progressiveData',
        },
      },
      {
        $match: {
          _id: patientId,
        },
      },
    ])

    if (patient[0].is_new) {
      const patient = await Patient.updateOne(
        {_id: patientId},
        {$set: {is_new: false}}
      )
    }

    if (!patient)
      return res.status(404).json({success: false, error: 'Patient not found'})
    return res.status(200).json({
      success: true,
      patient: patient[0],
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = getPatientById
