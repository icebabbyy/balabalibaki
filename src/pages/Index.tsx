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
  display_on_homepage?: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  // Helper function to map Supabase data to our ProductPublic type
  const mapProduct = (item: any): ProductPublic => ({
    id: item.id || 0,
    name: item.name || "",
    selling_price: item.selling_price || 0,
    category: item.category || "",
    image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์",
    slug: item.slug || String(item.id),
    // ✨ FIX 1: แก้ไขให้มองหา `product_images` ที่ถูกต้อง เพื่อให้ Swap Image ทำงานได้
    product_images: Array.isArray(item.product_images) 
      ? item.product_images.filter(img => img && img.image_url) 
      : [],
    // ... other fields
    sku: item.sku || "",
    quantity: item.quantity || 0,
    shipment_date: item.shipment_date || "",
    options: item.options || null,
    product_type: item.product_type || "ETC",
    created_at: item.created_at || "",
    updated_at: item.updated_at || "",
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    description: item.description || "",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลทั้งหมดพร้อมกันเพื่อประสิทธิภาพสูงสุด
        const [bannerData, featuredData, categoryData, homepageProductData] = await Promise.all([
          supabase.from('banners').select('*').eq('active', true).order('position'),
          supabase.from('public_products').select('*').limit(12).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('display_on_homepage', true).order('homepage_order'),
          supabase.from('public_products').select('*').in('category', ['Nikke', 'Honkai : Star Rail', 'League of Legends'])
        ]);

        if (bannerData.error) throw bannerData.error;
        setBanners(bannerData.data || []);

        if (featuredData.error) throw featuredData.error;
        setFeaturedProducts((featuredData.data || []).map(mapProduct));

        if (categoryData.error) throw categoryData.error;
        setAllCategories(categoryData.data || []);
        
        if (homepageProductData.error) throw homepageProductData.error;
        const mappedHomepageProducts = (homepageProductData.data || []).map(mapProduct);
        const productMap: Record<string, ProductPublic[]> = {};
        (categoryData.data || []).forEach(cat => {
            productMap[cat.name] = mappedHomepageProducts
                .filter(p => p.category === cat.name)
                .slice(0, 5);
        });
        setHomepageCategoryProducts(productMap);

      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleProductClick = (productId: number) => {
    const allProducts = [...featuredProducts, ...Object.values(homepageCategoryProducts).flat()];
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          {/* 1. Main Banner Carousel */}
          {banners.filter(b => b.position === 1).length > 0 &&
            <section className="w-full max-w-screen-2xl mx-auto">
              <Carousel plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]} opts={{ loop: true }}>
                <CarouselContent>
                  {banners.filter(b => b.position === 1).map(banner => (
                    <CarouselItem key={banner.id}>
                      <Link to={banner.link_url || '#'}>
                        <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-auto object-cover" />
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>
          }

          {/* 2. "หมวดหมู่สินค้า" Grid Section */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
              {/* ✨ FIX 3: ปรับแก้จำนวนคอลัมน์เพื่อให้รูปเล็กลง */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {allCategories.map((category) => (
                  <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                      <CardContent className="p-0">
                        <div className="relative w-full aspect-square bg-gray-100">
                          <img 
                            src={category.image || '/placeholder.svg'} 
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="font-medium text-xs text-center text-gray-800 p-2 truncate">
                          {category.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* 3. "สินค้ามาใหม่" Carousel Section */}
          <section className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
              <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <EnhancedProductCard product={product} onProductClick={handleProductClick} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
              </Carousel>
            </div>
          </section>
          
          {/* 4. Individual Category Sections */}
          {allCategories
            .filter(cat => homepageCategoryProducts[cat.name]?.length > 0)
            .map((category) => (
              <CategorySection
                key={category.id}
                title={category.name}
                products={homepageCategoryProducts[category.name]}
                categoryName={category.name}
              />
          ))}

        </>
      )}
    </div>
  );
};

export default Index;
