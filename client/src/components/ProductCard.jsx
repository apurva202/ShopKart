import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const ProductCard = ({
  product,
  initialWishlisted = false,
  onWishlistToggle,
  onAddToCart,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Sync if parent updates the prop (e.g. wishlist loaded after mount)
  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (isWishlisted) {
        const res = await api.delete(`/wishlist/${product._id}`);
        if (res.data && res.data.success) {
          setIsWishlisted(false);
          if (onWishlistToggle) onWishlistToggle(product._id, false);
        }
      } else {
        const res = await api.post(`/wishlist/${product._id}`);
        if (res.data && res.data.success) {
          setIsWishlisted(true);
          if (onWishlistToggle) onWishlistToggle(product._id, true);
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // 409 means already wishlisted — sync state
        setIsWishlisted(true);
        if (onWishlistToggle) onWishlistToggle(product._id, true);
      } else {
        console.error("Wishlist action failed:", err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCartClick = async (e) => {
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product._id);
      if (onAddToCart) {
        onAddToCart(product);
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-stone-200 p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer"
    >
      <div className="relative w-full aspect-4/3 bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <button
          type="button"
          disabled={isSaving}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-xs border border-black/5 flex items-center justify-center transition-transform active:scale-90 ${
            isSaving ? "opacity-70 cursor-wait" : "cursor-pointer"
          }`}
        >
          <Heart
            size={16}
            strokeWidth={2}
            className={`transition-colors ${
              isWishlisted
                ? "fill-red-600 text-red-600"
                : "text-stone-400 hover:text-red-600"
            }`}
          />
        </button>
      </div>

      <div className="mt-3 flex-1 flex flex-col">
        <h3
          title={product.name}
          className="m-0 font-semibold text-stone-900 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors leading-snug"
        >
          {product.name}
        </h3>

        <p className="m-0 mt-0.5 text-xs text-stone-500 font-normal">
          {product.category}
        </p>

        <p className="m-0 mt-1.5 text-red-600 font-bold text-lg leading-none tracking-tight">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          {isOutOfStock ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
              <span className="text-red-600">Out of Stock</span>
            </>
          ) : isLowStock ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
              <span className="text-amber-600">Low Stock ({product.stock} left)</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-emerald-600">In Stock</span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={isOutOfStock || isAdding}
        onClick={handleCartClick}
        className={`w-full mt-3.5 py-2 px-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors border-none font-inherit ${
          isOutOfStock
            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
            : isAdding
            ? "bg-amber-600 text-white cursor-wait"
            : "bg-amber-700 hover:bg-amber-800 text-white cursor-pointer active:scale-[0.99]"
        }`}
      >
        <ShoppingCart size={15} strokeWidth={2.2} />
        <span>
          {isOutOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
        </span>
      </button>
    </div>
  );
};

export default ProductCard;
