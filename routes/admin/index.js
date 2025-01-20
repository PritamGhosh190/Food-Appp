const router = require('express').Router()
const {
  getUsers,
  getSellers
} = require('../../Controllers/admin')

const {
  addUser,
} = require('../../Controllers/users/index')

router.get('/', async (req, res) => {
  return res.status(200).json({type: 'admin', user: serializeUser(req.user)})
})

router.get('/getUsers', async (req, res) => {
  // console.log("nbhsgbjbchbduyhcgbujdsbvyuhb");
  await getUsers(req,res);
})

router.get('/getsellers', async (req, res) => {
  console.log("nbhsgbjbchbduyhcgbujdsbvyuhb");
  await getSellers(req,res);
})

router.post('/addUser', async (req, res) => {
  console.log("nbhsgbjbchbduyhcgbujdsbvyuhb");
  await addUser(req, res)
})

module.exports = router
