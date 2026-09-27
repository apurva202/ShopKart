import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  PackageX,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.product) {
          setProduct(res.data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        if (err.response && err.response.status === 404) {
          setError("Product not found");
        } else if (err.response && err.response.status === 400) {
          setError("Invalid product ID");
        } else {
          setError("Failed to load product details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    setToastMessage(`Added ${quantity}x "${product.name}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const isOutOfStock = product?.stock === 0;
  const isLowStock = product && product.stock > 0 && product.stock <= 5;

  return (
    <div className="bg-[#FAF7F2] min-h-screen flex flex-col font-sans text-[#1C1917]">
      {/* ── Existing Navbar ── */}
      <Navbar />

      {/* ── Content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-8 box-border">
        {/* ── Breadcrumb & Back button ── */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-[#B45309] hover:text-[#92400E] bg-transparent border-none cursor-pointer p-0 font-inherit transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back
          </button>

          <nav className="text-xs text-[#78716C] flex items-center gap-1.5 font-medium">
            <Link to="/home" className="hover:text-[#B45309] no-underline text-inherit">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#B45309] no-underline text-inherit">Products</Link>
            <span>/</span>
            <span className="text-[#292524] truncate max-w-xs">{product?.name || "..."}</span>
          </nav>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#E5DED5] p-8 md:p-12 shadow-[0_1px_6px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
            <div className="w-full aspect-4/3 bg-[#E7E5E4] rounded-2xl" />
            <div className="flex flex-col gap-4">
              <div className="h-4 bg-[#E7E5E4] rounded w-1/4" />
              <div className="h-8 bg-[#E7E5E4] rounded w-3/4" />
              <div className="h-6 bg-[#E7E5E4] rounded w-1/3" />
              <div className="h-20 bg-[#E7E5E4] rounded w-full mt-4" />
              <div className="h-12 bg-[#E7E5E4] rounded-xl w-1/2 mt-6" />
            </div>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-[#FECACA] p-12 text-center my-6 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] mb-3">
              <PackageX size={28} />
            </div>
            <h2 className="m-0 text-xl font-bold text-[#292524]">{error}</h2>
            <p className="m-0 text-sm text-[#78716C] mt-1.5 mb-5">
              The product you are looking for might have been removed or does not exist.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="bg-[#B45309] text-white border-none px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-[#92400E] transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        )}

        {/* ── Product Showcase ── */}
        {!loading && !error && product && (
          <div className="bg-white rounded-2xl border border-[#E5DED5] p-6 sm:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* ── Left: Image Card ── */}
            <div className="relative w-full aspect-4/3 sm:aspect-square max-h-115 bg-[#F7F5F0] rounded-2xl overflow-hidden border border-[#E5DED5] flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsWishlisted((prev) => !prev)}
                aria-label="Wishlist"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-black/5 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              >
                <Heart
                  size={19}
                  strokeWidth={2}
                  className={`transition-colors ${
                    isWishlisted
                      ? "fill-[#DC2626] text-[#DC2626]"
                      : "text-[#78716C] hover:text-[#DC2626]"
                  }`}
                />
              </button>
            </div>

            {/* ── Right: Details ── */}
            <div className="flex flex-col">
              {/* Category Badge */}
              <div className="inline-block self-start px-3 py-1 rounded-lg bg-[#FEF3E2] text-[#B45309] text-xs font-semibold uppercase tracking-wider mb-2">
                {product.category}
              </div>

              {/* Title */}
              <h1 className="m-0 font-bold text-[#1C1917] text-2xl sm:text-3xl leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-[#DC2626] font-bold text-3xl tracking-tight leading-none">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[#78716C]">Inclusive of all taxes</span>
              </div>

              {/* Stock Status Indicator */}
              <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                {isOutOfStock ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                    <span className="text-[#DC2626] font-semibold">Currently Out of Stock</span>
                  </>
                ) : isLowStock ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    <span className="text-[#D97706] font-semibold">
                      Hurry, only {product.stock} units left!
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                    <span className="text-[#16A34A] font-semibold">
                      In Stock ({product.stock} units available)
                    </span>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E5DED5] my-6" />

              {/* Description */}
              <div>
                <h3 className="m-0 text-sm font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  About this item
                </h3>
                <p className="m-0 text-sm sm:text-base text-[#44403C] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E5DED5] my-6" />

              {/* Quantity Selector + Add to Cart */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Quantity Controls */}
                {!isOutOfStock && (
                  <div className="flex items-center border border-[#E5DED5] rounded-xl bg-[#FAF7F2] p-1 self-start">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5DED5] text-[#292524] font-bold text-base flex items-center justify-center hover:bg-[#FEF3E2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-[#292524]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5DED5] text-[#292524] font-bold text-base flex items-center justify-center hover:bg-[#FEF3E2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all border-none font-inherit ${
                    isOutOfStock
                      ? "bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed"
                      : "bg-[#B45309] hover:bg-[#92400E] text-white shadow-md active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  <ShoppingCart size={18} strokeWidth={2.2} />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-[#E5DED5] grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF7F2]">
                  <Truck size={18} className="text-[#B45309] mb-1" />
                  <span className="text-xs font-semibold text-[#292524]">Free Delivery</span>
                  <span className="text-[0.7rem] text-[#78716C]">Orders over ₹499</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF7F2]">
                  <RotateCcw size={18} className="text-[#B45309] mb-1" />
                  <span className="text-xs font-semibold text-[#292524]">7-Day Returns</span>
                  <span className="text-[0.7rem] text-[#78716C]">Hassle-free exchange</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF7F2]">
                  <ShieldCheck size={18} className="text-[#16A34A] mb-1" />
                  <span className="text-xs font-semibold text-[#292524]">100% Genuine</span>
                  <span className="text-[0.7rem] text-[#78716C]">Direct from brand</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Toast Feedback Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#292524] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 text-sm font-medium animate-bounce">
          <Check size={16} className="text-[#16A34A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Quote-Only Footer (Strictly Quote, No Extra Links) ── */}
      <footer className="text-center px-4 py-8 mt-12 pb-6">
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

export default ProductDetails;
