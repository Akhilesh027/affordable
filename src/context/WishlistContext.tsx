import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";

const TOKEN_KEY = "affordable_token";

interface WishlistContextType {
  wishlist: Product[];
  loading: boolean;
  error: string | null;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  refetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to make authenticated requests
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error("No authentication token");
    }
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Request failed");
    }
    return response.json();
  }, []);

  // Fetch wishlist from server
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth("https://api.jsgallor.com/api/affordable/wishlist");
      setWishlist(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  // Refetch wishlist (exposed to components)
  const refetchWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  // Add product to wishlist
  const addToWishlist = useCallback(async (product: Product) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.warn("Cannot add to wishlist: not authenticated");
      return;
    }
    setError(null);
    try {
      const updatedWishlist = await fetchWithAuth(`https://api.jsgallor.com/api/affordable/wishlist/${product._id}`, {
        method: "POST",
      });
      setWishlist(updatedWishlist);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to add to wishlist:", err);
      throw err;
    }
  }, [fetchWithAuth]);

  // Remove product from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.warn("Cannot remove from wishlist: not authenticated");
      return;
    }
    setError(null);
    try {
      const updatedWishlist = await fetchWithAuth(`https://api.jsgallor.com/api/affordable/wishlist/${productId}`, {
        method: "DELETE",
      });
      setWishlist(updatedWishlist);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to remove from wishlist:", err);
      throw err;
    }
  }, [fetchWithAuth]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((item) => item._id === productId);
  }, [wishlist]);

  // Clear wishlist locally (e.g., on logout)
  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  // Fetch wishlist on mount if token exists, and listen for token changes
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchWishlist();
    } else {
      clearWishlist();
    }

    // Optional: listen to storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        if (e.newValue) {
          fetchWishlist();
        } else {
          clearWishlist();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchWishlist, clearWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        refetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};