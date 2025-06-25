// path: src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";
import { toast } from "sonner";

// --- 1. แก้ไข: import ProductCard ที่เราสร้างขึ้นใหม่ ---
import ProductCard from "@/components/ProductCard";

// (Interface Banner และ Category ของคุณควรอยู่ที่นี่ หรือย้ายไปไฟล์ types)
interface Banner { id: string; title?: string; description?: string; image_url: string; link_url?: string; active: boolean; position: number; }
interface Category { id: number; name: string; image?: string; display_on_homepage?: boolean; }


const Index = () => {
  // --- ไม่ต้องประกาศ navigate หรือฟังก์ชัน handle... ที่นี่แล้ว เพราะ ProductCard จัดการตัวเองได้ ---

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
    fetchBanners();
    fetchFeaturedProducts();
    fetchCategories();
    fetchHomepageCategories();
  }, []);

  // --- โค้ดส่วน Fetching Data ทั้งหมดของคุณ (เหมือนเดิม) ---
  const fetchBanners = async () => { /* ... โค้ดเดิม ... */ };
  const fetchFeaturedProducts = async () => { /* ... โค้ดเดิม ... */ };
  const fetchCategories = async () => { /* ... โค้ดเดิม ... */ };
  const fetchHomepageCategories = async () => { /* ... โค้ดเดิม ... */ };

  // --- 2. แก้ไข: ลบ Component ProductCard และ CategorySection ที่เคยนิยามไว้ตรงนี้ออกไป ---
  // เราจะเขียน JSX โดยตรงด้านล่างแทน

  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => (
    // ... โค้ด BannerSection เดิมของคุณ ...
  );


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* ... โค้ดส่วน Banner ทั้งหมดของคุณ ... */}
      
      {/* หมวดหมู่สินค้าทั้งหมด */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200">
                  <CardContent className="p-2">
                    {/* ... โค้ดแสดงรูป Category ... */}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* สินค้ามาใหม่ */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            // --- 3. แก้ไข: เรียกใช้ ProductCard โดยตรง ---
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            // หมายเหตุ: หากคุณมี Component FeaturedProductsCarousel จริงๆ
            // คุณอาจจะต้องส่ง products เข้าไปให้มัน render ProductCard ข้างในแทน
          )}
        </div>
      </section>
      
      {/* ... Banner ตำแหน่ง 2 ... */}

      {/* แสดงหมวดหมู่ที่เลือกไว้ */}
      {homepageCategories.map((category) => (
        <section key={category.id} className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <Link to={`/categories?category=${encodeURIComponent(category.name)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
                ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            { (categoryProducts[category.name] || []).length > 0 ? (
                // --- 4. แก้ไข: เรียกใช้ ProductCard โดยตรง ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {(categoryProducts[category.name] || []).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>
              )
            }
          </div>
        </section>
      ))}

      {/* ... Banner ตำแหน่ง 3 และ 4 ... */}

    </div>
  );
};

export default Index;
