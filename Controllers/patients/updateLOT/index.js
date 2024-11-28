const LOT = require('../../../models/LOT')
const moment = require('moment')

const updateLOT = async (req, res) => {
  try {
    const { lotId, patientId } = req.params
    
    const dateFields = [
      'date_of_start_of_treatment',
      'date_of_progression',
    ]

    dateFields.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = moment(req.body[field], 'DD/MM/YYYY').toISOString()
      }
    })

    const lot = await LOT.findOneAndUpdate(
      {_id: lotId},
      {$set: req.body},
      {new: true}
    )

    if (!lot) {
      return res.status(400).json({
        success: false,
        message: 'LOT not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'LOT updated successfully',
      lot,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = updateLOT
