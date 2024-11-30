const router = require('express').Router()
const {userAuth, checkRole, serializeUser} = require('../Controllers/auth')
const {ROLE} = require('../config/roles')
const passport = require('passport')


router.get('/', (req, res) => {
  res.send('Api running...')
})
router.use(
  '/users',
  // userAuth,
  // checkRole([ROLE.admin, ROLE.user, ROLE.seller]),
  require('./users')
)
router.use(
  '/food',require('./food')
)
router.use('/restaurant',userAuth,checkRole(["user","admin","seller"]),require('./restaurant')
)

// Authentication Router Middleware
router.use('/auth', require('./auth'))

// Admin Protected Route
// router.use('/admin', userAuth, checkRole([ROLE.admin]), require('./admin'))

// Admin & Operator Protected Route
// router.use(
//   '/patients',
//   userAuth,
//   checkRole([ROLE.admin, ROLE.operator]),
//   require('./patients')
// )


// router.use(
//   '/charts',
//   userAuth,
//   checkRole([ROLE.admin, ROLE.analytics]),
//   require('./charts')
// )

// // Admin & Operator Protected Route
// router.use('/menu', require('./menu'))

router.use('/roles', userAuth, checkRole([ROLE.admin]), require('./roles'))

module.exports = router
