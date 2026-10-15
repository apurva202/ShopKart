import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data && res.data.success) {
          setOrder(res.data.order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
            <p className="text-sm font-medium text-stone-500">Loading order confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900">
        <Navbar />
        <div className="flex-1 max-w-lg w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
            Unable to Load Order
          </h2>
          <p className="text-sm text-stone-500 mb-6">{error || "Order not found"}</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-2.5 rounded-xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 transition-colors border-none cursor-pointer"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 font-semibold text-sm hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "PAID" && order.status !== "PENDING_PAYMENT";
  const isFailed = order.paymentStatus === "FAILED";

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 box-border">
        {/* Header Status Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center mb-6">
          {isPaid ? (
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} strokeWidth={2.2} />
            </div>
          ) : isFailed ? (
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={36} strokeWidth={2.2} />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Loader2 size={36} strokeWidth={2.2} className="animate-spin text-amber-600" />
            </div>
          )}

          <h1 className="m-0 font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {isPaid
              ? "Order Placed Successfully!"
              : isFailed
              ? "Payment Failed — Order Not Placed"
              : "Payment Pending — Order Incomplete"}
          </h1>
          <p className="m-0 mt-2 text-sm text-stone-500 max-w-md mx-auto">
            {isPaid
              ? "Thank you for your purchase. We are preparing your order."
              : isFailed
              ? "Your payment could not be processed. Your cart items have not been cleared and no order was placed."
              : "This order is waiting for payment confirmation. If you did not complete payment, your cart items are still saved."}
          </p>

          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-stone-500">
            <div>
              <span className="text-stone-400">Order ID: </span>
              <span className="font-mono font-semibold text-stone-900">{order._id}</span>
            </div>
            <div>
              <span className="text-stone-400">Payment: </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isPaid
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : isFailed
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-stone-400">Status: </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isPaid
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : isFailed
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-stone-400" />
              <span>
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <h2 className="m-0 text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-200">
            Order Items
          </h2>

          <div className="divide-y divide-stone-100 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 font-semibold text-sm text-stone-900 truncate">
                      {item.name}
                    </p>
                    <p className="m-0 text-xs text-stone-500 mt-0.5">
                      Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <span className="font-bold text-sm text-stone-900 shrink-0">
                  ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-stone-200 text-xs sm:text-sm">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-2">
                <MapPin size={15} className="text-amber-700" />
                <span>Delivery Address</span>
              </div>
              <p className="m-0 text-stone-600 leading-relaxed">
                {order.shippingAddress?.fullName}
                <br />
                {order.shippingAddress?.addressLine1}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                <br />
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>

            <div className="flex flex-col justify-end items-start sm:items-end">
              <span className="text-xs text-stone-500">
                {isPaid ? "Total Amount Paid" : "Order Total"}
              </span>
              <span className="font-bold text-2xl text-stone-900 tracking-tight mt-1">
                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </span>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isPaid
                    ? "bg-amber-50 text-amber-700"
                    : isFailed
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {isPaid
                  ? "Paid via Razorpay"
                  : isFailed
                  ? "Payment Failed"
                  : "Payment Unconfirmed"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isPaid ? (
            <>
              <Link
                to="/orders"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors no-underline shadow-sm"
              >
                <Package size={17} />
                <span>View My Orders</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/products"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-900 font-semibold text-sm flex items-center justify-center gap-2 transition-colors no-underline"
              >
                <ShoppingBag size={17} />
                <span>Continue Shopping</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors no-underline shadow-sm"
              >
                <ShoppingBag size={17} />
                <span>Return to Cart</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/products"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-900 font-semibold text-sm flex items-center justify-center gap-2 transition-colors no-underline"
              >
                <Package size={17} />
                <span>Browse Products</span>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
