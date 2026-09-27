const Product = require("../models/product.model");
const mongoose = require("mongoose");

// Task 2: Create Product API (POST /products)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate presence of required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, price, category, image, and stock are required",
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    // Validate price > 0
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number greater than 0",
      });
    }

    // Validate stock >= 0
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a valid non-negative number",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Task 3 & Task 5: Get All Products with Search, Category Filter & Sorting (GET /products)
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // Task 5: Case-insensitive search on name
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Task 5: Category filtering
    if (
      category &&
      category.trim() !== "" &&
      category.toLowerCase() !== "all" &&
      category.toLowerCase() !== "all categories"
    ) {
      query.category = category.trim();
    }

    // Bonus: Sorting
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Task 4: Get Single Product by ID (GET /products/:id)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
