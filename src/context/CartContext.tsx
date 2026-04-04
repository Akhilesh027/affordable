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
    price: number;           // final discounted price (after product discount, before GST)
    originalPrice?: number;
    discount?: number;       // product discount percentage
    gst: number;             // GST percentage (0-100)
    isCustomized: boolean;   // whether product is customizable
    finalPrice: number;      // same as price, kept for clarity
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
  subtotal: number;          // sum of (finalPrice * quantity) – before GST & coupon
  totalItems: number;
  addToCart: (product: any, quantity?: number, variant?: any, attributes?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;   // new: call after login
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

// Helper: compute totals from items using finalPrice
const computeTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.productSnapshot.finalPrice * i.quantity), 0);
  return { totalItems, subtotal };
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, userId } = getAuth();

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!userId) {
      // Guest: load from localStorage
      const saved = localStorage.getItem("guest_cart");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setItems(parsed);
        } catch (e) {
          console.error("Failed to parse guest cart", e);
        }
      } else {
        setItems([]);
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

  // Sync guest cart to localStorage
  useEffect(() => {
    if (!userId) {
      localStorage.setItem("guest_cart", JSON.stringify(items));
    }
  }, [items, userId]);

  // Auto-fetch on mount and when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // --- MERGE GUEST CART AFTER LOGIN ---
  const mergeGuestCart = useCallback(async () => {
    const { token: authToken, userId: authUserId } = getAuth();
    if (!authUserId || !authToken) return;

    const guestCartRaw = localStorage.getItem("guest_cart");
    if (!guestCartRaw) return;

    let guestItems: CartItem[] = [];
    try {
      guestItems = JSON.parse(guestCartRaw);
    } catch (e) {
      console.error("Invalid guest cart", e);
      return;
    }

    if (guestItems.length === 0) return;

    setLoading(true);
    try {
      // Send each guest item to backend one by one
      for (const guestItem of guestItems) {
        const payload = {
          userId: authUserId,
          productId: guestItem.productId,
          variantId: guestItem.variantId || null,
          quantity: guestItem.quantity,
          attributes: guestItem.attributes || {},
          productSnapshot: guestItem.productSnapshot,
        };

        await fetch(`${API_BASE}/api/cart/affordable/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      // Clear guest cart after successful merge
      localStorage.removeItem("guest_cart");
      // Refetch the updated cart from server
      await fetchCart();
      toast.success("Guest cart merged successfully");
    } catch (err: any) {
      console.error("Merge failed", err);
      toast.error("Could not merge guest cart");
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Add to cart
  const addToCart = useCallback(async (product: any, quantity = 1, variant?: any, attributes?: any) => {
    if (!product) return;

    const { token: authToken, userId: authUserId } = getAuth();
    if (!authUserId) {
      // Guest mode – store in localStorage
      const finalPrice = product.finalPrice ?? product.price ?? 0;
      const gst = product.gst ?? 0;
      const isCustomized = product.isCustomized ?? false;

      const existingItem = items.find(i => i.productId === product._id && (!variant || i.variantId === variant?._id));
      if (existingItem) {
        const updated = items.map(i =>
          i._id === existingItem._id ? { ...i, quantity: i.quantity + quantity } : i
        );
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
            price: finalPrice,
            originalPrice: product.originalPrice ?? product.price,
            discount: product.discount ?? 0,
            gst,
            isCustomized,
            finalPrice,
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
      const finalPrice = product.finalPrice ?? product.price ?? 0;
      const gst = product.gst ?? 0;
      const isCustomized = product.isCustomized ?? false;

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
          price: finalPrice,
          originalPrice: product.originalPrice ?? product.price,
          discount: product.discount ?? 0,
          gst,
          isCustomized,
          finalPrice,
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
        mergeGuestCart,
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