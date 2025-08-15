const router = require("express").Router();
const {
  userAuth,
  checkRole,
  serializeUser,
} = require("../../Controllers/auth");

const {
  addUser,
  getUser,
  updateUser,
  removeUser,
  getUsers,
  address,
  coupon,
} = require("../../Controllers/users/index");

router.get("/", async (req, res) => {
  return res.send("User service running...");
});

router.post("/add", async (req, res) => {
  // console.log("bgcfgcxfgdcxdxg123");
  await addUser(req, res);
});

router.post("/addAddress", userAuth, async (req, res) => {
  // console.log("bgcfgcxfgdcxdxg123");
  await address.addAddress(req, res);
});
router.get("/address", userAuth, async (req, res) => {
  // console.log("bgcfgcxfgdcxdxg123");
  await address.getUserAddresses(req, res);
});

router.get("/user", async (req, res) => {
  await getUser(req, res);
});

router.post("/get-users", async (req, res) => {
  await getUsers(req, res);
});

router.put("/update/:userId", async (req, res) => {
  await updateUser(req, res);
});

router.delete("/delete/:userId", async (req, res) => {
  await removeUser(req, res);
});

router.post("/coupon", coupon.createCoupon);
router.get("/coupon", coupon.getAllCoupons);
router.get("/allCoupon", coupon.getCoupons);
router.get("/coupon/:id", coupon.getCouponById);
router.put("/coupon/:id", coupon.updateCoupon);
router.delete("/coupon/:id", coupon.deleteCoupon);

// extra: get coupon by code for applying checkCouponApplicability
router.get("/code/:code", coupon.getCouponByCode);

router.post("/coupon/checkEligibility", userAuth, async (req, res) => {
  // console.log("bgcfgcxfgdcxdxg123");
  await coupon.checkCouponApplicability(req, res);
});

module.exports = router;
