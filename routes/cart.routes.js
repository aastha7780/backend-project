const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");

const {
  addToCart,
  getAllCartItems,
  cartItemCount,
  updateCartItemQuantity,
  deleteCartItem,
} = require("../controllers/cart.controller");

router.post("/add", verifyToken, addToCart);
router.get("/getall", verifyToken, getAllCartItems);
router.get("/count", verifyToken, cartItemCount);
router.patch("/update/:cartItemId", verifyToken, updateCartItemQuantity);
router.delete("/delete/:cartItemId", verifyToken, deleteCartItem);

module.exports = router;