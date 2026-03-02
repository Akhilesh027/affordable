import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ✅ Your backend base
const API_BASE = "https://api.jsgallor.com";

// ✅ Types matching your backend response
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
  productId: string;            // ✅ Mongo product id
  quantity: number;
  productSnapshot: CartSnapshot; // ✅ snapshot data
};

interface CartContextType {
  items: BackendCartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
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

  // ✅ Fetch cart from backend using userId
  const refreshCart = async () => {
    const { token, userId, isLoggedIn } = getAuth();

    if (!isLoggedIn) {
      // optional guest cart fallback (if you still want)
      const saved = localStorage.getItem("cart");
      setItems(saved ? JSON.parse(saved) : []);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch cart");

      setItems(data?.items || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load cart");
    }
  };

  // ✅ Load cart on first app open
  useEffect(() => {
    refreshCart();
  }, []);

  // ✅ Add to cart (backend)
  const addToCart = async (product: any, quantity = 1) => {
    const { token, userId, isLoggedIn } = getAuth();

    const productId = product?._id || product?.id;
    if (!productId) {
      toast.error("Product id missing");
      return;
    }

    // Guest fallback
    if (!isLoggedIn) {
      setItems((prev: any) => {
        const idx = prev.findIndex((i: any) => i.productId === productId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
          localStorage.setItem("cart", JSON.stringify(copy));
          return copy;
        }
        const newItem = {
          productId,
          quantity,
          productSnapshot: {
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            inStock: product.inStock,
            colors: product.colors,
            originalPrice: product.originalPrice,
          },
        };
        const next = [...prev, newItem];
        localStorage.setItem("cart", JSON.stringify(next));
        return next;
      });

      toast.success(`${product.name} added to cart`);
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
          quantity,
          productSnapshot: {
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            inStock: product.inStock,
            colors: product.colors,
            originalPrice: product.originalPrice,
          },
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

  // ✅ Update quantity (backend)
  const updateQuantity = async (productId: string, quantity: number) => {
    const { token, userId, isLoggedIn } = getAuth();

    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    // Guest fallback
    if (!isLoggedIn) {
      setItems((prev: any) => {
        const next = prev.map((i: any) =>
          i.productId === productId ? { ...i, quantity } : i
        );
        localStorage.setItem("cart", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/cart/affordable/update/${userId}/${productId}/${quantity}`,
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

  // ✅ Remove item (backend)
  const removeFromCart = async (productId: string) => {
    const { token, userId, isLoggedIn } = getAuth();

    // Guest fallback
    if (!isLoggedIn) {
      setItems((prev: any) => {
        const next = prev.filter((i: any) => i.productId !== productId);
        localStorage.setItem("cart", JSON.stringify(next));
        return next;
      });
      toast.info("Item removed");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/cart/affordable/remove/${userId}/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to remove item");

      setItems(data?.items || []);
      toast.info("Item removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove item");
    }
  };

  // ✅ Clear cart (backend)
  const clearCart = async () => {
    const { token, userId, isLoggedIn } = getAuth();

    // Guest fallback
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

  // ✅ Totals using productSnapshot.price
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
