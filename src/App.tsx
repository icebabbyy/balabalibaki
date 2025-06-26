// src/App.tsx (เวอร์ชัน Final ที่ใช้ HashRouter)

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// --- 1. เปลี่ยนมา import HashRouter ---
import { HashRouter, Routes, Route } from "react-router-dom";

// --- Import หน้าทั้งหมดที่ใช้งาน ---
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import ProductsByTag from "./pages/ProductsByTag";
import QA from "./pages/QA";
import Reviews from "./pages/Reviews";
import OrderStatus from "./pages/OrderStatus";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import HowToOrder from "./pages/HowToOrder";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import OrderHistory from "./pages/OrderHistory";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* --- 2. เปลี่ยนมาใช้ HashRouter --- */}
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
            <Routes>
              {/* --- 3. เส้นทางทั้งหมดถูกต้องแล้ว --- */}
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/qa" element={<QA />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/order-status" element={<OrderStatus />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/how-to-order" element={<HowToOrder />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/products/tag/:tagName" element={<ProductsByTag />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
