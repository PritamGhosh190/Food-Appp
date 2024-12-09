const e = require("express")
const { userRegister } = require("../../auth")
require('dotenv').config();
const superagent = require('superagent');


const addUser = async (req, res) => {
  try {
  // console.log("hjgvsgvgvgx============>",req.body);

    const role = req.body.role
// const apiUrl = 'https://api.opencagedata.com/geocode/v1/json?q=Kolkata&key=66f574589d3940dc8b1fd4184a05918f';
if(req.body.address)
{
  const url=`${process.env.GEOLOCATIONURL}${req.body.address}${process.env.APIKEY}`
  const response =await superagent.get(`${process.env.GEOLOCATIONURL}${req.body.address}${process.env.APIKEY}`);
  // console.log("url======================result==========================",response);
  const resp = response.body;
  if (resp.results && resp.results.length >= 1) {
    req.body.lat = resp.results[resp.results.length - 1].geometry.lat;
    req.body.lng = resp.results[resp.results.length - 1].geometry.lng;
    console.log("Latitude:", req.body.lat, "Longitude:", req.body.lng);
} else {
  return res.status(402).json({
    message: 'Inappropiate address try to enter proper address',
    status:false
  })
}
}
    const user = {
      mobileNumber: req.body.mobileNumber,
      password: req.body.password,
      email: req.body.email,
      name: req.body.name,
      Dob:req.body.dateofBirth,
      address:req.body.address,
      gender:req.body.gender,
      role:req.body.role,
      lat:req.body.lat,
      lng:req.body.lng,
      
    }
    console.log("ccfgcgxgxxg",user)

    await userRegister(user, role, res)
  }catch (err) {
    console.log("cgfcfcgbctd",err);
    
    return res.status(500).json({
      message: 'Unable to add user',
      error: err.message
    })
  }
}

module.exports = addUser