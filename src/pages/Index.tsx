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

// ✨ นำเข้าคอมโพเนนต์และฟังก์ชันที่แยกออกไป
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";
import { transformProductData } from "@/utils/transform";

interface Banner {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
}
interface Category {
  id: number;
  name: string;
  image?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      // ✅ FIX: ทำให้การ fetch ทั้งหมดทำงานพร้อมกัน และรอจนเสร็จทั้งหมด
      try {
        await Promise.all([
          fetchBanners(),
          fetchFeaturedProducts(),
          fetchHomepageCategories(),
        ]);
      } catch (error) {
        console.error("Failed to fetch initial page data:", error);
      } finally {
        // ✅ FIX: ตั้งค่า loading เป็น false แค่ครั้งเดียว หลังทุกอย่างเสร็จ
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase.from('banners').select('*').eq('active', true).order('position');
    if (error) { console.error('Error fetching banners:', error); return; }
    setBanners(data || []);
  };

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase.from('public_products').select('*').limit(8).order('created_at', { ascending: false });
    if (error) { console.error('Error fetching featured products:', error); return; }
    // ✨ ใช้ฟังก์ชันแปลงข้อมูลที่ import มา
    setFeaturedProducts((data || []).map(transformProductData));
  };

  const fetchHomepageCategories = async () => {
    const displayCategoryNames = ['Nikke', 'Honkai : Star Rail', 'League of Legends'];
    
    const { data: categories, error: catError } = await supabase.from('categories').select('*').in('name', displayCategoryNames);
    if (catError) { console.error('Error fetching homepage categories:', catError); return; }
    
    if (categories && categories.length > 0) {
      setHomepageCategories(categories);
      const { data: products, error: prodError } = await supabase.from('public_products').select('*').in('category', displayCategoryNames);
      if (prodError) { console.error('Error fetching products for categories:', prodError); return; }

      const mappedProducts = (products || []).map(transformProductData);
      const productMap: Record<string, ProductPublic[]> = {};
      categories.forEach(cat => {
        productMap[cat.name] = mappedProducts.filter(p => p.category === cat.name).slice(0, 5);
      });
      setCategoryProducts(productMap);
    }
  };

  const handleProductClick = (productId: number) => {
    const allProducts = [...featuredProducts, ...Object.values(categoryProducts).flat()];
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      navigate(`/product/${product.slug || product.id}`);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>กำลังโหลด...</p>
        </div>
      ) : (
        <>
          {banners.filter(b => b.position === 1).length > 0 && 
            <section> {/* Banner Section JSX */}</section>
          }

          <section className="py-6">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
              <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}>
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <EnhancedProductCard product={product} onProductClick={handleProductClick} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          </section>

          {homepageCategories.map((category) => (
            <CategorySection
              key={category.id}
              title={category.name}
              products={categoryProducts[category.name] || []}
              categoryName={category.name}
            />
          ))}

          {/* ... Other Banners ... */}
        </>
      )}
    </div>
  );
};

export default Index;
