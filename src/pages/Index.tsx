import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react"; // <--- ตรวจสอบว่ามี CreditCard แล้ว
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import EnhancedProductCard from "@/components/EnhancedProductCard";
import { useCart } from "@/hooks/useCart"; // <--- เพิ่ม import useCart

interface Banner { /* ... */ }
interface Category { /* ... */ }

const Index = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // <--- เรียกใช้ useCart hook
  
  // State ทั้งหมดเหมือนเดิม
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  // ... state อื่นๆ ...
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBanners(),
      fetchFeaturedProducts(),
      fetchCategories(),
      fetchHomepageCategories(),
    ]).finally(() => setLoading(false));
  }, []);

  // ฟังก์ชัน fetch ทั้งหมดเหมือนเดิม
  const fetchBanners = async () => { /* ... */ };
  const fetchFeaturedProducts = async () => { /* ... */ };
  const fetchCategories = async () => { /* ... */ };
  const fetchHomepageCategories = async () => { /* ... */ };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const CategorySection = ({ title, products, categoryName }: { title: string; products: ProductPublic[]; categoryName: string }) => (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link to={`/categories?category=${encodeURIComponent(categoryName)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <EnhancedProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>
        )}
      </div>
    </section>
  );

  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => ( /* ...โค้ดส่วนนี้เหมือนเดิม... */ );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* ...ส่วน Banner หลัก... */}
      <section className="relative">{/* ... */}</section>

      {/* ...ส่วนหมวดหมู่... */}
      <section className="py-12 bg-white">{/* ... */}</section>

      {/* สินค้ามาใหม่ - Updated to use Carousel */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          
          {loading ? (
            <div>Loading...</div>
          ) : (
            // ส่ง onAddToCart เข้าไปใน Carousel
            <FeaturedProductsCarousel 
              products={featuredProducts}
              onProductClick={handleProductClick}
              onAddToCart={addToCart} 
            />
          )}
        </div>
      </section>

      {/* ...ส่วน Banner และ CategorySection อื่นๆ... */}
      {secondBanners.length > 0 && <BannerSection banners={secondBanners} />}
      {homepageCategories.map((category) => (
        <CategorySection 
          key={category.id}
          title={category.name} 
          products={categoryProducts[category.name] || []} 
          categoryName={category.name} 
        />
      ))}
      {thirdBanners.length > 0 && <BannerSection banners={thirdBanners} />}
      {fourthBanners.length > 0 && <BannerSection banners={fourthBanners} />}
    </div>
  );
};

export default Index;
