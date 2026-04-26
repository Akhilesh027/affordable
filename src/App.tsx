// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect } from "react";

import Index from "./pages/Index";
import CategoriesPage from "./pages/CategoriesPage";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";
import { WishlistProvider } from "./context/WishlistContext";
import Wishlist from "./pages/Wishlist";
import ResetPassword from "./pages/resetpassword";
import SearchPage from "./components/layout/SearchPage";

// Legal page imports
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DeliveryPolicy from "./pages/DeliveryPolicy";
import WarrantyRefund from "./pages/WarrantyRefund";
import ReplacementPolicy from "./pages/ReplacementPolicy";
import ShippingInfo from "./pages/ShippingInfo";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Floating WhatsApp component
const FloatingWhatsApp = () => {
  const whatsappNumber = "917075848516";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 rounded-full p-3 shadow-lg hover:bg-green-600 transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      aria-label="Chat with us on WhatsApp"
    >
      <img
        src="https://img.icons8.com/color/48/000000/whatsapp--v1.png"
        alt="WhatsApp"
        className="w-6 h-6 md:w-7 md:h-7"
      />
    </a>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WishlistProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <FloatingWhatsApp />
              <Routes>
                {/* Existing routes */}
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route
                  path="/categories/:categoryId"
                  element={<CategoriesPage />}
                />
                <Route
                  path="/categories/:categorySlug"
                  element={<CategoriesPage />}
                />
                <Route
                  path="/categories/:categorySlug/:subSlug"
                  element={<CategoriesPage />}
                />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Legal & policy routes (static paths, no :tier) */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/delivery-policy" element={<DeliveryPolicy />} />
                <Route path="/warranty-refund" element={<WarrantyRefund />} />
                <Route path="/replacement-policy" element={<ReplacementPolicy />} />
                <Route path="/shipping-info" element={<ShippingInfo />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />

                {/* 404 catch‑all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </WishlistProvider>
  </QueryClientProvider>
);

export default App;