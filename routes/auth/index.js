const router = require('express').Router()
// const {ROLE} = require('../../config/roles')
// Bring in the User Registration function
const {
  userAuth,
  userLogin,
  checkRole,
  userRegister,
  serializeUser,
  addAuthButton,
  getAuthButtons,
  updateAuthButton,
  removeAuthButton,
} = require('../../Controllers/auth/index')

router.get('/', async (req, res) => {
  return res.send('Auth service running...')
})

// Admin Registration Route
router.post('/signup-admin', async (req, res) => {
  await userRegister(req.body, ROLE.admin, res)
})

router.post('/signup-operator', async (req, res) => {
  await userRegister(req.body, ROLE.operator, res)
})

router.post('/signup-analytics', async (req, res) => {
  await userRegister(req.body, ROLE.analytics, res)
})

router.post('login-operator', async (req, res) => {
  await userLogin(req.body, ROLE.operator, res)
})

router.post('login-analytics', async (req, res) => {
  await userLogin(req.body, ROLE.analytics, res)
})

// Admin Login Route
router.post('/login-admin', async (req, res) => {
  await userLogin(req.body, ROLE.admin, res)
})

router.post('/login', async (req, res) => {
  // console.log("reqdata",req.body);
  const {role} = req.body
  await userLogin(req.body, role, res)
})

router.post(
  '/add-auth-button',
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    await addAuthButton(req, res)
  }
)

router.get('/get-auth-buttons', userAuth, async (req, res) => {
  await getAuthButtons(req, res)
})

router.post(
  '/update-auth-button/:authButtonId',
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    await updateAuthButton(req, res)
  }
)

router.delete(
  '/delete-auth-button/:authButtonId',
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    await removeAuthButton(req, res)
  }
)

// Super Admin Protected Route
router.get(
  '/admin-protected',
  userAuth,
  checkRole(["admin"]),
 async (req, res) => {
    return res.json('Hello Super Admin')
  }
)

// Admin Protected Route
router.get(
  '/operator-protected',
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json('Hello Admin')
  }
)

// User Protected Route
router.get(
  '/analytics-protected',
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json('Hello User')
  }
)

module.exports = router
