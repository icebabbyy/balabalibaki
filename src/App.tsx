// src/App.tsx
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ProductExtraInfoAdmin from "@/pages/babbylovesbabbyadmin/product-extra-info/ProductExtraInfoAdmin";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./context/WishlistContext";

import Footer from "./components/Footer";
import ElfsightChat from "@/components/ElfsightChat";

import AdminOnly from "@/pages/babbylovesbabbyadmin/AdminOnly";
import AdminLayout from "@/pages/babbylovesbabbyadmin/AdminLayout";
import BannerAdminPage from "@/pages/babbylovesbabbyadmin/BannerAdminPage";

// ---------- lazy pages ----------
const Index = lazy(() => import("./pages/Index"));
const Categories = lazy(() => import("./pages/Categories"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Payment = lazy(() => import("./pages/Payment"));
const ProductsByTag = lazy(() => import("./pages/ProductsByTag"));
const QA = lazy(() => import("./pages/QA"));
const Reviews = lazy(() => import("./pages/Reviews"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const Auth = lazy(() => import("./pages/Auth"));
const HowToOrder = lazy(() => import("./pages/HowToOrder"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Warranty = lazy(() => import("./pages/Warranty"));
const PrivacyCookiesPolicyPage = lazy(() => import("./pages/PrivacyCookiesPolicy"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Privilege = lazy(() => import("./pages/privilege"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="min-h-screen flex flex-col">
                  <div className="flex-grow">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public */}
                        <Route path="/" element={<Index />} />
                        <Route path="/products/tag/:tag" element={<ProductsByTag />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/tag/:tag" element={<ProductsByTag />} />
                        <Route path="/qa" element={<QA />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/order-status" element={<OrderStatus />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/privilege" element={<Privilege />} />
                        <Route path="/how-to-order" element={<HowToOrder />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/warranty" element={<Warranty />} />
                        <Route path="/thank-you" element={<ThankYou />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/order-history" element={<OrderHistory />} />
                        <Route path="/privacy-cookies-policy" element={<PrivacyCookiesPolicyPage />} />

                        {/* Admin panel (custom path) */}
                        <Route
                          path="/babbylovesbabbyadmin"
                          element={
                            <AdminOnly>
                              <AdminLayout>
                                <BannerAdminPage />
                                 <ProductExtraInfoAdmin />
                              </AdminLayout>
                            </AdminOnly>
                          }
                        />
                        {/* เผลอเข้าผ่าน /admin ให้รีไดเรกต์ */}
                        <Route path="/admin" element={<Navigate to="/babbylovesbabbyadmin" replace />} />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>

                  {/* วิดเจ็ตแชต (fixed) + ฟุตเตอร์ */}
                  <ElfsightChat />
                  <Footer />
                </div>

                <Toaster />
                <Sonner />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
