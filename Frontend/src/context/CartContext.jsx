import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);
const CART_KEY = "cart";
const CODE_KEY = "discountCode";

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadAppliedCode() {
  try {
    const saved = localStorage.getItem(CODE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [appliedCode, setAppliedCode] = useState(loadAppliedCode);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCode) {
      localStorage.setItem(CODE_KEY, JSON.stringify(appliedCode));
    } else {
      localStorage.removeItem(CODE_KEY);
    }
  }, [appliedCode]);

  const addItem = (product, variant, quantity = 1) => {
    setItems((prev) => {
      const key = `${product.id}-${variant?.id || "default"}`;
      const existing = prev.find((i) => i.key === key);
      const item = {
        key,
        productId: product.id,
        variantId: variant?.id || null,
        name: product.name,
        price: product.discountActive ? Number(product.discountedPrice) : Number(product.price),
        originalPrice: Number(product.price),
        discountActive: Boolean(product.discountActive),
        discountPercent: product.discountActive ? Number(product.discountPercent) : null,
        color: variant?.color || product.color || null,
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

  const clearCart = () => {
    setItems([]);
    setAppliedCode(null);
  };

  const clearLastAdded = () => setLastAdded(null);
  const clearAppliedCode = () => setAppliedCode(null);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = appliedCode
    ? Math.round((totalPrice * appliedCode.discountPercent) / 100)
    : 0;
  const finalTotal = totalPrice - discountAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        appliedCode,
        setAppliedCode,
        clearAppliedCode,
        discountAmount,
        finalTotal,
        lastAdded,
        clearLastAdded,
      }}
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
