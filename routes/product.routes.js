const router = require("express").Router();
const {
  searchAndSortProducts,
  getProductById,
} = require("../controllers/product.controller");

router.get("/getall", searchAndSortProducts);
router.get("/getone/:id", getProductById);

module.exports = router;