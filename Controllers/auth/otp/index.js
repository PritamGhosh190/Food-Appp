const bcrypt = require("bcryptjs");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require("../../../models/User");
const superagent = require('superagent');
const { SECRET, TOKEN_EXPIRATION } = require("../../../config");


const MSG = {
    usernameNotExist: "Username is not found. Invalid login credentials.",
    wrongRole: "Please make sure this is your identity.",
    loginSuccess: "You are successfully logged in.",
    wrongPassword: "Incorrect password.",
    loginError: "Oops! Something went wrong.",
};

const username = process.env.TWILIO_ACCOUNT_USERNAME; // Replace with your Twilio Account SID
const password = process.env.TWILIO_AUTH_TOKEN;  // Replace with your Twilio Auth Token
const serviceSid = process.env.TWILIO_ACCOUNT_SID;


const otpGenerate = async (userRequest, res) => {
    // console.log("reqdata111",userRequest);
    try {
        let { mobileNumber } = userRequest;
        let user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({
                reason: "username",
                message: MSG.usernameNotExist,
                success: false,
            });
        }
        const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
        const requestBody = {
            To:`+91${mobileNumber}`, // Replace with the recipient's phone number
            Channel: 'sms'     // or 'call' for voice verification
        };

        superagent
            .post(url)
            .auth(username, password) // Basic Auth
            .send(requestBody)
            .set('Content-Type', 'application/x-www-form-urlencoded') // Required for Twilio API
            .then(response => {
                // console.log('Success:', response.body);
                return res.status(200).json({
                    message: "Otp Sent Successfully",
                    success: true,
                });

            })


    } catch (err) {
        // console.log("bhbhhb",err);
        return res.status(500).json({
            reason: "server",
            message: errorMsg,
            success: false,
        });
    }
};

const otpVerify = async (userRequest, res) => {
    // console.log("reqdata111",userRequest);
    try {

        let { mobileNumber, otp } = userRequest;
        let user = await User.findOne({ mobileNumber });
        // console.log("users",user);
        if (!user) {
            return res.status(404).json({
                reason: "username",
                message: MSG.usernameNotExist,
                success: false,
            });
        }

        const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
        const requestBody = {
            To:`+91${mobileNumber}`, // Replace with the recipient's phone number
            Code: otp    // or 'call' for voice verification
        };

        superagent
            .post(url)
            .auth(username, password) // Basic Auth
            .send(requestBody)
            .set('Content-Type', 'application/x-www-form-urlencoded') // Required for Twilio API
            .then(response => {

                // Sign in the token and issue it to the user
                let token = jwt.sign(
                    {
                        user_id: user._id,
                        role: user.role,
                        mobileNumber: user.mobileNumber,
                        email: user.email,
                    },
                    process.env.SECRET
                    ,
                    { expiresIn: "7 days" }
                );

                let result = {
                    mobileNumber: user.mobileNumber,
                    role: user.role,
                    email: user.email,
                    id: user._id,
                    token: token,
                    expiresIn: TOKEN_EXPIRATION,
                };

                return res.status(200).json({
                    ...result,
                    message: MSG.loginSuccess,
                    success: true,
                });
            })
    } catch (err) {
        // console.log("bhbhhb",err);
        let errorMsg = MSG.loginError;
        if (err.isJoi === true) {
            err.status = 403;
            errorMsg = err.message;
        }
        return res.status(500).json({
            reason: "server",
            message: errorMsg,
            success: false,
        });
    }
};


module.exports = {
    otpGenerate,
    otpVerify
};
