const bcrypt = require("bcryptjs");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../../models/User");
const Otp = require("../../../models/Otp");
const superagent = require("superagent");
const generateOtp = require("../../../config/generateOtp");
const sendSms = require("../../../config/sendSms");
const { SECRET, TOKEN_EXPIRATION } = require("../../../config");

const MSG = {
  usernameNotExist: "Username is not found. Invalid login credentials.",
  wrongRole: "Please make sure this is your identity.",
  loginSuccess: "You are successfully logged in.",
  wrongPassword: "Incorrect password.",
  loginError: "Oops! Something went wrong.",
};

const username = process.env.TWILIO_ACCOUNT_USERNAME; // Replace with your Twilio Account SID
const password = process.env.TWILIO_AUTH_TOKEN; // Replace with your Twilio Auth Token
const serviceSid = process.env.TWILIO_ACCOUNT_SID;

const otpGenerate1 = async (req, res) => {
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

const otpVerify1 = async (userRequest, res) => {
  try {
    let { mobileNumber, otp } = userRequest;
    let user = await User.findOne({ mobileNumber });

    const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
    const requestBody = {
      To: `+91${mobileNumber}`,
      Code: otp,
    };

    superagent
      .post(url)
      .auth(username, password) // Basic Auth
      .send(requestBody)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .then((response) => {
        const twilioResponse = response.body;
        const statusCode = response.status; // Get HTTP status code

        // ✅ Check if Twilio response status is between 200 and 210
        if (twilioResponse.status === "approved") {
          // Generate JWT token

          if (!user) {
            const newUser = new User({
              mobileNumber,
            });
            newUser
              .save()
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
                  // { expiresIn: "7 days" }
                );

                let result = {
                  mobileNumber: savedUser.mobileNumber,
                  role: savedUser.role,
                  email: savedUser.email,
                  id: savedUser._id,
                  token: token,
                  userDetails: savedUser,
                  // expiresIn: TOKEN_EXPIRATION,
                };

                return res.status(202).json({
                  ...result,
                  message: MSG.loginSuccess,
                  success: true,
                });
              })
              .catch((err) => {
                console.error("Error saving new user:", err.message);
                return res.status(401).json({
                  reason: "server",
                  message: err.message,
                  success: false,
                });
              });
          } else {
            let token = jwt.sign(
              {
                user_id: user._id,
                role: user.role,
                mobileNumber: user.mobileNumber,
                email: user.email,
              },
              process.env.SECRET,
              // { expiresIn: "7 days" }
            );

            let result = {
              mobileNumber: user.mobileNumber,
              role: user.role,
              email: user.email,
              id: user._id,
              token: token,
              userDetails: user,
              // expiresIn: TOKEN_EXPIRATION,
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
            twilioStatus: statusCode,
          };
        }
      })
      .catch((err) => {
        console.log("jjjj", err);

        // ✅ Catch any Twilio API errors, network errors, or invalid OTP
        let statusCode = err.status || 500; // Default to 500 if no specific status
        let errorMessage = err.message || "Failed to verify OTP";

        return res.status(statusCode).json({
          reason: err.reason || "third-party",
          message: errorMessage,
          success: false,
          twilioStatus: err.twilioStatus || null,
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

const otpGenerate = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber)
      return res.status(400).json({ message: "Mobile number is required" });

    const phone = `+91${mobileNumber}`;

    // Rate limit: block if OTP sent in last 1 min
    const recentOtp = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    // if (
    //   recentOtp
    //   // Date.now() - new Date(recentOtp.createdAt).getTime() < 60 * 1000
    // ) {
    //   return res
    //     .status(429)
    //     .json({ message: "Wait 60 seconds before requesting new OTP" });


    // Clear previous entries
    await Otp.deleteMany({ phone });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    await Otp.create({ phone, otp, expiresAt });

    await sendSms(mobileNumber, otp); // pass last 10-digit number

    return res
      .status(200)
      .json({ message: "OTP sent successfully", success: true });
  } catch (err) {
    console.log("err", err);
    return res
      .status(500)
      .json({ message: err.message || "OTP send failed", success: false });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const phone = `+91${mobileNumber}`;

    const record = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    if (!record)
      return res
        .status(400)
        .json({ message: "OTP not found or expired", success: false });

    if (record.isUsed)
      return res
        .status(400)
        .json({ message: "OTP already used", success: false });
    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired", success: false });

    if (record.attempts >= 3) {
      await Otp.deleteMany({ phone });
      return res.status(403).json({
        message: "Max attempts exceeded. Request new OTP",
        success: false,
      });
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({
        message: `Incorrect OTP. ${3 - record.attempts} attempt(s) left.`,
        success: false,
      });
    }

    // OTP is correct
    record.isUsed = true;
    await record.save();
    // await Otp.deleteMany({ phone }); // Clean all old OTPs

    // Check user or create new
    let user = await User.findOne({ mobileNumber });
    if (!user) {
      user = await User.create({ mobileNumber });
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        role: user.role,
        mobileNumber: user.mobileNumber,
        email: user.email,
      },
      SECRET,
      // { expiresIn: TOKEN_EXPIRATION || "7d" }
    );

    return res.status(202).json({
      token,
      userDetails: user,
      mobileNumber,
      // expiresIn: TOKEN_EXPIRATION || "7d",
      message: "Login successful",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "OTP verification failed",
      success: false,
    });
  }
};

module.exports = {
  otpGenerate,
  otpVerify,
};
