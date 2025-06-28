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

interface Banner { id: string; image_url: string; link_url?: string; position: number; }
interface Category { id: number; name: string; image?: string; }

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  const mapProduct = (item: any): ProductPublic => ({ /* ... โค้ด mapProduct ที่ถูกต้อง ... */ });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const homepageCategoryNames = ['League of Legends', 'Valorant', 'Zenless Zone Zero', 'Nikke', 'Honkai : Star Rail'];
        const [bannerRes, featuredRes, categoryRes, homepageProdRes] = await Promise.all([
          supabase.from('banners').select('*').eq('active', true).order('position'),
          supabase.from('public_products').select('*').limit(12).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('display_on_homepage', true).order('homepage_order'),
          supabase.from('public_products').select('*').in('category', homepageCategoryNames)
        ]);

        if (bannerRes.data) setBanners(bannerRes.data);
        if (featuredRes.data) setFeaturedProducts(featuredRes.data.map(mapProduct));
        if (categoryRes.data) setAllCategories(categoryRes.data);
        
        if (homepageProdRes.data) {
          const mappedHomepageProducts = homepageProdRes.data.map(mapProduct);
          const productMap: Record<string, ProductPublic[]> = {};
          homepageCategoryNames.forEach(catName => {
            productMap[catName] = mappedHomepageProducts.filter(p => p.category === catName).slice(0, 5);
          });
          setHomepageCategoryProducts(productMap);
        }
      } catch (error) { console.error("Failed to fetch homepage data:", error); } 
      finally { setLoading(false); }
    };
    fetchAllData();
  }, []);

  const handleProductClick = (productId: number) => { /* ...โค้ดเดิม... */ };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {loading ? ( <div className="text-center py-20">กำลังโหลด...</div> ) : (
        <>
          {/* 1. Main Banner */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <Carousel plugins={[Autoplay({ delay: 4000 })]} opts={{ loop: true }}>
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

          {/* 2. Product Categories Grid */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                {allCategories.map((category) => (
                   <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`} className="group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-purple-200 transition-all">
                      <img src={category.image || '/placeholder.svg'} alt={category.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                    </div>
                    <h3 className="font-medium text-xs text-center mt-2 group-hover:text-purple-600">{category.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* 3. New Products Carousel + Autoplay */}
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
                <CarouselPrevious className="left-2 hidden md:flex" />
                <CarouselNext className="right-2 hidden md:flex" />
              </Carousel>
            </div>
          </section>
          
          {/* ✨ 4. จัดเรียง Section ใหม่ทั้งหมดตามที่คุณต้องการ */}
          <CategorySection products={homepageCategoryProducts['League of Legends']} title="League of Legends" />
          <BannerSection banners={banners.filter(b => b.position === 2)} />
          <CategorySection products={homepageCategoryProducts['Valorant']} title="Valorant" />
          <CategorySection products={homepageCategoryProducts['Zenless Zone Zero']} title="Zenless Zone Zero" />
          <BannerSection banners={banners.filter(b => b.position === 3)} small autoPlay />
          <BannerSection banners={banners.filter(b => b.position === 4)} small />
        </>
      )}
    </div>
  );
};

// สร้าง Helper components ด้านนอกเพื่อความสะอาด
const CategorySection = ({ title, products }: { title: string; products: ProductPublic[] }) => {
  const navigate = useNavigate();
  if (!products || products.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link to={`/categories?category=${encodeURIComponent(title)}`} className="flex items-center text-purple-600">ดูทั้งหมด <ArrowRight size={16} className="ml-1" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((p) => <EnhancedProductCard key={p.id} product={p} onProductClick={() => navigate(`/product/${p.slug || p.id}`)} />)}
        </div>
      </div>
    </section>
  );
};

const BannerSection = ({ banners, small, autoPlay }: { banners: Banner[], small?: boolean, autoPlay?: boolean}) => {
   if (!banners || banners.length === 0) return null;
   const plugins = autoPlay ? [Autoplay({ delay: 4000 })] : [];
   return (
    <section className="py-8">
       <div className={`mx-auto px-4 ${small ? 'max-w-6xl' : 'max-w-7xl'}`}>
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
   );
};

export default Index;
