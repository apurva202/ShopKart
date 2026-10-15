import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import api from "../services/api";
import { Heart, ShoppingBag, AlertCircle, Check } from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/wishlist");
      if (res.data && res.data.success) {
        setWishlist(res.data.wishlist);
      } else {
        setError(res.data?.message || "Failed to load wishlist");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(
        err.response?.data?.message ||
          "Could not load your wishlist. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId, productName) => {
    setRemovingIds((prev) => new Set(prev).add(productId));
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data && res.data.success) {
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
        showToast(`Removed "${productName}" from wishlist`);
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    } finally {
      setRemovingIds((prev) => {
        const s = new Set(prev);
        s.delete(productId);
        return s;
      });
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 pt-8 pb-12 box-border">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="m-0 font-serif text-[2.4rem] font-bold text-stone-900 tracking-tight leading-none">
            My Wishlist
          </h1>
          <p className="m-0 mt-2 text-[0.95rem] text-stone-500">
            Products you've saved for later.
          </p>
          {!loading && !error && wishlist.length > 0 && (
            <p className="m-0 mt-3 text-[0.85rem] font-semibold text-stone-700">
              {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse"
              >
                <div className="w-full bg-stone-200 rounded-xl aspect-4/3" />
                <div className="mt-4">
                  <div className="h-3.5 bg-stone-200 rounded w-3/4 mb-2" />
                  <div className="h-4.5 bg-stone-200 rounded w-1/2 mb-2" />
                  <div className="h-2.5 bg-stone-200 rounded w-[35%]" />
                </div>
                <div className="mt-5 h-9.5 bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl px-8 py-12 text-center max-w-120 mx-auto flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle size={26} />
            </div>
            <h2 className="m-0 text-[1.1rem] font-bold text-stone-900">
              Something went wrong
            </h2>
            <p className="m-0 text-sm text-stone-500">{error}</p>
            <button
              type="button"
              onClick={fetchWishlist}
              className="mt-2 bg-amber-700 text-white border-none px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-amber-800 transition-colors font-inherit"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl px-8 py-16 text-center max-w-130 mx-auto flex flex-col items-center gap-4 shadow-sm my-auto">
            <div className="w-20 h-20 rounded-full bg-amber-50 border border-stone-200 flex items-center justify-center text-amber-700">
              <Heart size={36} strokeWidth={1.5} />
            </div>
            <h2 className="m-0 font-serif text-[1.75rem] font-bold text-stone-900">
              Your wishlist is empty
            </h2>
            <p className="m-0 text-[0.9rem] text-stone-500 max-w-[320px]">
              Save products you love and find them here later.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-2 bg-amber-700 text-white border-none px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer flex items-center gap-2 hover:bg-amber-800 transition-colors font-inherit"
            >
              <ShoppingBag size={17} strokeWidth={2.2} />
              Browse Products
            </button>
          </div>
        )}

        {/* Wishlist grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                isRemoving={removingIds.has(product._id)}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-stone-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 text-sm font-medium">
          <Check size={16} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <footer className="text-center px-4 py-8 mt-auto">
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
    </div>
  );
};

export default Wishlist;
