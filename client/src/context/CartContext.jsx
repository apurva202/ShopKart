import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived values — computed fresh every render, never stored
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const refreshCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/cart");
      if (res.data && res.data.success) {
        setCart(res.data.cart || []);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      setError("Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post(`/cart/${productId}`, { quantity });
    if (res.data && res.data.success) {
      setCart(res.data.cart);
    }
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.patch(`/cart/${productId}`, { quantity });
    if (res.data && res.data.success) {
      setCart(res.data.cart);
    }
    return res.data;
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    if (res.data && res.data.success) {
      setCart(res.data.cart);
    }
    return res.data;
  };

  const clearCartState = () => {
    setCart([]);
  };

  // Load cart once on mount
  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        totalItems,
        subtotal,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
