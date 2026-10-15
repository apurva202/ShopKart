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
      className="bg-white rounded-2xl border border-stone-200 p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image + heart button */}
      <div className="relative w-full bg-stone-100 rounded-xl overflow-hidden aspect-4/3">
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
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 border border-black/5 shadow-xs flex items-center justify-center transition-transform p-0 hover:bg-red-50 hover:scale-110 active:scale-95 ${
            isRemoving ? "opacity-60 cursor-wait" : "cursor-pointer"
          }`}
        >
          <Heart size={16} strokeWidth={2} className="fill-red-600 text-red-600" />
        </button>
      </div>

      {/* Product info */}
      <div className="mt-3.5 flex-1">
        <h3
          title={product.name}
          className="m-0 font-semibold text-sm text-stone-900 leading-snug line-clamp-1"
        >
          {product.name}
        </h3>

        <p className="m-0 mt-1.5 font-bold text-lg text-red-600 leading-none tracking-tight">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        <p className="m-0 mt-1 text-xs text-stone-500 font-normal">
          {product.category}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOutOfStock
                ? "bg-red-600"
                : isLowStock
                ? "bg-amber-600"
                : "bg-emerald-600"
            }`}
          />
          <span
            className={
              isOutOfStock
                ? "text-red-600"
                : isLowStock
                ? "text-amber-600"
                : "text-emerald-600"
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
          className={`w-full py-2 px-3 rounded-xl font-medium text-sm text-red-600 bg-transparent border-none flex items-center justify-center gap-1.5 transition-colors font-inherit ${
            isRemoving ? "opacity-60 cursor-wait" : "cursor-pointer hover:bg-red-50"
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
