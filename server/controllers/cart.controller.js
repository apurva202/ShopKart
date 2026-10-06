const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock === 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const qtyToAdd = Math.max(1, Number(req.body?.quantity) || 1);
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity + qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} units available`,
        });
      }
      existingItem.quantity += qtyToAdd;
    } else {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock})`,
        });
      }
      customer.cart.push({ product: productId, quantity: qtyToAdd });
    }

    await customer.save();
    await customer.populate("cart.product");

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: customer.cart,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate(
      "cart.product"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Filter out nulls in case a referenced product was deleted from DB
    const validCart = customer.cart.filter((item) => item.product !== null);
    if (validCart.length !== customer.cart.length) {
      customer.cart = validCart;
      await customer.save();
    }

    res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const numQty = Number(quantity);
    if (!Number.isInteger(numQty) || numQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer of at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (numQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity cannot exceed available stock (${product.stock})`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const item = customer.cart.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    item.quantity = numQty;
    await customer.save();
    await customer.populate("cart.product");

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: customer.cart,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

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

    const initialLength = customer.cart.length;
    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (customer.cart.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    await customer.save();
    await customer.populate("cart.product");

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: customer.cart,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
};
