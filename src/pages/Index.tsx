// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product";

import Header from "@/components/Header";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";

// (Interfaces และฟังก์ชัน mapProduct สามารถใช้ตัวเดิมที่สมบูรณ์แล้วได้เลย)
interface Banner { /* ... */ }
interface Category { /* ... */ }
const mapProduct = (item: any): ProductPublic => { /* ... */ };

const Index = () => {
  const navigate = useNavigate();
  // (State declarations เหมือนเดิม)
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // (Data fetching logic ที่ปรับปรุงแล้วเหมือนเดิม)
  }, []);

  const handleProductClick = (productId: number) => { /* ...โค้ดเดิม... */ };

  // Helper component สำหรับแสดง Section ของแต่ละหมวดหมู่
  const CategorySection = ({ title, products, categoryName }: { title: string; products: ProductPublic[]; categoryName: string }) => {
    if (!products || products.length === 0) return null; // ไม่แสดง Section ถ้าไม่มีสินค้า
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Link to={`/categories?category=${encodeURIComponent(categoryName)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
              ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {/* ✨ FIX: กำหนดขนาด Grid ให้เหมาะสม */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <EnhancedProductCard key={product.id} product={product} onProductClick={handleProductClick} />
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {loading ? (
        <div className="text-center py-20">กำลังโหลด...</div>
      ) : (
        <>
          {/* ... (ส่วน Banner และ Category Grid ไม่มีการเปลี่ยนแปลง) ... */}

          {/* Featured Products Carousel */}
          <section className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
              <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]} className="w-full">
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((product) => (
                    // ✨ FIX: กำหนดขนาดของ Item ใน Carousel ให้เหมาะสม
                    <CarouselItem key={product.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <EnhancedProductCard product={product} onProductClick={handleProductClick} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
              </Carousel>
            </div>
          </section>
          
          {/* Individual Category Sections */}
          {Object.keys(homepageCategoryProducts).map((categoryName) => (
            <CategorySection
              key={categoryName}
              title={categoryName}
              products={homepageCategoryProducts[categoryName]}
              categoryName={categoryName}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Index;
