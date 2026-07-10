import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

function loadCart() {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, variant, quantity = 1) => {
    setItems((prev) => {
      const key = `${product.id}-${variant?.id || "default"}`;
      const existing = prev.find((i) => i.key === key);
      const item = {
        key,
        productId: product.id,
        variantId: variant?.id || null,
        name: product.name,
        price: Number(product.price),
        color: variant?.color || null,
        image: variant?.imageUrl || product.imageUrl || "",
        quantity,
      };

      setLastAdded(item);

      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
    );
  };

  const clearCart = () => setItems([]);

  const clearLastAdded = () => setLastAdded(null);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, lastAdded, clearLastAdded }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
