const CartItem = require("../models/cart.model");
const Product = require("../models/product.model");

const addToCart = async (req, res) => {
  try {
    const userId = req.user;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid productId and quantity are required",
      });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let existingItem = await CartItem.findOne({ userId, productId });

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      await existingItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart quantity updated successfully",
        cartItem: existingItem,
      });
    }

    const cartItem = await CartItem.create({
      userId,
      productId,
      quantity: Number(quantity),
    });

    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      cartItem,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
    });
  }
};

const getAllCartItems = async (req, res) => {
  try {
    const userId = req.user;

    const cartItems = await CartItem.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (error) {
    console.error("getAllCartItems error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting cart items",
    });
  }
};

const cartItemCount = async (req, res) => {
  try {
    const userId = req.user;

    const cartItems = await CartItem.find({ userId });
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("cartItemCount error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting cart count",
    });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cartItem = await CartItem.findOne({ _id: cartItemId, userId });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    cartItem.quantity = Number(quantity);
    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cartItem,
    });
  } catch (error) {
    console.error("updateCartItemQuantity error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating cart item quantity",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user;
    const { cartItemId } = req.params;

    const deletedItem = await CartItem.findOneAndDelete({
      _id: cartItemId,
      userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error("deleteCartItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting cart item",
    });
  }
};

module.exports = {
  addToCart,
  getAllCartItems,
  cartItemCount,
  updateCartItemQuantity,
  deleteCartItem,
};