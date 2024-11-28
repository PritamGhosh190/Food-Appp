const router = require('express').Router()

const {
  addRole,
  getRoles,
  updateRole,
  deleteRole,
} = require('../../Controllers/roles/index')

router.get('/', async (req, res) => {
  return res.send('Roles service running...')
})

router.post('/add-role', async (req, res) => {
  await addRole(req, res)
})

router.get('/get-roles', async (req, res) => {
  await getRoles(req, res)
})

router.post('/update-role/:roleId', async (req, res) => {
  await updateRole(req, res)
})

router.delete('/delete-role/:roleId', async (req, res) => {
  await deleteRole(req, res)
})

module.exports = router
