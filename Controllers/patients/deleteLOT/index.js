const LOT = require('../../../models/LOT')

const deleteLOT = async (req, res) => {
  try {
    const lotId = req.params.lotId
    const lot = await LOT.findByIdAndDelete(lotId)
    res.status(200).json({
      message: 'LOT deleted successfully',
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({error: 'Failed to delete lot'})
  }
}

module.exports = deleteLOT
