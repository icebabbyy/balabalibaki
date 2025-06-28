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

// Interfaces
interface Banner {
  id: string;
  image_url: string;
  link_url?: string;
  position: number;
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

  // ✨ รายชื่อหมวดหมู่ที่จะดึงมาแสดงผลในหน้าแรก
  const homepageCategoryNames = [
    'League of Legends', 
    'Valorant', 
    'Zenless Zone Zero', 
    'Nikke', 
    'Honkai : Star Rail'
  ];

  // Helper function to map Supabase data correctly
  const mapProduct = (item: any): ProductPublic => ({
    id: item.id || 0,
    name: item.name || "",
    selling_price: item.selling_price || 0,
    category: item.category || "",
    image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์",
    slug: item.slug || String(item.id),
    product_images: Array.isArray(item.product_images) 
      ? item.product_images.filter(img => img && img.image_url) 
      : [],
    // ... other fields from your ProductPublic type
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [bannerRes, featuredRes, categoryRes, homepageProdRes] = await Promise.all([
          supabase.from('banners').select('*').eq('active', true).order('position'),
          supabase.from('public_products').select('*').limit(12).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('display_on_homepage', true).order('homepage_order'),
          supabase.from('public_products').select('*').in('category', homepageCategoryNames)
        ]);

        if (bannerRes.error) throw bannerRes.error;
        setBanners(bannerRes.data || []);

        if (featuredRes.error) throw featuredRes.error;
        setFeaturedProducts((featuredRes.data || []).map(mapProduct));

        if (categoryRes.error) throw categoryRes.error;
        setAllCategories(categoryRes.data || []);
        
        if (homepageProdRes.error) throw homepageProdRes.error;
        const mappedHomepageProducts = (homepageProdRes.data || []).map(mapProduct);
        const productMap: Record<string, ProductPublic[]> = {};
        homepageCategoryNames.forEach(catName => {
            productMap[catName] = mappedHomepageProducts
                .filter(p => p.category === catName)
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
          {/* 1. แบนเนอร์อันแรก (ขนาดที่เหมาะสม) */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <Carousel plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]} opts={{ loop: true }}>
                <CarouselContent>
                  {banners.filter(b => b.position === 1).map(banner => (
                    <CarouselItem key={banner.id}>
                      <Link to={banner.link_url || '#'}>
                        <img src={banner.image_url} alt="Banner" className="w-full h-auto object-cover rounded-lg" style={{aspectRatio: '1400/400'}}/>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </section>

          {/* 2. หมวดหมู่ทั้งหมด (แบบที่คุณชอบ) */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-4">
                {allCategories.map((category) => (
                  <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                    <div className="group cursor-pointer">
                      <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gray-100 border-2 border-transparent group-hover:border-purple-200 transition-all">
                        <img 
                          src={category.image || '/placeholder.svg'} 
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="font-medium text-xs text-center text-gray-800 group-hover:text-purple-600 line-clamp-2 leading-tight">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* 3. สินค้ามาใหม่ (เลื่อนอัตโนมัติ) */}
          <section className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
              <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}>
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((product) => (
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
          
          {/* 4 & 5. หมวดสินค้าอะไรก็ได้ 2 อันแรก */}
          {homepageCategoryProducts['Nikke'] && homepageCategoryProducts['Nikke'].length > 0 &&
            <CategorySection title="Nikke" products={homepageCategoryProducts['Nikke']} categoryName="Nikke" />
          }
          {homepageCategoryProducts['Honkai : Star Rail'] && homepageCategoryProducts['Honkai : Star Rail'].length > 0 &&
            <CategorySection title="Honkai : Star Rail" products={homepageCategoryProducts['Honkai : Star Rail']} categoryName="Honkai : Star Rail" />
          }
          
          {/* 6. แบนเนอร์ 2 */}
          {banners.filter(b => b.position === 2).length > 0 && <BannerSection banners={banners.filter(b => b.position === 2)} />}

          {/* 7. แบนเนอร์ 3 (ขนาดเล็ก + Autoplay) */}
          {banners.filter(b => b.position === 3).length > 0 && <BannerSection banners={banners.filter(b => b.position === 3)} small autoPlay />}
          
          {/* 8 & 9. หมวดสินค้าอีก 2 อัน */}
          {homepageCategoryProducts['League of Legends'] && homepageCategoryProducts['League of Legends'].length > 0 &&
            <CategorySection title="League of Legends" products={homepageCategoryProducts['League of Legends']} categoryName="League of Legends" />
          }
          {homepageCategoryProducts['Valorant'] && homepageCategoryProducts['Valorant'].length > 0 &&
             <CategorySection title="Valorant" products={homepageCategoryProducts['Valorant']} categoryName="Valorant" />
          }

          {/* 10. แบนเนอร์ 4 (ขนาดเล็ก) */}
          {banners.filter(b => b.position === 4).length > 0 && <BannerSection banners={banners.filter(b => b.position === 4)} small />}
        </>
      )}
    </div>
  );
};

// สร้าง BannerSection ให้ยืดหยุ่นขึ้น
const BannerSection = ({ banners, small = false, autoPlay = false }: { banners: Banner[], small?: boolean, autoPlay?: boolean }) => {
  const plugins = autoPlay ? [Autoplay({ delay: 3500, stopOnInteraction: true })] : [];
  return (
    <section className="py-8">
      <div className={`${small ? 'max-w-6xl' : 'max-w-7xl'} mx-auto px-4`}>
        <Carousel plugins={plugins} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map(banner => (
              <CarouselItem key={banner.id}>
                <Link to={banner.link_url || '#'}>
                  <img src={banner.image_url} alt="Banner" className="w-full h-auto object-cover rounded-lg" style={{aspectRatio: small ? '1400/300' : '1400/400'}}/>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
};

export default Index;
