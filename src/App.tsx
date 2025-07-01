import { Suspense, lazy } from 'react'; // 1. Import Suspense และ lazy
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./context/WishlistContext";
import Footer from "./components/Footer";

// --- 2. เปลี่ยนการ import หน้าหลักๆ เป็นแบบ lazy ---
const Index = lazy(() => import("./pages/Index"));
const Categories = lazy(() => import("./pages/Categories"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));

// --- หน้าที่ต้อง Login หรือเป็นหน้าเฉพาะกลุ่ม ก็ควรทำ lazy loading ---
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Payment = lazy(() => import("./pages/Payment"));

// ... import หน้าอื่นๆ ที่เหลือ (หรือจะทำเป็น lazy ทั้งหมดก็ได้) ...
import ProductsByTag from "./pages/ProductsByTag";
import TagProductPage from "./pages/TagProductPage";
import QA from "./pages/QA";
import Reviews from "./pages/Reviews";
import OrderStatus from "./pages/OrderStatus";
import Auth from "./pages/Auth";
import HowToOrder from "./pages/HowToOrder";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

// สร้าง Loading Component แบบง่ายๆ
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
                  {/* 3. นำ Suspense มาครอบ Routes */}
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
                      <Route path="/admin/*" element={<Admin />} /> {/* แนะนำให้เติม * */}
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