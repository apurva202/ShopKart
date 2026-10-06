import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

const CartItem = ({ item, isUpdating, onIncrease, onDecrease, onRemove }) => {
  const navigate = useNavigate();
  const { product, quantity } = item;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const canDecrease = !isOutOfStock && quantity > 1;
  const canIncrease = !isOutOfStock && quantity < product.stock;
  const itemSubtotal = product.price * quantity;

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white rounded-2xl border border-[#E5DED5] p-5 flex items-center justify-between gap-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
    >
      {/* Product Image + Details */}
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-[#F5F2EB] rounded-2xl overflow-hidden flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            title={product.name}
            className="m-0 font-bold text-base sm:text-[1.05rem] text-[#1C1917] line-clamp-1 leading-snug"
          >
            {product.name}
          </h3>
          <p className="m-0 mt-0.5 text-xs sm:text-sm text-[#78716C] capitalize">
            {product.category}
          </p>

          {/* Stock status indicator */}
          <div className="flex items-center gap-1.5 mt-2">
            {isOutOfStock ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#DC2626]">
                  Out of Stock
                </span>
              </>
            ) : isLowStock ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#D97706]">
                  Only {product.stock} left in stock
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-[#16A34A]">
                  In Stock ({product.stock} units left)
                </span>
              </>
            )}
          </div>

          {/* Unit price */}
          <p className="m-0 mt-2 font-bold text-base sm:text-lg text-[#DC2626]">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Stepper + Remove button */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center shrink-0 px-2 sm:px-4"
      >
        <div className="flex items-center border border-[#E5DED5] rounded-xl bg-white overflow-hidden divide-x divide-[#E5DED5] shadow-xs">
          <button
            type="button"
            disabled={isUpdating || !canDecrease}
            onClick={() => onDecrease(product._id, quantity)}
            className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center text-[#57534E] hover:bg-[#FAF7F2] transition-colors border-none bg-transparent font-inherit ${
              isUpdating || !canDecrease
                ? "opacity-30 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>

          <span className="w-9 sm:w-10 h-8 sm:h-8.5 flex items-center justify-center text-center font-semibold text-sm text-[#1C1917] bg-[#FAF7F2]">
            {isUpdating ? (
              <span className="inline-block w-3 h-3 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
            ) : (
              quantity
            )}
          </span>

          <button
            type="button"
            disabled={isUpdating || !canIncrease}
            onClick={() => onIncrease(product._id, quantity)}
            className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center text-[#57534E] hover:bg-[#FAF7F2] transition-colors border-none bg-transparent font-inherit ${
              isUpdating || !canIncrease
                ? "opacity-30 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Polished Remove pill button — slightly larger */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onRemove(product._id)}
          className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.825rem] sm:text-sm font-semibold text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2] px-3 py-1.5 rounded-lg cursor-pointer bg-transparent border-none disabled:opacity-40 font-inherit transition-all"
        >
          <Trash2 size={15} strokeWidth={2.2} />
          <span>Remove</span>
        </button>
      </div>

      {/* Item total + (price x qty) */}
      <div className="text-right shrink-0 min-w-24 sm:min-w-28">
        <p className="m-0 font-bold text-base sm:text-lg text-[#1C1917] tracking-tight">
          ₹{Number(itemSubtotal).toLocaleString("en-IN")}
        </p>
        <p className="m-0 text-xs text-[#78716C] mt-1">
          (₹{Number(product.price).toLocaleString("en-IN")} × {quantity})
        </p>
      </div>
    </div>
  );
};

export default CartItem;
