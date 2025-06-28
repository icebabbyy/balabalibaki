// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";
import { transformProductData } from "@/utils/transform";

interface Banner { /* ... */ }
interface Category { /* ... */ }

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  // ✨ FIX: เพิ่มหมวดหมู่ที่คุณต้องการแสดงผลในหน้าแรก
  const displayCategoryNames = [
    'League of Legends', 
    'Valorant', 
    'Zenless Zone Zero', 
    'Nikke', 
    'Honkai : Star Rail'
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [bannerData, featuredData, categoryData, homepageProductData] = await Promise.all([
          supabase.from('banners').select('*').eq('active', true).order('position'),
          supabase.from('public_products').select('*').limit(12).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('display_on_homepage', true).order('homepage_order'),
          supabase.from('public_products').select('*').in('category', displayCategoryNames)
        ]);

        // (ส่วน process data เหมือนเดิม)
        setBanners(bannerData.data || []);
        setFeaturedProducts((featuredData.data || []).map(transformProductData));
        setAllCategories(categoryData.data || []);
        const mappedHomepageProducts = (homepageProductData.data || []).map(transformProductData);
        const productMap: Record<string, ProductPublic[]> = {};
        (categoryData.data || []).concat(homepageProductData.data || []).forEach(cat => {
            if (cat && cat.name) {
                productMap[cat.name] = mappedHomepageProducts
                    .filter(p => p.category === cat.name)
                    .slice(0, 5);
            }
        });
        setHomepageCategoryProducts(productMap);

      } catch (error) { console.error("Failed to fetch homepage data:", error); } 
      finally { setLoading(false); }
    };
    fetchAllData();
  }, []);

  const handleProductClick = (productId: number) => { /* ...โค้ดเดิม... */ };

  const CategorySection = ({ title, products }: { title: string; products: ProductPublic[] }) => (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link to={`/categories?category=${encodeURIComponent(title)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {products.map((product) => (
            <EnhancedProductCard key={product.id} product={product} onProductClick={handleProductClick} />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {loading ? (
        <div className="text-center py-20">...Loading...</div>
      ) : (
        <>
          {/* ✨ FIX: จัดเรียง Layout ใหม่ทั้งหมดตามที่คุณต้องการ */}
          
          {/* 1. Main Banner (ปรับขนาด) */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">
               {/* Carousel for main banner, position 1 */}
            </div>
          </section>

          {/* 2. Product Categories Grid */}
          <section className="py-12 bg-white">
             {/* ... Grid ของ หมวดหมู่สินค้า ... */}
          </section>

          {/* 3. New Products Carousel */}
          <section className="py-6 bg-gray-50">
            {/* ... Carousel ของ สินค้ามาใหม่ ... */}
          </section>

          {/* 4. League of Legends Section */}
          {homepageCategoryProducts['League of Legends'] && (
            <CategorySection title="League of Legends" products={homepageCategoryProducts['League of Legends']} />
          )}

          {/* 5. Banner 2 */}
          <section className="py-8">
            {/* ... Banner ที่มี position 2 ... */}
          </section>
          
          {/* 6. Valorant Section */}
          {homepageCategoryProducts['Valorant'] && (
            <CategorySection title="Valorant" products={homepageCategoryProducts['Valorant']} />
          )}

          {/* 7. Zenless Zone Zero Section */}
          {homepageCategoryProducts['Zenless Zone Zero'] && (
            <CategorySection title="Zenless Zone Zero" products={homepageCategoryProducts['Zenless Zone Zero']} />
          )}
          
          {/* 8. Banner 3 */}
           <section className="py-8">
            {/* ... Banner ที่มี position 3 ... */}
          </section>

          {/* 9. Banner 4 */}
           <section className="py-8">
            {/* ... Banner ที่มี position 4 ... */}
          </section>
          
          {/* 10. ที่เหลือ (ถ้ามี) */}
           {['Nikke', 'Honkai : Star Rail'].map(catName => 
             homepageCategoryProducts[catName] && (
               <CategorySection key={catName} title={catName} products={homepageCategoryProducts[catName]} />
             )
           )}
        </>
      )}
    </div>
  );
};

export default Index;
