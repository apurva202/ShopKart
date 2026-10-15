const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");

// All order endpoints are protected by authentication
router.use(protect);

// Create order / checkout (supports both POST /orders and POST /orders/create-payment-order)
router.post("/", createPaymentOrder);
router.post("/create-payment-order", createPaymentOrder);

// Payment verification and failure callbacks
router.post("/verify-payment", verifyPayment);
router.post("/payment-failed", handlePaymentFailure);

// Status progression bonus endpoint
router.patch("/:id/status", updateOrderStatus);

// Orders retrieval
router.get("/", getUserOrders);
router.get("/:id", getOrderById);

module.exports = router;
