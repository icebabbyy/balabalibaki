// src/pages/Index.tsx (เวอร์ชันปรับปรุงใหม่)

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

// 1. Import การ์ดสินค้ามาตรฐานของเราเข้ามา
import EnhancedProductCard from "@/components/EnhancedProductCard";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";


// (Interfaces Banner, Category เหมือนเดิม)
interface Banner {
  id: string; title?: string; description?: string; image_url: string;
  link_url?: string; active: boolean; position: number;
}
interface Category {
  id: number; name: string; image?: string; display_on_homepage?: boolean;
}


const Index = () => {
  const navigate = useNavigate();
  // (State ทั้งหมดเหมือนเดิม)
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // (useEffect เหมือนเดิม)
    setLoading(true);
    Promise.all([
      fetchBanners(),
      fetchFeaturedProducts(),
      fetchCategories(),
      fetchHomepageCategories()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchBanners = async () => { /* ...โค้ดเดิม... */ };
  const fetchFeaturedProducts = async () => { /* ...โค้ดเดิม... */ };
  const fetchCategories = async () => { /* ...โค้ดเดิม... */ };
  const fetchHomepageCategories = async () => { /* ...โค้ดเดิม... */ };

  // 2. ย้าย handleProductClick มาไว้ที่นี่ที่เดียว
  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // 3. ลบ const ProductCard, const addToCart, const buyNow ที่เคยอยู่ในนี้ทิ้งไปทั้งหมด!

  // 4. สร้าง CategorySection ให้เรียกใช้ EnhancedProductCard ที่ import เข้ามา
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
              // ใช้ EnhancedProductCard ที่นี่
              <EnhancedProductCard 
                key={product.id} 
                product={product} 
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>
        )}
      </div>
    </section>
  );

  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => ( /* ...โค้ดเดิม... */ );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* ...ส่วน Banner ต่างๆ เหมือนเดิม... */}
      <section className="relative"> ... </section>

      {/* หมวดหมู่สินค้าทั้งหมด */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200">
                  <CardContent className="p-2">
                    <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"/>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>
                    <h3 className="font-medium text-xs text-center text-gray-800 line-clamp-2 leading-tight">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* สินค้ามาใหม่ - Updated to use Carousel */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          
          {loading ? (
            // ... loading state ...
          ) : (
            // 5. แก้ไข FeaturedProductsCarousel ให้ส่ง onProductClick เข้าไป
            <FeaturedProductsCarousel 
              products={featuredProducts}
              onProductClick={handleProductClick}
              // onAddToCart ไม่ต้องส่งไปแล้ว เพราะ Logic อยู่ใน Card
            />
          )}
        </div>
      </section>

      {/* ...ส่วน Banner และ CategorySection อื่นๆ เหมือนเดิม... */}
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
