const router = require('express').Router()

const {
  pieChart,
} = require('../../Controllers/charts/index')

router.get('/', async (req, res) => {
  return res.send('Chart Data service running...')
})

router.post('/pie-chart', async (req, res) => {
  // console.log("hhdfbchuf",req.body);
  await pieChart(req, res)
})

module.exports = router
