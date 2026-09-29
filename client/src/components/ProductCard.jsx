import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import api from "../services/api";

const ProductCard = ({
  product,
  onAddToCart,
  initialWishlisted = false,
  onWishlistToggle,
}) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-[#E5DED5] p-3.5 flex flex-col justify-between shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 group cursor-pointer"
    >
      <div className="relative w-full aspect-4/3 bg-[#F7F5F0] rounded-xl overflow-hidden flex items-center justify-center">
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
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)] border border-black/5 flex items-center justify-center transition-transform active:scale-90 ${
            isSaving ? "opacity-70 cursor-wait" : "cursor-pointer"
          }`}
        >
          <Heart
            size={16}
            strokeWidth={2}
            className={`transition-colors ${
              isWishlisted
                ? "fill-[#DC2626] text-[#DC2626]"
                : "text-[#78716C] hover:text-[#DC2626]"
            }`}
          />
        </button>
      </div>

      <div className="mt-3 flex-1 flex flex-col">
        <h3
          title={product.name}
          className="m-0 font-semibold text-[#1C1917] text-[0.95rem] line-clamp-1 group-hover:text-[#B45309] transition-colors leading-snug"
        >
          {product.name}
        </h3>

        <p className="m-0 mt-0.5 text-xs text-[#78716C] font-normal">
          {product.category}
        </p>

        <p className="m-0 mt-1.5 text-[#DC2626] font-bold text-[1.15rem] leading-none tracking-tight">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          {isOutOfStock ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
              <span className="text-[#DC2626]">Out of Stock</span>
            </>
          ) : isLowStock ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
              <span className="text-[#D97706]">Low Stock ({product.stock} left)</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
              <span className="text-[#16A34A]">In Stock</span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={isOutOfStock}
        onClick={handleCartClick}
        className={`w-full mt-3.5 py-2 px-3 rounded-xl font-semibold text-[0.875rem] flex items-center justify-center gap-2 transition-colors border-none font-inherit ${
          isOutOfStock
            ? "bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed"
            : "bg-[#B45309] hover:bg-[#92400E] text-white cursor-pointer active:scale-[0.99]"
        }`}
      >
        <ShoppingCart size={15} strokeWidth={2.2} />
        <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
      </button>
    </div>
  );
};

export default ProductCard;
