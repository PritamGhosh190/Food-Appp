const LOT = require('../../../models/LOT')
const mongoose = require('mongoose')

const getLOTs = async (req, res) => {
  try {
    const lot = await LOT.find(
      {_id: req.params.lotId},
    )
    res.json(lot[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).json({error: 'Failed to retrieve lots'})
  }
}

module.exports = getLOTs
