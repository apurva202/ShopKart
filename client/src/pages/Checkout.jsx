import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalItems, subtotal, loading: cartLoading, clearCartState } = useCart();
  const { user } = useAuth();

  const isOrderPlacedRef = useRef(false);

  const hasOutOfStock = cart.some(
    (item) => item.product?.stock === 0 || item.quantity > item.product?.stock
  );

  // Shipping Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Guard: If cart is empty on initial checkout load (not after successful order placed), redirect to /cart
  useEffect(() => {
    if (!isOrderPlacedRef.current && !cartLoading && (!cart || cart.length === 0)) {
      navigate("/cart", { replace: true });
    }
  }, [cartLoading, cart, navigate]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for that field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError(null);
  };

  // Client-side Validation (Task 3)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.phone = "Phone number must be a valid 10-digit number";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    const cleanPincode = formData.pincode.trim();
    if (!cleanPincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      newErrors.pincode = "Pincode must contain exactly 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Place Order / Pay with Razorpay Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    if (hasOutOfStock) {
      setServerError("One or more items in your cart are out of stock. Please return to your cart and update items before placing an order.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      // 1. Ensure Razorpay SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setServerError(
          "Unable to load Razorpay payment gateway. Please check your internet connection."
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Call backend to validate cart and create Razorpay order
      const res = await api.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || "Failed to create order");
      }

      const {
        shopKartOrderId,
        razorpayOrderId,
        amount,
        currency,
        key,
      } = res.data;

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: key,
        amount: amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${shopKartOrderId.slice(-6)}`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
          email: user?.email || "",
        },
        theme: {
          color: "#B45309", // Warm Amber theme
        },
        handler: async function (response) {
          // Send signature to backend for mandatory HMAC SHA256 verification
          try {
            const verifyRes = await api.post("/orders/verify-payment", {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data && verifyRes.data.success) {
              isOrderPlacedRef.current = true;
              // Clear global cart state in Context immediately
              clearCartState();
              // Navigate to Order Success page
              navigate(`/order-success/${shopKartOrderId}`, { replace: true });
            } else {
              setServerError("Payment signature verification failed. Your cart has not been cleared.");
              setIsSubmitting(false);
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setServerError(
              verifyErr.response?.data?.message ||
                "Payment verification failed. Your cart has not been cleared."
            );
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setServerError("Payment was cancelled. Your cart has not been cleared.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", async function (response) {
        console.error("Payment failed:", response.error);

        // Notify backend to mark order as FAILED (order is NOT placed)
        try {
          await api.post("/orders/payment-failed", {
            shopKartOrderId,
            errorReason: response.error?.description || "Payment failed",
          });
        } catch (failErr) {
          console.error("Failed to record payment failure:", failErr);
        }

        setServerError(
          response.error?.description
            ? `Payment failed: ${response.error.description}. Your cart has not been cleared. Please try again.`
            : "Payment failed. Your cart has not been cleared. Please try again."
        );
        setIsSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error("Checkout order error:", err);
      setServerError(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate order. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
            <p className="text-sm font-medium text-stone-500">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 box-border">
        {/* Back to cart link */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors no-underline"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>
        </div>

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="m-0 font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Checkout
          </h1>
          <p className="m-0 mt-1 text-sm text-stone-500">
            Please enter your shipping address and complete your purchase.
          </p>
        </div>

        {/* Server error alert banner */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 font-medium leading-relaxed">
              {serverError}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Shipping Details Form (7 cols) ── */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-stone-200">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Truck size={17} strokeWidth={2} />
              </div>
              <div>
                <h2 className="m-0 text-base font-bold text-stone-900">
                  Shipping Address
                </h2>
                <p className="m-0 text-xs text-stone-500">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none transition-colors ${
                    errors.fullName
                      ? "border-red-600 focus:border-red-600"
                      : "border-stone-200 focus:border-amber-700"
                  }`}
                />
                {errors.fullName && (
                  <p className="m-0 mt-1 text-xs text-red-600 font-medium">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none transition-colors ${
                    errors.phone
                      ? "border-red-600 focus:border-red-600"
                      : "border-stone-200 focus:border-amber-700"
                  }`}
                />
                {errors.phone && (
                  <p className="m-0 mt-1 text-xs text-red-600 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Street Address / Flat No. <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. 104 Greenfield Residency, MG Road"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none transition-colors ${
                    errors.addressLine1
                      ? "border-red-600 focus:border-red-600"
                      : "border-stone-200 focus:border-amber-700"
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="m-0 mt-1 text-xs text-red-600 font-medium">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* City and State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none transition-colors ${
                      errors.city
                        ? "border-red-600 focus:border-red-600"
                        : "border-stone-200 focus:border-amber-700"
                    }`}
                  />
                  {errors.city && (
                    <p className="m-0 mt-1 text-xs text-red-600 font-medium">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    State <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none transition-colors ${
                      errors.state
                        ? "border-red-600 focus:border-red-600"
                        : "border-stone-200 focus:border-amber-700"
                    }`}
                  />
                  {errors.state && (
                    <p className="m-0 mt-1 text-xs text-red-600 font-medium">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pincode <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none transition-colors ${
                    errors.pincode
                      ? "border-red-600 focus:border-red-600"
                      : "border-stone-200 focus:border-amber-700"
                  }`}
                />
                {errors.pincode && (
                  <p className="m-0 mt-1 text-xs text-red-600 font-medium">
                    {errors.pincode}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* ── Right Column: Order Summary & Pay (5 cols) ── */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs sticky top-20">
            <h2 className="m-0 font-serif text-lg font-bold text-stone-900 mb-4">
              Order Summary
            </h2>

            {/* Cart items list snapshot */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1 mb-5 divide-y divide-stone-100">
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="m-0 font-medium text-xs sm:text-sm text-stone-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="m-0 text-xs text-stone-500 mt-0.5">
                        Qty: {item.quantity} × ₹{Number(item.product.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <span className="font-semibold text-xs sm:text-sm text-stone-900 shrink-0">
                    ₹{Number(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="flex flex-col gap-2.5 text-sm pt-4 border-t border-stone-200">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Items ({totalItems})</span>
                <span className="font-semibold text-stone-900">
                  ₹{Number(subtotal).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-600">Delivery</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="h-px bg-stone-200 my-1" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-stone-900">Total</span>
                <span className="font-bold text-xl text-stone-900 tracking-tight">
                  ₹{Number(subtotal).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || hasOutOfStock}
              className={`w-full mt-6 py-3.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-xs font-inherit transition-all border-none ${
                isSubmitting || hasOutOfStock
                  ? "bg-stone-300 cursor-not-allowed text-stone-500"
                  : "bg-amber-700 hover:bg-amber-800 cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Pay with Razorpay (₹{Number(subtotal).toLocaleString("en-IN")})</span>
                </>
              )}
            </button>

            {hasOutOfStock && (
              <p className="m-0 mt-2 text-xs text-red-600 text-center font-medium">
                Please return to your cart and remove out-of-stock items before checkout.
              </p>
            )}

            {/* Trust badge */}
            <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-center gap-4 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-bit Secure</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-amber-700" />
                <span>Test Mode</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
