const router = require('express').Router()
const {userAuth, checkRole, serializeUser,userAuth1} = require('../Controllers/auth')
// const {ROLE} = require('../config/roles')
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
  '/food',userAuth,require('./food')
)
router.use('/restaurant',userAuth,require('./restaurant')
)

router.use('/billing',userAuth,require('./billing')
)


router.use('/restaurantAuth',userAuth1,require('./restaurant')
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

// router.use('/roles', userAuth, checkRole(["admin"]), require('./roles'))

module.exports = router
