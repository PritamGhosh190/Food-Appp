const Coupon = require("../../../models/Coupon");
const Order = require("../../../models/Billing");

// ✅ Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📄 Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔍 Get single coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update a coupon by ID
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ message: "Coupon updated", coupon });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ❌ Delete a coupon by ID
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🎯 Get coupon by code (for frontend to apply)
exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon)
      return res.status(404).json({ message: "Coupon not found or inactive" });
    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkCouponApplicability = async (req, res) => {
  try {
    // console.log("reqeste body", req.body,"hhhhhhhhhhhhhhhhh1", req.user);

    const { couponId, orderAmount } = req.body;
    const userId = req.user.userId;

    if (!couponId || !userId || !orderAmount) {
      console.log("reqeste body", req.body, "hhhhhhhhhhhhhhhh2", req.user);

      return res
        .status(400)
        .json({ message: "couponId, userId and orderAmount are required" });
    }

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      console.log("reqeste body", req.body, "hhhhhhhhhhhhhhhhh3", req.user);

      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      console.log("reqeste body", req.body, "hhhhhhhhhhhhhhhh4", req.user);

      return res.status(400).json({ message: "Coupon is not active" });
    }

    if (coupon.expiry && new Date() > coupon.expiry) {
      console.log("reqeste body", req.body, "hhhhhhhhhhhhhhhhh5", req.user);

      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      console.log("reqeste body", req.body, "hhhhhhhhhhhhhhhhh6", req.user);

      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    // Order count check for user (for first/third order etc.)
    if (coupon.orderNumberCondition) {
      const userOrderCount = await Order.countDocuments({ userId });
      if (userOrderCount + 1 !== coupon.orderNumberCondition) {
        return res.status(400).json({
          message: `Coupon is only valid for your ${
            coupon.orderNumberCondition
          }${getOrdinalSuffix(coupon.orderNumberCondition)} order`,
        });
      }
    }

    // Discount calculation
    let discount = 0;
    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;
    }

    const finalAmount = orderAmount - discount;

    res.status(200).json({
      message: "Coupon is applicable",
      discount,
      finalAmount,
      couponCode: coupon.code,
    });
  } catch (error) {
    console.log("errror", error);

    res.status(500).json({ message: error.message });
  }
};

// Helper: Add ordinal suffix (1st, 2nd, 3rd...)
function getOrdinalSuffix(n) {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}
