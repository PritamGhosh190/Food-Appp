const router = require('express').Router()

const {
  addUser,
  getUser,
  updateUser,
  removeUser,
  getUsers
} = require('../../Controllers/users/index')

router.get('/', async (req, res) => {
  return res.send('User service running...')
})

router.post('/add', async (req, res) => {
  console.log("bgcfgcxfgdcxdxg123");
  await addUser(req, res)
})

router.get('/user', async (req, res) => {
  await getUser(req, res)
})

router.post('/get-users', async (req, res) => {
  await getUsers(req, res)
})

router.post('/update/:userId', async (req, res) => {
  await updateUser(req, res)
})

router.delete('/delete/:userId', async (req, res) => {
  await removeUser(req, res)
})

module.exports = router
