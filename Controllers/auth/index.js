const passport = require("passport");
const register = require("./register");
const login = require("./login");
// const addAuthButton = require("./addAuthButton");
// const removeAuthButton = require('./removeAuthButton')
// const updateAuthButton = require('./updateAuthButton')
// const getAuthButtons = require("./getAuthButtons");

const userRegister = (userRequest, role, res) =>
  register(userRequest, role, res);

const userLogin = (userRequest,role, res) => login(userRequest,role, res);

const userAuth = passport.authenticate("jwt", { session: false });

/**
 * Checks if the provided user role is included in the roles list
 * @param {Array} roles - list of accepted roles.
 * @const checkRole
 */
const checkRole = (roles) => (req, res, next) => {
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();
};

/**
 * returns json of user data.
 * @const serializeUser
 */
const serializeUser = (user) => {
  return {
    mobileNumber: user.mobileNumber,
    email: user.email,
    name: user.name,
    Dob:user.Dob,
    role:user.role,
    address:user.address,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  };
};


module.exports = {
  userAuth,
  userLogin,
  userRegister,
  checkRole,
  serializeUser,
  // addAuthButton,
  // removeAuthButton,
  // updateAuthButton,
  // getAuthButtons,
};
