const router = require('express').Router()
const {ROLE} = require('../../config/roles')
const {
  userAuth,
  checkRole,
  serializeUser,
} = require('../../Controllers/auth/index')
const {
  addMenu,
  deleteMenu,
  getMenus,
  updateMenu,
} = require('../../Controllers/menu/index')

router.get('/', async (req, res) => {
  return res.send('Menu service running...')
})

router.post(
  '/add-menu',
  userAuth,
  checkRole([ROLE.admin]),
  async (req, res) => {
    await addMenu(req, res)
  }
)

router.get('/get-menus', userAuth, async (req, res) => {
  await getMenus(req, res)
})

router.put(
  '/update-menu',
  userAuth,
  checkRole([ROLE.admin]),
  async (req, res) => {
    await updateMenu(req, res)
  }
)

router.delete(
  '/delete-menu/:menuId',
  userAuth,
  checkRole([ROLE.admin]),
  async (req, res) => {
    await deleteMenu(req, res)
  }
)

module.exports = router
