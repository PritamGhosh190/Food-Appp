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


const otpGenerate = async (req, res) => {
    try {
        let { mobileNumber } = req.body;
        // let user = await User.findOne({ mobileNumber });

        // if (!user) {
        //     return res.status(404).json({
        //         reason: "username",
        //         message: MSG.usernameNotExist,
        //         success: false,
        //     });
        // }

        const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
        const requestBody = {
            To: `+91${mobileNumber}`, // Recipient's phone number
            Channel: "sms", // 'sms' or 'call' for voice verification
        };

        superagent
            .post(url)
            .auth(username, password) // Basic Auth
            .send(requestBody)
            .set("Content-Type", "application/x-www-form-urlencoded") // Required for Twilio API
            .then((response) => {
                const statusCode = response.status; // Get HTTP status code

                // ✅ Check if Twilio API responded successfully (200–210)
                if (statusCode >= 200 && statusCode <= 210) {
                    return res.status(200).json({
                        message: "OTP Sent Successfully",
                        success: true,
                    });
                } else {
                    // ✅ If Twilio returns an unexpected status, throw an error
                    throw {
                        status: statusCode,
                        reason: "twilio",
                        message: "Failed to send OTP, please try again.",
                    };
                }
            })
            .catch((err) => {
                // ✅ Catch any errors from Twilio API, network, or request issues
                let statusCode = err.status || 500;
                let errorMessage = err.message || "Failed to send OTP";

                return res.status(statusCode).json({
                    reason: err.reason || "third-party",
                    
                    message: errorMessage,
                    success: false,
                });
            });

    } catch (err) {
        // ✅ Catch server-side errors, request validation issues, or unexpected failures
        let errorMsg = err.message || "Internal Server Error";
        let statusCode = err.status || 500;

        return res.status(statusCode).json({
            reason: "server",
            message: errorMsg,
            success: false,
        });
    }
};


const otpVerify = async (userRequest, res) => {
    try {
        let { mobileNumber, otp } = userRequest;
        let user = await User.findOne({ mobileNumber });



        const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
        const requestBody = {
            To: `+91${mobileNumber}`,
            Code: otp
        };

        superagent
            .post(url)
            .auth(username, password) // Basic Auth
            .send(requestBody)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then(response => {
                const twilioResponse = response.body;
                const statusCode = response.status; // Get HTTP status code

                // ✅ Check if Twilio response status is between 200 and 210
                if (twilioResponse.status === "approved") {
                    // Generate JWT token

                    if (!user) {
                        const newUser = new User({
                            mobileNumber,
                        });
                        newUser.save()
                            .then((savedUser) => {
                                // console.log('New user created successfully.', savedUser);
                                let token = jwt.sign(
                                    {
                                        user_id: savedUser._id,
                                        role: savedUser.role,
                                        mobileNumber: savedUser.mobileNumber,
                                        email: savedUser.email,
                                    },
                                    process.env.SECRET,
                                    { expiresIn: "7 days" }
                                );

                                let result = {
                                    mobileNumber: savedUser.mobileNumber,
                                    role: savedUser.role,
                                    email: savedUser.email,
                                    id: savedUser._id,
                                    token: token,
                                    userDetails: savedUser,
                                    expiresIn: TOKEN_EXPIRATION,
                                };

                                return res.status(202).json({
                                    ...result,
                                    message: MSG.loginSuccess,
                                    success: true,
                                });
                            })
                            .catch(err => {
                                console.error('Error saving new user:', err.message);
                                return res.status(401).json({
                                    reason: "server",
                                    message: err.message,
                                    success: false,
                                });
                            });
                    }

                    else {
                        let token = jwt.sign(
                            {
                                user_id: user._id,
                                role: user.role,
                                mobileNumber: user.mobileNumber,
                                email: user.email,
                            },
                            process.env.SECRET,
                            { expiresIn: "7 days" }
                        );

                        let result = {
                            mobileNumber: user.mobileNumber,
                            role: user.role,
                            email: user.email,
                            id: user._id,
                            token: token,
                            userDetails: user,
                            expiresIn: TOKEN_EXPIRATION,
                        };

                        return res.status(202).json({
                            ...result,
                            message: MSG.loginSuccess,
                            success: true,
                        });
                    }
                } else {
                    // ✅ If OTP verification fails, throw an error to be caught in `.catch()`
                    throw {
                        status: 400,
                        reason: "otp",
                        message: "Invalid or expired OTP",
                        twilioStatus: statusCode
                    };
                }
            })
            .catch(err => {
                // ✅ Catch any Twilio API errors, network errors, or invalid OTP
                let statusCode = err.status || 500; // Default to 500 if no specific status
                let errorMessage = err.message || "Failed to verify OTP";

                return res.status(statusCode).json({
                    reason: err.reason || "third-party",
                    message: errorMessage,
                    success: false,
                    twilioStatus: err.twilioStatus || null
                });
            });

    } catch (err) {
        // ✅ Catch server-side errors, request validation issues, or unexpected errors
        let errorMsg = err.message || MSG.loginError;
        let statusCode = err.status || 500; // Default to 500 if no specific status

        return res.status(statusCode).json({
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
