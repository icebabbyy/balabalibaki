import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./context/WishlistContext";
import Footer from "./components/Footer";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Categories = lazy(() => import("./pages/Categories"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Payment = lazy(() => import("./pages/Payment"));
const ProductsByTag = lazy(() => import("./pages/ProductsByTag"));
const TagProductPage = lazy(() => import("./pages/TagProductPage"));
const QA = lazy(() => import("./pages/QA"));
const Reviews = lazy(() => import("./pages/Reviews"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const Auth = lazy(() => import("./pages/Auth"));
const HowToOrder = lazy(() => import("./pages/HowToOrder"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

const App = () => (
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
                      <Route path="/" element={<Index />} />
                      <Route path="/products/tag/:tagName" element={<ProductsByTag />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/product/:slug" element={<ProductDetail />} />
                      <Route path="/tag/:tag" element={<TagProductPage />} />
                      <Route path="/qa" element={<QA />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/order-status" element={<OrderStatus />} />
                      <Route path="/admin/*" element={<Admin />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/how-to-order" element={<HowToOrder />} />
                      <Route path="/shipping" element={<Shipping />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/order-history" element={<OrderHistory />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </div>
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

export default App;