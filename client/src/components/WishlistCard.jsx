import { useNavigate } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";

const WishlistCard = ({ product, isRemoving, onRemove }) => {
  const navigate = useNavigate();

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    // Entire card is clickable → navigate to product
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white rounded-2xl border border-[#E5DED5] p-3.5 flex flex-col justify-between shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition-shadow cursor-pointer"
    >
      {/* Image + heart button */}
      <div
        className="relative w-full bg-[#F7F5F0] rounded-xl overflow-hidden"
        style={{ paddingBottom: "75%" }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Heart button — stopPropagation so card click doesn't also fire */}
        <button
          type="button"
          disabled={isRemoving}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(product._id, product.name);
          }}
          title="Remove from wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 border border-black/5 shadow-[0_2px_6px_rgba(0,0,0,0.12)] flex items-center justify-center transition-transform p-0 hover:bg-[#FEE2E2] hover:scale-110 active:scale-95 ${
            isRemoving ? "opacity-60 cursor-wait" : "cursor-pointer"
          }`}
        >
          <Heart size={16} strokeWidth={2} className="fill-[#DC2626] text-[#DC2626]" />
        </button>
      </div>

      {/* Product info */}
      <div className="mt-3.5 flex-1">
        <h3
          title={product.name}
          className="m-0 font-semibold text-[0.95rem] text-[#1C1917] leading-snug line-clamp-1"
        >
          {product.name}
        </h3>

        <p className="m-0 mt-1.5 font-bold text-[1.15rem] text-[#DC2626] leading-none tracking-tight">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        <p className="m-0 mt-1 text-xs text-[#78716C] font-normal">
          {product.category}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOutOfStock
                ? "bg-[#DC2626]"
                : isLowStock
                ? "bg-[#D97706]"
                : "bg-[#16A34A]"
            }`}
          />
          <span
            className={
              isOutOfStock
                ? "text-[#DC2626]"
                : isLowStock
                ? "text-[#D97706]"
                : "text-[#16A34A]"
            }
          >
            {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
          </span>
        </div>
      </div>

      {/* Remove button — stopPropagation so card click doesn't also fire */}
      <div className="mt-3">
        <button
          type="button"
          disabled={isRemoving}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(product._id, product.name);
          }}
          className={`w-full py-2 px-3 rounded-xl font-medium text-[0.9rem] text-[#DC2626] bg-transparent border-none flex items-center justify-center gap-1.5 transition-colors font-inherit ${
            isRemoving ? "opacity-60 cursor-wait" : "cursor-pointer hover:bg-[#FEE2E2]"
          }`}
        >
          <Trash2 size={14} />
          <span>{isRemoving ? "Removing..." : "Remove from Wishlist"}</span>
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
