const passport = require("passport");
const register = require("./register");
const login = require("./login");
require('dotenv').config(); 
const jwt = require("jsonwebtoken");

// const addAuthButton = require("./addAuthButton");
// const removeAuthButton = require('./removeAuthButton')
// const updateAuthButton = require('./updateAuthButton')
// const getAuthButtons = require("./getAuthButtons");

const userRegister = (userRequest, role, res) =>
  register(userRequest, role, res);

const userLogin = (userRequest,role, res) => login(userRequest,role, res);


const userAuth = async (req, res, next) => {
  try {
    const host = req.headers.host;
    const domainname = req.hostname;
    const token = req.headers.authorization.split(" ")[1];
    // console.log("bhxbhb",token,"gcgfcc",req.headers.authorization,host ,domainname);
    if (token == null) return res.sendStatus(401);
    // if (
    //   domainname != "localhost" &&
    //   host != "localhost:3006" &&
    //   host != "192.168.12.152:3010" &&
    //   host !="https://food-appp-keus.onrender.com" &&
    //   domainname !="https://food-appp-keus.onrender.com" &&
    //   domainname != "192.168.31.7" 
    // ) {
    // console.log( "I am here 1111111111=============================================>>>>>");

    //   return res.sendStatus(401);
    // } else {
    // console.log( "I am here 2222222=============================================>>>>>");
      const decoded =  jwt.verify(token, process.env.SECRET);
      const userId= decoded.user_id;
      const role =decoded.role
      // console.log("cfchghfxc",decoded,userId,role);
      req.user = { userId, role };
        next();
     
    
  } catch (error) {
    console.log( "hbhbchdbhx=============================================>>>>>",error);
    res.status(401).json({ code: 1, result: error, message: "Authentication failed" });
  }
};

const userAuth1 = async (req, res, next) => {
  try {
    const host = req.headers.host;
    const domainname = req.hostname;
    const token = req.headers.authorization.split(" ")[1];
    console.log("bhxbhb",host,"gcgfcc" ,domainname);
    console.log("bhxbhb111111111111111111111=======================================================>>>>",req);
    if (token == null) return res.sendStatus(401);
    if (
      domainname != "localhost" &&
      host != "localhost:3006" &&
      host != "192.168.12.152:3010" &&
      host !="https://food-appp-keus.onrender.com" &&
      domainname !="https://food-appp-keus.onrender.com" &&
      domainname != "192.168.31.7" 
    ) {
    console.log( "I am here 1111111111=============================================>>>>>");

      return res.sendStatus(401);
    } else {
    console.log( "I am here 2222222=============================================>>>>>");
      const decoded =  jwt.verify(token, process.env.SECRET);
      const userId= decoded.user_id;
      const role =decoded.role
      // console.log("cfchghfxc",decoded,userId,role);
      req.user = { userId, role };
        next();
    }
    
  } catch (error) {
    console.log( "hbhbchdbhx=============================================>>>>>",error);
    res.status(401).json({ code: 1, result: error, message: "Authentication failed" });
  }
};


// const userAuth = passport.authenticate("jwt", { session: false });

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
    lat:user.lat,
    lng:user.lng,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  };
};


module.exports = {
  userAuth,
  userAuth1,
  userLogin,
  userRegister,
  checkRole,
  serializeUser,
  // addAuthButton,
  // removeAuthButton,
  // updateAuthButton,
  // getAuthButtons,
};
