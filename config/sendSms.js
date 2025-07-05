const superagent = require("superagent");

const sendSms = async (phone, otp) => {
  const url = "https://api.smartping.ai/fe/api/v1/send";
  const params = {
    username: "Bawarchi.trans",
    password: "cs7Gv",
    unicode: false,
    from: "BAWRCI",
    to: phone,
    dltPrincipalEntityId: "1301161198761696429",
    dltContentId: "1307161779166755773",
    text: `${otp} is your OTP to login to Bawarchi Restaurants Account`,
  };

  try {
    const response = await superagent.get(url).query(params);
    // console.log("SMS Sent:", response.body);
    return response.body;
  } catch (err) {
    console.error("SMS sending failed:", err.response?.body || err.message);
    // throw new Error("Failed to send OTP");
  }
};

module.exports = sendSms;
