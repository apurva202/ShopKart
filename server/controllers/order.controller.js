const crypto = require("crypto");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const razorpay = require("../config/razorpay");

/**
 * POST /orders/create-payment-order
 * Validates shipping address and cart stock, calculates server-side total,
 * creates pending ShopKart order and Razorpay order, returns checkout credentials.
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address fields
    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.addressLine1?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
    }

    const cleanPincode = shippingAddress.pincode.trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits",
      });
    }

    const cleanPhone = shippingAddress.phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a valid 10-digit number",
      });
    }

    // 2. Load authenticated user's fresh cart
    const customer = await Customer.findById(req.user._id);
    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // 3. Load latest product documents and verify stock & pricing
    const orderItems = [];
    let calculatedTotal = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products in your cart no longer exist",
        });
      }

      // Check stock
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
      }

      // Snapshot product info
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      calculatedTotal += product.price * cartItem.quantity;
    }

    // 4. Create pending ShopKart order
    const shopKartOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: cleanPhone,
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: cleanPincode,
      },
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await shopKartOrder.save();

    // 5. Create Razorpay Order (amount in paise)
    const amountInPaise = Math.round(calculatedTotal * 100);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString(),
      });
    } catch (rzpErr) {
      console.error("Razorpay order creation error:", rzpErr);
      return res.status(500).json({
        success: false,
        message: "Failed to initiate payment with Razorpay",
        error: rzpErr.error?.description || rzpErr.message,
      });
    }

    // Link Razorpay Order ID to ShopKart order
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // Return checkout details (cart is NOT cleared here)
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error creating payment order:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error creating order",
    });
  }
};

/**
 * POST /orders/verify-payment
 * Verifies Razorpay HMAC SHA256 signature, marks order PAID,
 * updates inventory stock, and clears user's cart.
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !shopKartOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    // 1. Find ShopKart order and verify ownership
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot verify an order that does not belong to you",
      });
    }

    // Prevent duplicate verification
    if (order.status === "PLACED" || order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order has already been verified and placed",
        order,
      });
    }

    // 2. Cryptographic signature verification using Node's crypto
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      order.status = "PENDING_PAYMENT"; // Never place order on failed payment
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 3. Verify stock availability one final time before decrementing
    for (const item of order.items) {
      const prod = await Product.findById(item.product);
      if (!prod || prod.stock < item.quantity) {
        order.paymentStatus = "FAILED";
        order.status = "PENDING_PAYMENT";
        await order.save();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`,
        });
      }
    }

    // 4. Deduct purchased quantity from product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 5. Update order status to PAID and PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 6. Clear user cart ONLY after verified payment
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error verifying payment",
    });
  }
};

/**
 * POST /orders/payment-failed
 * Records payment failure when reported by frontend or gateway.
 * Keeps status as PENDING_PAYMENT (order is NOT placed) and marks paymentStatus as FAILED.
 * Cart remains untouched.
 */
const handlePaymentFailure = async (req, res) => {
  try {
    const { shopKartOrderId, errorReason } = req.body;

    if (!shopKartOrderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this order",
      });
    }

    // Only update if not already paid
    if (order.paymentStatus !== "PAID") {
      order.paymentStatus = "FAILED";
      order.status = "PENDING_PAYMENT";
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: "Order payment marked as failed",
      order,
    });
  } catch (err) {
    console.error("Error handling payment failure:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to record payment failure",
    });
  }
};

/**
 * GET /orders
 * Retrieves orders belonging to the authenticated customer (newest first).
 * By default, returns only placed orders (status in PLACED, CONFIRMED, SHIPPED, DELIVERED, paymentStatus: PAID)
 * so abandoned or failed checkout attempts are not displayed as placed orders.
 */
const getUserOrders = async (req, res) => {
  try {
    const filter = { user: req.user._id };

    // Unless includeAll=true is explicitly requested, only return completed/placed orders
    if (req.query.includeAll !== "true") {
      filter.status = { $in: ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"] };
      filter.paymentStatus = "PAID";
    }

    const orders = await Order.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/**
 * GET /orders/:id
 * Retrieves a single order by ID, enforcing ownership.
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/**
 * PATCH /orders/:id/status
 * Bonus (+10 Marks): Updates order progression status (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to update this order",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};

