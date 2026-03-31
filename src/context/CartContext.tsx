import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Product } from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE || "https://api.jsgallor.com";

// Types
export interface CartItem {
  _id: string;               // cart item ID (from backend)
  productId: string;
  variantId?: string | null;
  quantity: number;
  attributes?: {
    size?: string;
    color?: string;
    fabric?: string;
  };
  productSnapshot: {
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    finalPrice?: number;
    image: string;
    category?: string;
    inStock: boolean;
    colors?: string[];
    sizes?: string[];
    fabrics?: string[];
    [key: string]: any;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  subtotal: number;
  totalItems: number;
  addToCart: (product: any, quantity?: number, variant?: any, attributes?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper: get auth token and userId from localStorage
const getAuth = () => {
  const token = localStorage.getItem("affordable_token");
  const userRaw = localStorage.getItem("affordable_user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userId = user?._id || user?.id || null;
  return { token, userId };
};

// Helper: compute totals from items
const computeTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.productSnapshot.price * i.quantity), 0);
  return { totalItems, subtotal };
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, userId } = getAuth();

  // Fetch cart from backend (or load from localStorage if offline/guest)
  const fetchCart = useCallback(async () => {
    if (!userId) {
      // For guest users, you may want to load from localStorage
      const saved = localStorage.getItem("guest_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(parsed);
      }
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Refetch cart (exposed to components)
  const refetchCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Sync to localStorage for guests (or for offline)
  useEffect(() => {
    if (!userId) {
      localStorage.setItem("guest_cart", JSON.stringify(items));
    }
  }, [items, userId]);

  // Auto-fetch on mount and when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = useCallback(async (product: any, quantity = 1, variant?: any, attributes?: any) => {
    if (!product) return;

    const { token: authToken, userId: authUserId } = getAuth();
    if (!authUserId) {
      // Guest mode – store in localStorage
      const existingItem = items.find(i => i.productId === product._id && (!variant || i.variantId === variant?._id));
      if (existingItem) {
        const updated = items.map(i => i._id === existingItem._id ? { ...i, quantity: i.quantity + quantity } : i);
        setItems(updated);
      } else {
        const newItem: CartItem = {
          _id: Date.now().toString(), // temporary ID for guest
          productId: product._id,
          variantId: variant?._id || null,
          quantity,
          attributes: {
            size: attributes?.size,
            color: attributes?.color,
            fabric: attributes?.fabric,
          },
          productSnapshot: {
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            finalPrice: product.finalPrice,
            image: product.image,
            category: product.category,
            inStock: product.inStock,
            colors: product.colors,
            sizes: product.sizes,
            fabrics: product.fabrics,
          },
        };
        setItems(prev => [...prev, newItem]);
      }
      toast.success("Added to cart (guest)");
      return;
    }

    if (!authToken) {
      toast.error("Please login to add to cart");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: authUserId,
        productId: product._id,
        variantId: variant?._id || null,
        quantity,
        attributes: {
          size: attributes?.size,
          color: attributes?.color,
          fabric: attributes?.fabric,
        },
        productSnapshot: {
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          finalPrice: product.finalPrice,
          image: product.image,
          category: product.category,
          inStock: product.inStock,
          colors: product.colors,
          sizes: product.sizes,
          fabrics: product.fabrics,
        },
      };

      const res = await fetch(`${API_BASE}/api/cart/affordable/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add to cart");
      }

      const data = await res.json();
      setItems(data.items);
      toast.success("Added to cart");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Update quantity of an item (by itemId)
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    const { token: authToken, userId: authUserId } = getAuth();
    if (!authUserId) {
      // Guest mode
      const updated = items.map(i => i._id === itemId ? { ...i, quantity } : i);
      setItems(updated);
      return;
    }

    if (!authToken) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/update/${authUserId}/${itemId}/${quantity}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update quantity");
      }

      const data = await res.json();
      setItems(data.items);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Remove item from cart (by itemId)
  const removeFromCart = useCallback(async (itemId: string) => {
    const { token: authToken, userId: authUserId } = getAuth();
    if (!authUserId) {
      // Guest mode
      const filtered = items.filter(i => i._id !== itemId);
      setItems(filtered);
      return;
    }

    if (!authToken) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/remove/${authUserId}/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove item");
      }

      const data = await res.json();
      setItems(data.items);
      toast.success("Item removed");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    const { token: authToken, userId: authUserId } = getAuth();
    if (!authUserId) {
      // Guest mode
      setItems([]);
      localStorage.removeItem("guest_cart");
      return;
    }

    if (!authToken) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart/affordable/clear/${authUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to clear cart");
      }

      setItems([]);
      toast.success("Cart cleared");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { subtotal, totalItems } = computeTotals(items);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        subtotal,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};