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
}

// Helper function to map Supabase data to our ProductPublic type
const mapProduct = (item: any): ProductPublic => ({
  id: item.id || 0,
  name: item.name || "",
  selling_price: item.selling_price || 0,
  category: item.category || "",
  image: item.image || "",
  product_status: item.product_status || "พรีออเดอร์",
  slug: item.slug || String(item.id),
  product_images: Array.isArray(item.product_images) ? item.product_images.filter(img => img && img.image_url) : [],
  tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
  description: item.description || "",
  // Add other fields from ProductPublic type with fallbacks
  sku: item.sku || "",
  quantity: item.quantity || 0,
  shipment_date: item.shipment_date || null,
  options: item.options || null,
  product_type: item.product_type || "",
  created_at: item.created_at || "",
  updated_at: item.updated_at || "",
});

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  const homepageCategoryNames = [ 'League of Legends', 'Valorant', 'Zenless Zone Zero', 'Nikke', 'Honkai : Star Rail' ];

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

        // Process data
        setBanners(bannerRes.data || []);
        setFeaturedProducts((featuredRes.(data || []).filter(Boolean).map(mapProduct)
        setAllCategories(categoryRes.data || []);
        
        const mappedHomepageProducts = (homepageProdRes.data || []).map(mapProduct);
        const productMap: Record<string, ProductPublic[]> = {};
        homepageCategoryNames.forEach(catName => {
            productMap[catName] = mappedHomepageProducts.filter(p => p.category === catName).slice(0, 5);
        });
        setHomepageCategoryProducts(productMap);

      } catch (error) { console.error("Failed to fetch homepage data:", error); } 
      finally { setLoading(false); }
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
        <div className="flex justify-center items-center h-screen"><p>กำลังโหลด...</p></div>
      ) : (
        <>
          {/* 1. แบนเนอร์อันแรก (ขนาดที่เหมาะสม) */}
          <BannerSection banners={banners.filter(b => b.position === 1)} aspectRatio="1400/400" maxWidth="max-w-7xl" />

          {/* 2. หมวดหมู่ทั้งหมด (ขนาด ~200px) */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-4">
                {allCategories.map((category) => (
                  <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`} className="group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-purple-200 transition-all">
                      <img src={category.image || '/placeholder.svg'} alt={category.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                    </div>
                    <h3 className="font-medium text-xs text-center mt-2 group-hover:text-purple-600 truncate">{category.name}</h3>
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
                <CarouselPrevious className="left-2 hidden md:flex" />
                <CarouselNext className="right-2 hidden md:flex" />
              </Carousel>
            </div>
          </section>
          
          {/* 4 & 5. หมวดสินค้าตามลำดับ */}
          <CategorySection products={homepageCategoryProducts['Nikke']} title="Nikke" />
          <CategorySection products={homepageCategoryProducts['Honkai : Star Rail']} title="Honkai : Star Rail" />
          
          {/* 6. แบนเนอร์ 2 */}
          <BannerSection banners={banners.filter(b => b.position === 2)} />
          
          {/* 7. แบนเนอร์ 3 (ขนาดเล็ก + Autoplay) */}
          <BannerSection banners={banners.filter(b => b.position === 3)} small autoPlay aspectRatio="1400/300" />
          
          {/* 8 & 9. หมวดสินค้าตามลำดับ */}
          <CategorySection products={homepageCategoryProducts['League of Legends']} title="League of Legends" />
          <CategorySection products={homepageCategoryProducts['Valorant']} title="Valorant" />
          
          {/* 10. แบนเนอร์ 4 (ขนาดเล็ก) */}
          <BannerSection banners={banners.filter(b => b.position === 4)} small aspectRatio="1400/400" />
        </>
      )}
    </div>
  );
};

// Helper Components
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((p) => <EnhancedProductCard key={p.id} product={p} onProductClick={() => navigate(`/product/${p.slug || p.id}`)} />)}
        </div>
      </div>
    </section>
  );
};

const BannerSection = ({ banners, small = false, autoPlay = false, aspectRatio = '1400/400' }: { banners: Banner[], small?: boolean, autoPlay?: boolean, aspectRatio?: string }) => {
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
                   <img src={banner.image_url} alt="Banner" className="w-full h-auto object-cover rounded-lg" style={{aspectRatio}}/>
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
