const LOT = require('../../../models/LOT')
const mongoose = require('mongoose')

const getLOTs = async (req, res) => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.params.patientId)
    const lots = await LOT.find({patient: patientId})
    // .populate(
    //   'patient'
    // )
    res.json(lots)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({error: 'Failed to retrieve lots'})
  }
}

module.exports = getLOTs
