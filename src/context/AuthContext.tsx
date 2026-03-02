import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;

  // ✅ Google auth
  googleLogin: (credential: string) => Promise<boolean>;

  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<boolean>;

  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Config
const API_ORIGIN = import.meta.env.VITE_API_BASE || "https://api.jsgallor.com";
const AFFORDABLE_API = `${API_ORIGIN}/api/affordable`;

const TOKEN_KEY = "affordable_token";
const USER_KEY = "affordable_user";
const WEBSITE: "affordable" | "mid" | "luxury" = "affordable";

// ✅ axios defaults
axios.defaults.baseURL = API_ORIGIN;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true; // ✅ important for cookie-based flows too

const mapCustomerToUser = (customer: any): User => {
  const id = customer?.id || customer?._id;

  return {
    id,
    name: customer?.name || "",
    email: customer?.email || "",
    avatar:
      customer?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer?.email || "user"}`,
    role: customer?.role,
    platform: customer?.platform || WEBSITE,
    isVerified: customer?.isVerified,
    totalOrders: customer?.totalOrders,
    totalSpent: customer?.totalSpent,
    createdAt: customer?.createdAt,
    phone: customer?.phone,
    address: customer?.address,
  } as User;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const setSession = (token: string | null, customer: any | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      delete axios.defaults.headers.common["Authorization"];
    }

    if (customer) {
      localStorage.setItem(USER_KEY, JSON.stringify(customer));
      setUser(mapCustomerToUser(customer));
    } else {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  };

  // ✅ Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(mapCustomerToUser(parsed));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    // Optional: call /me endpoint if you have it
    // Otherwise just finish
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${AFFORDABLE_API}/login`, {
        email,
        password,
      });

      if (res.data?.success) {
        const { token, customer } = res.data;
        setSession(token, customer);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response) {
        throw new Error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        throw new Error("Cannot connect to server. Please check your connection.");
      }
      throw new Error("Something went wrong. Please try again.");
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${AFFORDABLE_API}/signup`, {
        name,
        email,
        password,
        platform: WEBSITE, // ✅ send platform if backend uses it
      });

      if (res.data?.success) {
        const { token, customer } = res.data;
        setSession(token, customer);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error.response) {
        const msg = error.response.data?.message || "Signup failed";
        if (error.response.data?.errors?.length) {
          throw new Error(`${msg}: ${error.response.data.errors.join(", ")}`);
        }
        throw new Error(msg);
      } else if (error.request) {
        throw new Error("Cannot connect to server. Please check your connection.");
      }
      throw new Error("Something went wrong. Please try again.");
    }
  };

  // ✅ Google auth
const googleLogin = async (credential: string): Promise<boolean> => {
  const res = await axios.post(`/api/auth/google`, {
    credential,
    website: "affordable",
  });

  const token = res.data?.token;
  const customer = res.data?.customer || res.data?.user;

  if (!token || !customer) throw new Error("Invalid google auth response");

  localStorage.setItem("affordable_token", token);
  localStorage.setItem("affordable_user", JSON.stringify(customer));
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  setUser(mapCustomerToUser(customer));

  return true;
};

  const logout = async (): Promise<void> => {
    try {
      // Optional backend logout endpoint
      await axios.post(`${AFFORDABLE_API}/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setSession(null, null);
    }
  };

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      const res = await axios.put(`${AFFORDABLE_API}/profile`, profileData);

      if (res.data?.success) {
        const updatedCustomer = res.data.customer;
        // Keep token same
        const token = localStorage.getItem(TOKEN_KEY);
        setSession(token, updatedCustomer);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Update profile error:", error);
      if (error.response) throw new Error(error.response.data?.message || "Failed to update profile");
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<boolean> => {
    try {
      const res = await axios.put(`${AFFORDABLE_API}/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      return !!res.data?.success;
    } catch (error: any) {
      console.error("Change password error:", error);
      if (error.response) throw new Error(error.response.data?.message || "Failed to change password");
      throw error;
    }
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      googleLogin,
      logout,
      updateProfile,
      changePassword,
      getToken,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};