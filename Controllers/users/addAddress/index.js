// const e = require("express")
const { userRegister } = require("../../auth")
require('dotenv').config();
const superagent = require('superagent');
const UserAddress = require('../../../models/Address');
const Restaurant = require("../../../models/Restaurant")

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };


const addAddress1 = async (req, res) => {
    try {
        console.log("hjgvsgvgvgx============>",req.body);

        const role = req.user.role

        if(req.body.lat && req.body.lng){
            const newAddress = new UserAddress({
                mobilenum: req.body.mobileNumber,
                userId: req.user.userId,
                name: req.body.name,
                address: req.body.address,
                role: req.user.role,
                lat: req.body.lat,
                lng: req.body.lng,
    
            })
            const resturentData= await Restaurant.findById({_id:req.body.restaurant});

            const userLat = req.body.lat;
            const userLng = req.body.lng;
            const restaurantLat = resturentData.lat;
    
            const restaurantLng = resturentData.lng;
            // console.log("bhbcjhb bhbjb======================>>>", userLat, userLng, restaurantLat, restaurantLng);
        
        
            // Calculate distance between user and restaurant using Haversine formula
            const distance = haversineDistance(userLat, userLng, restaurantLat, restaurantLng).toFixed(2);
        
            // console.log("ccfgcgxgxxg", newAddress)
          await newAddress.save();
          return res.status(201).json({
            message: "Address added succesfully",
            distance,
            success: true,
            newAddress
          });
    
        }
        // const apiUrl = 'https://api.opencagedata.com/geocode/v1/json?q=Kolkata&key=66f574589d3940dc8b1fd4184a05918f';
        else if (req.body.address) {
            const url = `${process.env.GEOLOCATIONURL}${req.body.address}${process.env.APIKEY}`
                 const response = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.address}&key=${process.env.GOOGLEAPIKEY}`);
                 // console.log("url======================result==========================", dataType.results[0].geometry.location);
                 // console.log(`Location Latitude , Longitude = ${response.text.results[0]}`);
                 if(response.status === 200 ){
                   const dataType=JSON.parse(response.text);
                 if (dataType.results && dataType.results[0].geometry.location.lat && dataType.results[0].geometry.location.lng) {
                   req.body.lat = dataType.results[0].geometry.location.lat;
                   req.body.lng = dataType.results[0].geometry.location.lng;
                  //  console.log("Latitude:", req.body.lat, "Longitude:", req.body.lng);
                 } else {
                   return res.status(402).json({
                     message: 'Inappropiate address try to enter proper address',
                     status: false
                   })
                 }
               }
            const newAddress = new UserAddress({
                mobilenum: req.body.mobileNumber,
                userId: req.user.userId,
                name: req.body.name,
                address: req.body.address,
                role: req.user.role,
                lat: req.body.lat,
                lng: req.body.lng,
    
            })

            const resturentData= await Restaurant.findById({_id:req.body.restaurant});

            const userLat = req.body.lat;
            const userLng = req.body.lng;
            const restaurantLat = resturentData.lat;
    
            const restaurantLng = resturentData.lng;
            // console.log("bhbcjhb bhbjb======================>>>", userLat, userLng, restaurantLat, restaurantLng);
        
        
            // Calculate distance between user and restaurant using Haversine formula
            const distance = haversineDistance(userLat, userLng, restaurantLat, restaurantLng).toFixed(2);
        
            // console.log("ccfgcgxgxxg", newAddress)
          await newAddress.save();
          return res.status(201).json({
            message: "Address added succesfully",
            distance,
            success: true,
          });
    
        }
       
       
        
    } catch (err) {
        console.log("cgfcfcgbctd", err);

        return res.status(205).json({
            message: 'Unable to add user',
            error: err.message
        })
    }
}

const addAddress = async (req, res) => {
  try {

    const { mobileNumber, name, address, restaurant, type } = req.body;
    const role = req.user.role;
    const userId = req.user.userId;

    if (!type || !['delivery', 'dineIn', 'takeaway'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid or missing address type. Must be one of: delivery, dineIn, takeaway',
        success: false,
      });
    }

    let lat = req.body.lat;
    let lng = req.body.lng;

    // Handle delivery case with coordinates/address resolution
    if (type === 'delivery') {
      if (!lat || !lng) {
        if (!address) {
          return res.status(400).json({
            message: 'Address or latitude/longitude required for delivery type',
            success: false
          });
        }

        const geoURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLEAPIKEY}`;
        const response = await superagent.get(geoURL);
        const data = JSON.parse(response.text);

        if (response.status === 200 && data.results?.[0]?.geometry?.location) {
          lat = data.results[0].geometry.location.lat;
          lng = data.results[0].geometry.location.lng;
        } else {
          return res.status(422).json({
            message: 'Unable to resolve address to coordinates',
            success: false
          });
        }
      }
    } else {
      // For dineIn/takeaway, location fields must be null
      lat = null;
      lng = null;
    }

    const newAddress = new UserAddress({
      mobilenum: mobileNumber,
      userId,
      name,
      address: type === 'delivery' ? address : null,
      lat,
      lng,
      role,
      type,
    });

    // Calculate distance only for delivery
    let distance = null;
    if (type === 'delivery') {
      const restaurantData = await Restaurant.findById(restaurant);
      if (!restaurantData) {
        return res.status(404).json({ message: 'Restaurant not found', success: false });
      }

      const restaurantLat = restaurantData.lat;
      const restaurantLng = restaurantData.lng;

      // Haversine formula to calculate distance
      distance = haversineDistance(lat, lng, restaurantLat, restaurantLng).toFixed(2);
    }

    await newAddress.save();
    console.log("Received address payload:", req.body,"responses", newAddress,distance);

    return res.status(201).json({
      message: 'Address added successfully',
      success: true,
      newAddress,
      distance: distance || undefined,
    });

  } catch (err) {
    console.error('Address creation error:', err);
    return res.status(500).json({
      message: 'Unable to add address',
      error: err.message,
      success: false
    });
  }
};


module.exports = addAddress