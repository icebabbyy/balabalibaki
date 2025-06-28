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

// Interfaces
interface Banner {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBanners(),
          fetchFeaturedProducts(),
          fetchCategories(), // ต้องดึง categories ทั้งหมดมาด้วย
          fetchHomepageCategories(),
        ]);
      } catch (error) {
        console.error("Failed to fetch initial page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);
  
  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order('homepage_order');
    if (error) console.error('Error fetching categories:', error);
    else setCategories(data || []);
  };

  // (ฟังก์ชัน mapProduct, fetchBanners, fetchFeaturedProducts, fetchHomepageCategories เหมือนเดิม)
  const mapProduct = (item: any): ProductPublic => { /* ...โค้ดเดิม... */ };
  const fetchBanners = async () => { /* ...โค้ดเดิม... */ };
  const fetchFeaturedProducts = async () => { /* ...โค้ดเดิม... */ };
  const fetchHomepageCategories = async () => { /* ...โค้ดเดิม... */ };

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
          {/* Main Banner */}
          {banners.filter(b => b.position === 1).length > 0 && (
            <section className="py-8">
              {/* ... Carousel for main banner ... */}
            </section>
          )}

          {/* ✨✅  ส่วน "หมวดหมู่สินค้า" ที่นำกลับมาให้ครับ ✅✨ */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {categories.filter(c => c.display_on_homepage).map((category) => (
                  <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200">
                      <CardContent className="p-2">
                        <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-purple-500">{category.name}</span>
                            </div>
                          )}
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

          {/* Featured Products Section */}
          <section className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
              <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
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

          {/* Homepage Categories with Products Section */}
          {homepageCategories
            .filter(category => categoryProducts[category.name]?.length > 0)
            .map((category) => (
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
