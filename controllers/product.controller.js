const Product = require("../models/product.model");

const searchAndSortProducts = async (req, res) => {
  try {
    const query = {};

    const search = req.query.name || "";
    const colorFilter = req.query.color || "";
    const companyFilter = req.query.company || "";
    const headphoneTypeFilter = req.query.headphoneType || "";
    const sortBy = req.query.sortBy || "";
    const priceMin = req.query.priceMin ? Number(req.query.priceMin) : 0;
    const priceMax = req.query.priceMax
      ? Number(req.query.priceMax)
      : Number.MAX_SAFE_INTEGER;

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (colorFilter) {
      query.color = { $regex: colorFilter, $options: "i" };
    }

    if (companyFilter) {
      query.company = { $regex: companyFilter, $options: "i" };
    }

    if (headphoneTypeFilter) {
      query.headphoneType = { $regex: headphoneTypeFilter, $options: "i" };
    }

    query.price = {
      $gte: priceMin,
      $lte: priceMax,
    };

    let sortOptions = {};

    switch (sortBy) {
      case "lowestPrice":
        sortOptions = { price: 1 };
        break;
      case "highestPrice":
        sortOptions = { price: -1 };
        break;
      case "aToZ":
        sortOptions = { name: 1 };
        break;
      case "zToA":
        sortOptions = { name: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("searchAndSortProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching and sorting products",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("getProductById error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching product details",
    });
  }
};

module.exports = {
  searchAndSortProducts,
  getProductById,
};