const router = require("express").Router();
const {
  getAllCheckouts,
  createCheckout,
  createCashCheckout,
  getOneCheckout,
  verifyPayment,
} = require("../controllers/checkOut.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/create", verifyToken, createCheckout);      // Razorpay order create
router.post("/cash", verifyToken, createCashCheckout);    // Cash on delivery
router.post("/verify", verifyToken, verifyPayment);       // Razorpay verify
router.get("/getall", verifyToken, getAllCheckouts);
router.get("/getone/:id", verifyToken, getOneCheckout);

module.exports = router;