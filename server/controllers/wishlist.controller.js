const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Task 2: Add Product to Wishlist (POST /wishlist/:productId)
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // 2. Validate product exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Find customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 4. Check for duplicate entries
    const alreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // 5. Add product reference and save
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Task 3: Get Current User's Wishlist (GET /wishlist)
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name description price category image stock",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Filter out null values in case any referenced product was deleted from DB
    const validWishlist = customer.wishlist.filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Task 4: Remove Product from Wishlist (DELETE /wishlist/:productId)
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 2. Check if product is currently in wishlist
    const productIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // 3. Remove product reference and save
    customer.wishlist.splice(productIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
