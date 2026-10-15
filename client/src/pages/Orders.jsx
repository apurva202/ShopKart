import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  Package,
  ShoppingBag,
  Calendar,
  MapPin,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/orders");
      if (res.data && res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setError("Unable to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-8 py-8 box-border">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="m-0 font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            My Orders
          </h1>
          <p className="m-0 mt-1 text-sm text-stone-500">
            Review and track all your previous purchases.
          </p>
        </div>

        {/* ── Loading Skeletons ── */}
        {loading && (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs animate-pulse"
              >
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-4" />
                <div className="h-16 bg-stone-100 rounded-xl mb-4" />
                <div className="h-4 bg-stone-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto flex flex-col items-center gap-3">
            <AlertCircle size={36} className="text-red-600" />
            <h2 className="m-0 font-serif text-xl font-bold text-stone-900">
              Unable to load orders
            </h2>
            <p className="m-0 text-sm text-stone-500">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="mt-2 bg-amber-700 text-white border-none px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-amber-800 transition-colors font-inherit"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl px-8 py-16 text-center max-w-md mx-auto flex flex-col items-center gap-3 shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-1">
              <Package size={34} strokeWidth={1.8} />
            </div>
            <h2 className="m-0 font-serif text-xl sm:text-2xl font-bold text-stone-900">
              No orders found
            </h2>
            <p className="m-0 text-sm text-stone-500 max-w-70">
              You haven't placed any orders yet. Discover our latest items!
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-3 bg-amber-700 text-white border-none px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer flex items-center gap-2 hover:bg-amber-800 transition-colors font-inherit"
            >
              <ShoppingBag size={16} strokeWidth={2.2} />
              <span>Start Shopping</span>
            </button>
          </div>
        )}

        {/* ── Orders List ── */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Order Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Package size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-stone-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                        <Calendar size={13} />
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

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : order.status === "SHIPPED"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : order.status === "CONFIRMED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : order.status === "PLACED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.status === "PENDING_PAYMENT"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status) ? (
                        <CheckCircle size={12} strokeWidth={2.5} />
                      ) : (
                        <Clock size={12} strokeWidth={2.5} />
                      )}
                      <span>{order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Items List in Order */}
                <div className="divide-y divide-stone-100 my-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-13 h-13 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="m-0 font-medium text-sm text-stone-900 truncate">
                            {item.name}
                          </p>
                          <p className="m-0 text-xs text-stone-500 mt-0.5">
                            Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <span className="font-semibold text-sm text-stone-900 shrink-0">
                        ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Card Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <MapPin size={14} className="text-stone-400" />
                    <span>
                      Deliver to: <strong className="text-stone-700 font-semibold">{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.city}, {order.shippingAddress?.pincode})
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-stone-500">Total: </span>
                      <span className="font-bold text-base text-stone-900">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <Link
                      to={`/order-success/${order._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-amber-700 transition-colors no-underline"
                    >
                      <span>Receipt</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
