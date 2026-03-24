const Checkout = require("../models/checkout.model");
const Cart = require("../models/cart.model");
const Razorpay = require("razorpay");
const crypto = require("crypto");

let instance = null;

if (process.env.keyId && process.env.keySecret) {
  instance = new Razorpay({
    key_id: process.env.keyId,
    key_secret: process.env.keySecret,
  });
}

const getAllCheckouts = async (req, res) => {
  try {
    const userId = req.user;

    const checkouts = await Checkout.find({ userId })
      .populate(
        "items.productId",
        "name price imageUrl company color headphoneType"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      checkouts,
    });
  } catch (error) {
    console.error("getAllCheckouts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createCheckout = async (req, res) => {
  try {
    if (!instance) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const { totalPrice } = req.body;

    if (!totalPrice || Number(totalPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid totalPrice is required",
      });
    }

    const options = {
      amount: Number(totalPrice) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    return res.status(201).json({
      success: true,
      order_id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error("createCheckout error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createCashCheckout = async (req, res) => {
  try {
    const userId = req.user;
    const { items, totalPrice, customerName, shippingAddress, paymentMethod } =
      req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    if (!totalPrice || Number(totalPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid totalPrice is required",
      });
    }

    if (!customerName || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "customerName, shippingAddress and paymentMethod are required",
      });
    }

    const checkout = new Checkout({
      userId,
      items,
      totalPrice,
      customerName,
      shippingAddress,
      paymentMethod,
      status: "Processing",
      paymentStatus: paymentMethod === "cash" ? "Pending" : "Paid",
      razorpayOrderId: "",
      razorpayPaymentId: "",
    });

    const savedCheckout = await checkout.save();

    await Cart.deleteMany({ userId });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      checkout: savedCheckout,
    });
  } catch (error) {
    console.error("createCashCheckout error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const userId = req.user;

    if (!process.env.keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret is not configured",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkoutData,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !checkoutData
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const checkout = new Checkout({
      userId,
      items: checkoutData.items || [],
      totalPrice: checkoutData.totalPrice,
      customerName: checkoutData.customerName,
      shippingAddress: checkoutData.shippingAddress,
      paymentMethod: checkoutData.paymentMethod,
      status: "Processing",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "Paid",
    });

    const savedCheckout = await checkout.save();

    await Cart.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Payment verified and checkout saved successfully",
      checkout: savedCheckout,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOneCheckout = async (req, res) => {
  try {
    const userId = req.user;
    const checkoutId = req.params.id;

    const checkout = await Checkout.findOne({
      _id: checkoutId,
      userId,
    }).populate(
      "items.productId",
      "name price imageUrl company color headphoneType"
    );

    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: "Checkout not found",
      });
    }

    return res.status(200).json({
      success: true,
      checkout,
    });
  } catch (error) {
    console.error("getOneCheckout error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllCheckouts,
  createCheckout,
  createCashCheckout,
  verifyPayment,
  getOneCheckout,
};