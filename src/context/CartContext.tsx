import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "https://api.jsgallor.com";

// Updated types to include variant details
export type CartSnapshot = {
  name: string;
  price: number;
  image?: string;
  category?: string;
  inStock?: boolean;
  colors?: string[];
  originalPrice?: number;
};

export type BackendCartItem = {
  _id: string;                       // unique cart item id
  productId: string;
  variantId?: string | null;
  quantity: number;
  attributes: {
    size?: string | null;
    color?: string | null;
    fabric?: string | null;
  };
  productSnapshot: CartSnapshot;
};

interface CartContextType {
  items: BackendCartItem[];
  addToCart: (product: any, quantity?: number, variant?: any, attributes?: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getAuth = () => {
  const token = localStorage.getItem("affordable_token");
  const userRaw = localStorage.getItem("affordable_user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userId = user?._id || user?.id || null;
  return { token, userId, isLoggedIn: Boolean(token && userId) };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BackendCartItem[]>([]);

  const refreshCart = async () => {
    const { token, userId, isLoggedIn } = getAuth();

    if (!isLoggedIn) {
      // Guest fallback (optional, can be removed if you require login)
      const saved = localStorage.getItem("cart");
      setItems(saved ? JSON.parse(saved) : []);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch cart");

      setItems(data?.items || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load cart");
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (product: any, quantity = 1, variant?: any, attributes?: any) => {
    const { token, userId, isLoggedIn } = getAuth();

    const productId = product?._id || product?.id;
    if (!productId) {
      toast.error("Product id missing");
      return;
    }

    // Build product snapshot (include variant price if available)
    const snapshot = {
      name: product.name,
      price: variant?.price ?? product.price, // use variant price if provided
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      inStock: product.inStock,
      colors: product.colors,
    };

    // Guest fallback (optional)
    if (!isLoggedIn) {
      // ... (similar but with attributes) - omitted for brevity
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          productId,
          variantId: variant?._id || null,
          quantity,
          attributes: attributes || {},
          productSnapshot: snapshot,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add item");

      setItems(data?.items || []);
      toast.success(`${product.name} added to cart`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const { token, userId, isLoggedIn } = getAuth();

    if (!isLoggedIn) {
      // Guest fallback
      setItems(prev => {
        const next = prev.map(i => i._id === itemId ? { ...i, quantity } : i);
        localStorage.setItem("cart", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/cart/affordable/update/${userId}/${itemId}/${quantity}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update quantity");

      setItems(data?.items || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update quantity");
    }
  };

  const removeFromCart = async (itemId: string) => {
    const { token, userId, isLoggedIn } = getAuth();

    if (!isLoggedIn) {
      setItems(prev => {
        const next = prev.filter(i => i._id !== itemId);
        localStorage.setItem("cart", JSON.stringify(next));
        return next;
      });
      toast.info("Item removed");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/remove/${userId}/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to remove item");

      setItems(data?.items || []);
      toast.info("Item removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove item");
    }
  };

  const clearCart = async () => {
    const { token, userId, isLoggedIn } = getAuth();

    if (!isLoggedIn) {
      setItems([]);
      localStorage.removeItem("cart");
      toast.info("Cart cleared");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/clear/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to clear cart");

      setItems(data?.items || []);
      toast.info("Cart cleared");
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear cart");
    }
  };

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + Number(i.productSnapshot?.price || 0) * Number(i.quantity || 0),
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};