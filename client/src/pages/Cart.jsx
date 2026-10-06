import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";
import {
  ShoppingBag,
  AlertCircle,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, error, totalItems, subtotal, updateQuantity, removeFromCart, refreshCart } =
    useCart();

  const hasOutOfStock = cart.some(
    (item) => item.product.stock === 0 || item.quantity > item.product.stock
  );

  // Per-item loading — Set of productIds currently being updated
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const setUpdating = (productId, value) => {
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const handleIncrease = async (productId, currentQty) => {
    setUpdating(productId, true);
    try {
      await updateQuantity(productId, currentQty + 1);
    } catch (err) {
      console.error("Failed to increase quantity:", err);
    } finally {
      setUpdating(productId, false);
    }
  };

  const handleDecrease = async (productId, currentQty) => {
    setUpdating(productId, true);
    try {
      await updateQuantity(productId, currentQty - 1);
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
    } finally {
      setUpdating(productId, false);
    }
  };

  const handleRemove = async (productId) => {
    setUpdating(productId, true);
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setUpdating(productId, false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] h-screen flex flex-col font-sans text-[#1C1917] overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 pt-6 pb-6 box-border flex flex-col min-h-0">

        {/* Page header */}
        <div className="mb-4 shrink-0">
          <h1 className="m-0 font-serif text-2xl sm:text-[1.75rem] font-bold text-[#1C1917] tracking-tight leading-none">
            Your Cart
          </h1>
          {!loading && !error && cart.length > 0 && (
            <p className="m-0 mt-1.5 text-xs sm:text-sm text-[#78716C] font-normal">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="flex flex-col gap-4 max-w-2xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E5DED5] p-5 flex gap-4 animate-pulse"
              >
                <div className="w-28 h-28 bg-[#E7E5E4] rounded-2xl shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-[#E7E5E4] rounded w-2/3 mb-2" />
                  <div className="h-3 bg-[#E7E5E4] rounded w-1/4 mb-3" />
                  <div className="h-4 bg-[#E7E5E4] rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div className="bg-white border border-[#FECACA] rounded-2xl p-8 text-center max-w-md mx-auto flex flex-col items-center gap-3">
            <AlertCircle size={36} className="text-[#DC2626]" />
            <h2 className="m-0 font-serif text-xl font-bold text-[#1C1917]">
              Unable to load your cart
            </h2>
            <p className="m-0 text-sm text-[#78716C]">{error}</p>
            <button
              type="button"
              onClick={refreshCart}
              className="mt-2 bg-[#B45309] text-white border-none px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-[#92400E] transition-colors font-inherit"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && cart.length === 0 && (
          <div className="bg-white border border-[#E5DED5] rounded-3xl px-8 py-14 text-center max-w-130 mx-auto flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] my-auto">
            <div className="w-16 h-16 rounded-full bg-[#FEF3E2] border border-[#E5DED5] flex items-center justify-center text-[#B45309] mb-1">
              <ShoppingCart size={28} strokeWidth={1.8} />
            </div>
            <h2 className="m-0 font-serif text-[1.65rem] font-bold text-[#1C1917]">
              Your cart is empty
            </h2>
            <p className="m-0 text-[0.9rem] text-[#78716C] max-w-[320px]">
              Looks like you haven't added anything yet.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-3 bg-[#B45309] text-white border-none px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer flex items-center gap-2 hover:bg-[#92400E] transition-colors font-inherit"
            >
              <ShoppingBag size={16} strokeWidth={2.2} />
              <span>Browse Products</span>
            </button>
          </div>
        )}

        {/* ── Cart content: items + summary ── */}
        {!loading && !error && cart.length > 0 && (
          <div className="flex gap-8 items-start flex-1 min-h-0">

            {/* Left — Items list (Only this scrolls) */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-y-auto pr-3 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E5DED5] [&::-webkit-scrollbar-thumb]:rounded-full">
              {cart.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  isUpdating={updatingIds.has(item.product._id)}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Right — Order summary */}
            <div className="w-80 shrink-0 bg-white border border-[#E5DED5] rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              <h2 className="m-0 font-serif text-lg font-bold text-[#1C1917] mb-4">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#57534E]">Items ({totalItems})</span>
                  <span className="font-semibold text-[#1C1917]">
                    ₹{Number(subtotal).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#57534E]">Subtotal</span>
                  <span className="font-semibold text-[#1C1917]">
                    ₹{Number(subtotal).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="h-px bg-[#E5DED5] my-1" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm sm:text-base text-[#1C1917]">Total</span>
                  <span className="font-bold text-base sm:text-lg text-[#1C1917] tracking-tight">
                    ₹{Number(subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={hasOutOfStock}
                className={`w-full mt-5 py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm font-inherit transition-colors border-none ${
                  hasOutOfStock
                    ? "bg-[#D6D3D1] text-[#78716C] cursor-not-allowed shadow-none"
                    : "bg-[#B45309] hover:bg-[#92400E] text-white cursor-pointer"
                }`}
              >
                <ShoppingBag size={17} strokeWidth={2.2} />
                <span>Proceed to Checkout</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </button>

              {hasOutOfStock && (
                <p className="m-0 mt-2 text-xs text-[#DC2626] text-center font-medium">
                  Please remove out-of-stock items to checkout
                </p>
              )}

              {/* Trust Badges */}
              <div className="mt-6 flex flex-col gap-3.5 pt-5 border-t border-[#E5DED5]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FEF3E2] flex items-center justify-center text-[#B45309] shrink-0">
                    <Truck size={17} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="m-0 text-xs font-semibold text-[#1C1917]">Free delivery</p>
                    <p className="m-0 text-[0.75rem] text-[#78716C]">On orders above ₹499</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FEF3E2] flex items-center justify-center text-[#B45309] shrink-0">
                    <ShieldCheck size={17} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="m-0 text-xs font-semibold text-[#1C1917]">Secure checkout</p>
                    <p className="m-0 text-[0.75rem] text-[#78716C]">Your data is protected</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FEF3E2] flex items-center justify-center text-[#B45309] shrink-0">
                    <RotateCcw size={17} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="m-0 text-xs font-semibold text-[#1C1917]">Easy returns</p>
                    <p className="m-0 text-[0.75rem] text-[#78716C]">7-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {(!cart || cart.length === 0) && (
        <footer className="text-center px-4 py-8 mt-auto shrink-0">
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 max-w-20 h-px bg-black" />
            <p className="m-0 italic text-black text-[0.9rem]">
              &ldquo;Good things, closer to you.&rdquo;
            </p>
            <div className="flex-1 max-w-20 h-px bg-black" />
          </div>
          <p className="m-0 mt-1 text-black text-[0.78rem] font-medium">
            — ShopKart
          </p>
        </footer>
      )}
    </div>
  );
};

export default Cart;
