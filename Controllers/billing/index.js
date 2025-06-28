const User = require("../../models/User");
const FoodBilling = require("../../models/Billing");
const Restaurant = require("../../models/Restaurant");
const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const { log } = require("async");
// const Restaurant = require('../models/restaurant');
require("dotenv").config();

// Create a new food bill
exports.createFoodBill = async (req, res) => {
  try {
    const {
      restaurantId,
      foodDetails,
      address,
      type,
      convenienceCharges,
      otherCharges,
      paymentStatus,
      totalAmount,
      grossAmount,
      CGST,
      SGST,
    } = req.body;
    // Create food bill
    const foodBill = new FoodBilling({
      userId: req.user.userId,
      ...req.body,
    });
    // console.log("njdjncnkcjc",req.body);

    await foodBill.save();
    await Cart.deleteMany({ user: req.user.userId });
    res
      .status(201)
      .json({ message: "Food Bill created successfully", data: foodBill });
  } catch (error) {
    // console.log("gjjkkfdhfdh",error);

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
function getFormattedDateTimeWithAMPM(dateString) {
  const date = new Date(dateString); // Create a Date object

  // Format the date
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so add 1
  const day = date.getDate().toString().padStart(2, "0");

  // Get the hours, and format for 12-hour clock
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Determine AM or PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12 (12:00 AM)

  // Combine both parts into a formatted string
  return `${year}-${month}-${day} ${hours
    .toString()
    .padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
}

// Get all food bills
//  = async (req, res) => {
//     // console.log("vjkddjvjkkjkjkjkj");

//     const userId=req.user.userId;
//     try {
//         const foodBills = await FoodBilling.find({ userId })
//         .populate('userId')  // Populate the userId field with the User document
//         .populate('restaurantId')  // Populate the restaurantId field with the Restaurant document
//         .populate('foodDetails.foodId')  // Populate the foodId field inside the foodDetails array
//         .populate('address')  // Populate the foodId field inside the foodDetails array
//         // .populate('coupon')
//         .exec();

//         console.log("err",foodBills);

//         const addUrl=process.env.IMAGEURL;

//         // const resFoodBills=foodBills.map((e)=>{
//         //     if (!e.restaurantId.image.startsWith(process.env.IMAGEURL)) {
//         //         // Prepend the base URL to the restaurant image only if it's missing
//         //         e.restaurantId.image = process.env.IMAGEURL +  e.restaurantId.image.replace(/\\+/g, '/');
//         //       } else {
//         //         // If it already has the base URL, just fix the slashes
//         //         e.restaurantId.image =  e.restaurantId.image.replace(/\\+/g, '/');
//         //       }
//         //     e.createdAt="abc"+e.createdAt;
//         //     let abc= getFormattedDateTimeWithAMPM(e.createdAt)
//         //     console.log(abc);
//         //     e.formattedCreatedAt = abc;
//         //     return e
//         // })

//     //   console.log("hiii hello",foodBills);
//         res.status(200).json({ status :true ,data: foodBills });
//     } catch (error) {
//         console.log("err",error);

//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

exports.getAllFoodBills = async (req, res) => {
  try {
    const userId = req.user.userId; // assuming req.user is available
    const baseUrl = process.env.IMAGEURL || "";

    const foodBills = await FoodBilling.find({ userId })
      .populate("userId")
      .populate("restaurantId")
      .populate("foodDetails.foodId")
      .populate("address")
      .sort({ createdAt: -1 }) // sort by createdAt descending
      .exec();

    const transformedBills = foodBills.map((bill) => {
      const billObj = bill.toObject();

      return {
        ...billObj,
        restaurantId: bill.restaurantId
          ? {
              ...bill.restaurantId.toObject(),
              image: bill.restaurantId.image
                ? baseUrl + bill.restaurantId.image
                : null,
            }
          : null,
        userId: bill.userId ? bill.userId.toObject() : null,
        address: bill.address ? bill.address.toObject() : null,
        foodDetails: Array.isArray(bill.foodDetails)
          ? bill.foodDetails.map((item) => {
              const foodObj = item.toObject();
              return {
                ...foodObj,
                foodId: foodObj.foodId
                  ? {
                      ...foodObj.foodId,
                      image: foodObj.foodId.image
                        ? baseUrl + foodObj.foodId.image
                        : null,
                    }
                  : null,
              };
            })
          : [],
      };
    });

    // Log last transformed bill safely
    if (transformedBills.length > 0) {
      // console.log(
      //     "Last Transformed Bill:",
      //     JSON.stringify(transformedBills[transformedBills.length - 1], null, 2)
      // );
    }

    // console.log("ghhgghjhjghjjh",transformedBills);

    return res.status(200).json({
      success: true,
      data: transformedBills,
    });
  } catch (error) {
    console.error("Error fetching food bills: ", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching food bills",
      error: error.message,
    });
  }
};

exports.getFoodBillings = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const {
      paymentStatus,
      deliveryStatus,
      type,
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filters = {};

    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (deliveryStatus) filters.deliveryStatus = deliveryStatus;
    if (type) filters.type = type;

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    // Seller: restrict to restaurant(s) assigned to them
    if (role === "seller") {
      const restaurants = await Restaurant.find({ assignUser: userId }).select(
        "_id"
      );
      const restaurantIds = restaurants.map((r) => r._id);
      filters.restaurantId = { $in: restaurantIds };
    }

    // Admin: no restaurant restriction

    const billings = await FoodBilling.find(filters)
      .populate("userId")
      .populate("restaurantId")
      .populate("address")
      .populate("foodDetails.foodId")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await FoodBilling.countDocuments(filters);

    // console.log("ghfggf", billings);

    res.status(200).json({
      data: billings,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      count: billings.length,
    });
  } catch (error) {
    console.error("Error in getFoodBillings:", error);
    res.status(500).json({
      message: "Failed to retrieve food billing records",
      error: error.message,
    });
  }
};

exports.updateFoodBilling = async (req, res) => {
  try {
    const { role, userId } = req.user;
    console.log("jfff", req.user);

    const { id } = req.params;
    const updateFields = req.body;

    const billing = await FoodBilling.findById(id);
    if (!billing) {
      return res.status(404).json({ message: "Food billing record not found" });
    }

    // Seller can only update their own restaurant's orders
    if (role === "seller") {
      const restaurant = await Restaurant.findOne({
        _id: billing.restaurantId,
        assignUser: userId,
      });

      if (!restaurant) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this order" });
      }
    }

    // Update allowed fields only
    const allowedFields = ["paymentStatus", "deliveryStatus", "deliveryTime"];

    allowedFields.forEach((field) => {
      if (field in updateFields) billing[field] = updateFields[field];
    });

    await billing.save();

    res.status(200).json({
      message: "Food billing updated successfully",
      data: billing,
    });
  } catch (error) {
    console.error("Error in updateFoodBilling:", error);
    res.status(500).json({
      message: "Failed to update food billing",
      error: error.message,
    });
  }
};
