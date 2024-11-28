const Patient = require('../../../models/Patient')
const moment = require('moment');

const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params
    
    const dateFields = [
      'dob',
      'date_of_last_follow_up',
      'date_of_hpe_diagnosis',
      'small_cell_transformation_date',
    ]

    dateFields.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = moment(req.body[field], 'DD/MM/YYYY').toISOString();
      }
    });

    
    const patient = await Patient.findOneAndUpdate(
      {_id: patientId},
      {$set: req.body},
    )

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Patient not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      patient,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = updatePatient
