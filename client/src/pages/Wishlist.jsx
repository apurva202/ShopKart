import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { Heart, Trash2, ShoppingBag, AlertCircle, Check } from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // ── Fetch Wishlist (GET /wishlist) ──
  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/wishlist");
      if (res.data && res.data.success) {
        setWishlist(res.data.wishlist || []);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Unable to load wishlist. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ── Remove from Wishlist (DELETE /wishlist/:productId) ──
  const handleRemove = async (productId, productName) => {
    if (removingId === productId) return;
    setRemovingId(productId);
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data && res.data.success) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        setToastMessage(`Removed "${productName}" from wishlist`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div
      style={{
        background: "#FAF7F2",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        color: "#1C1917",
      }}
    >
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Page Content ── */}
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "2rem 2rem 3rem",
          boxSizing: "border-box",
        }}
      >
        {/* ── Page Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "Georgia, serif",
              fontSize: "2.4rem",
              fontWeight: 700,
              color: "#1C1917",
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            My Wishlist
          </h1>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.95rem",
              color: "#78716C",
            }}
          >
            Products you've saved for later.
          </p>
          {!loading && !error && wishlist.length > 0 && (
            <p
              style={{
                margin: "0.75rem 0 0",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#44403C",
              }}
            >
              {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
            </p>
          )}
        </div>

        {/* ── State 1: Loading Skeleton ── */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  borderRadius: "1rem",
                  border: "1px solid #E5DED5",
                  padding: "1rem",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "75%",
                    background: "#E7E5E4",
                    borderRadius: "0.75rem",
                  }}
                />
                <div style={{ marginTop: "1rem" }}>
                  <div
                    style={{
                      height: "14px",
                      background: "#E7E5E4",
                      borderRadius: "4px",
                      width: "75%",
                      marginBottom: "8px",
                    }}
                  />
                  <div
                    style={{
                      height: "18px",
                      background: "#E7E5E4",
                      borderRadius: "4px",
                      width: "50%",
                      marginBottom: "8px",
                    }}
                  />
                  <div
                    style={{
                      height: "10px",
                      background: "#E7E5E4",
                      borderRadius: "4px",
                      width: "35%",
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: "1.2rem",
                    height: "38px",
                    background: "#E7E5E4",
                    borderRadius: "0.75rem",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── State 2: Error State ── */}
        {!loading && error && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #FECACA",
              borderRadius: "1rem",
              padding: "3rem 2rem",
              textAlign: "center",
              maxWidth: "480px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#DC2626",
              }}
            >
              <AlertCircle size={26} />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#292524",
              }}
            >
              Something went wrong
            </h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#78716C" }}>
              {error}
            </p>
            <button
              type="button"
              onClick={fetchWishlist}
              style={{
                marginTop: "0.5rem",
                background: "#B45309",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── State 3: Empty State ── */}
        {!loading && !error && wishlist.length === 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5DED5",
              borderRadius: "1.5rem",
              padding: "4rem 2rem",
              textAlign: "center",
              maxWidth: "520px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            }}
          >
            {/* Heart Circle Badge */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#FEF3E2",
                border: "1px solid #E5DED5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#B45309",
              }}
            >
              <Heart size={36} strokeWidth={1.5} />
            </div>
            <h2
              style={{
                margin: 0,
                fontFamily: "Georgia, serif",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#1C1917",
              }}
            >
              Your wishlist is empty
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "#78716C",
                maxWidth: "320px",
              }}
            >
              Save products you love and find them here later.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              style={{
                marginTop: "0.5rem",
                background: "#B45309",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <ShoppingBag size={17} strokeWidth={2.2} />
              Browse Products
            </button>
          </div>
        )}

        {/* ── State 4: Wishlist Cards Grid ── */}
        {!loading && !error && wishlist.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {wishlist.map((product) => {
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const isRemoving = removingId === product._id;

              return (
                <div
                  key={product._id}
                  style={{
                    background: "#fff",
                    borderRadius: "1rem",
                    border: "1px solid #E5DED5",
                    padding: "0.875rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "75%",
                      background: "#F7F5F0",
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {/* Heart Badge — click to remove */}
                    <button
                      type="button"
                      disabled={isRemoving}
                      onClick={() => handleRemove(product._id, product.name)}
                      title="Remove from wishlist"
                      style={{
                        position: "absolute",
                        top: "0.6rem",
                        right: "0.6rem",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.95)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isRemoving ? "wait" : "pointer",
                        opacity: isRemoving ? 0.6 : 1,
                        padding: 0,
                        transition: "transform 0.15s, background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isRemoving) {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.background = "#FEE2E2";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                      }}
                    >
                      <Heart
                        size={16}
                        strokeWidth={2}
                        style={{ fill: "#DC2626", color: "#DC2626" }}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div style={{ marginTop: "0.875rem", flex: 1 }}>
                    <h3
                      title={product.name}
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "#1C1917",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* Price */}
                    <p
                      style={{
                        margin: "0.375rem 0 0",
                        fontWeight: 700,
                        fontSize: "1.15rem",
                        color: "#DC2626",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    {/* Category */}
                    <p
                      style={{
                        margin: "0.25rem 0 0",
                        fontSize: "0.75rem",
                        color: "#78716C",
                        fontWeight: 400,
                      }}
                    >
                      {product.category}
                    </p>

                    {/* Stock Indicator */}
                    <div
                      style={{
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: isOutOfStock
                            ? "#DC2626"
                            : isLowStock
                            ? "#D97706"
                            : "#16A34A",
                        }}
                      />
                      <span
                        style={{
                          color: isOutOfStock
                            ? "#DC2626"
                            : isLowStock
                            ? "#D97706"
                            : "#16A34A",
                        }}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : isLowStock
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => navigate(`/products/${product._id}`)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "#B45309",
                        background: "#fff",
                        border: "1.5px solid #E5DED5",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#FEF3E2";
                        e.target.style.borderColor = "#D97706";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.borderColor = "#E5DED5";
                      }}
                    >
                      View Details
                    </button>

                    {/* Remove from Wishlist */}
                    <button
                      type="button"
                      disabled={isRemoving}
                      onClick={() => handleRemove(product._id, product.name)}
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.75rem",
                        borderRadius: "0.75rem",
                        fontWeight: 500,
                        fontSize: "0.8rem",
                        color: "#DC2626",
                        background: "transparent",
                        border: "none",
                        cursor: isRemoving ? "wait" : "pointer",
                        opacity: isRemoving ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.375rem",
                        transition: "background 0.15s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        if (!isRemoving)
                          e.currentTarget.style.background = "#FEE2E2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <Trash2 size={14} />
                      <span>
                        {isRemoving ? "Removing..." : "Remove from Wishlist"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            background: "#292524",
            color: "#fff",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.75rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            zIndex: 50,
          }}
        >
          <Check size={16} style={{ color: "#16A34A" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Footer ── */}
      <footer
        style={{
          textAlign: "center",
          padding: "2rem 1rem 1.5rem",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: "80px",
              height: "1px",
              background: "#000",
            }}
          />
          <p
            style={{
              margin: 0,
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: "#000",
            }}
          >
            &ldquo;Good things, closer to you.&rdquo;
          </p>
          <div
            style={{
              flex: 1,
              maxWidth: "80px",
              height: "1px",
              background: "#000",
            }}
          />
        </div>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.78rem",
            color: "#000",
            fontWeight: 500,
          }}
        >
          — ShopKart
        </p>
      </footer>
    </div>
  );
};

export default Wishlist;
