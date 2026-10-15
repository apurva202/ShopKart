const Customer = require("../models/customer.model");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const registerCustomer = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Phone must be exactly 10 numeric digits",
      });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 6 characters",
      });
  }

  try {
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    generateToken(res, customer._id);

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProfile = async (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json(req.user);
};

const logoutCustomer = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
};
