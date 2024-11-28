
const Patient = require('../../../models/Patient');
const moment = require('moment')

const addPatient = async (req, res) => {
  try {

    const dateFields = [
      'dob',
      'date_of_last_follow_up',
      'date_of_hpe_diagnosis',
      'small_cell_transformation_date',
    ]

    dateFields.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = moment(req.body[field], 'DD/MM/YYYY').toISOString()
      }
    })

    const patient = new Patient(req.body)

    await patient.save()
    return res.status(200).json({
      message: 'Patient added successfully',
      patient
    })
  }catch (err) {
    return res.status(500).json({
      message: 'Unable to add patient',
      error: err.message
    })
  }
}
 
module.exports = addPatient
