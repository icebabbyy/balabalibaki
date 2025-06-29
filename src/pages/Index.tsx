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
interface Banner { id: string; image_url: string; link_url?: string; position: number; title?: string }
interface Category { id: number; name: string; image?: string; display_on_homepage?: boolean }

// Helper function to map data safely
const mapProduct = (item: any): ProductPublic | null => {
  if (!item) return null;
  return {
    id: item.id || 0,
    name: item.name || "",
    selling_price: item.selling_price,
    category: item.category || "",
    image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์",
    slug: item.slug || String(item.id),
    product_images: Array.isArray(item.product_images) ? item.product_images.filter(img => img && img.image_url) : [],
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
  };
};

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const homepageCategoryNames = ['League of Legends', 'Valorant', 'Zenless Zone Zero', 'Nikke', 'Honkai : Star Rail'];
        
        const [bannerRes, featuredRes, categoryRes, homepageProdRes] = await Promise.allSettled([
          supabase.from('banners').select('*').eq('active', true).order('position'),
          supabase.from('public_products').select('*').limit(12).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('display_on_homepage', true).order('homepage_order'),
          supabase.from('public_products').select('*').in('category', homepageCategoryNames)
        ]);

        if (bannerRes.status === 'fulfilled' && bannerRes.value.data) setBanners(bannerRes.value.data.filter(Boolean));
        if (featuredRes.status === 'fulfilled' && featuredRes.value.data) setFeaturedProducts(featuredRes.value.data.filter(Boolean).map(mapProduct).filter(Boolean) as ProductPublic[]);
        if (categoryRes.status === 'fulfilled' && categoryRes.value.data) setAllCategories(categoryRes.value.data.filter(Boolean));
        
        if (homepageProdRes.status === 'fulfilled' && homepageProdRes.value.data) {
          const mappedHomepageProducts = homepageProdRes.value.data.filter(Boolean).map(mapProduct).filter(Boolean) as ProductPublic[];
          const productMap: Record<string, ProductPublic[]> = {};
          homepageCategoryNames.forEach(catName => {
            productMap[catName] = mappedHomepageProducts.filter(p => p.category === catName).slice(0, 5);
          });
          setHomepageCategoryProducts(productMap);
        }
      } catch (error) { 
        console.error("A critical error occurred during data fetching:", error);
      } finally { 
        setLoading(false); 
      }
    };
    fetchAllData();
  }, []);

  const handleProductClick = (productId: number) => {
    const allProducts = [...featuredProducts, ...Object.values(homepageCategoryProducts).flat()];
    const product = allProducts.find((p) => p && p.id === productId);
    if (product) navigate(`/product/${product.slug || product.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {loading ? (
        <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
      ) : (
        <>
          {/* 1. แบนเนอร์อันแรก + Autoplay */}
          <BannerSection banners={banners.filter(b => b.position === 1)} aspectRatio="1400/400" autoPlay />

          {/* 2. หมวดหมู่ทั้งหมด ขนาด ~200px */}
          <CategoryGridSection categories={allCategories} />

          {/* 3. สินค้ามาใหม่ + Autoplay */}
          <FeaturedProductsSection products={featuredProducts} onProductClick={handleProductClick} />
          
          {/* 4. จัดเรียง Section ตามลำดับที่คุณต้องการ */}
          <CategorySection products={homepageCategoryProducts['Honkai : Star Rail']} title="Honkai : Star Rail" onProductClick={handleProductClick} />
          <CategorySection products={homepageCategoryProducts['Nikke']} title="Nikke" onProductClick={handleProductClick} />

          <BannerSection banners={banners.filter(b => b.position === 2)} />
          
          <BannerSection banners={banners.filter(b => b.position === 3)} small autoPlay aspectRatio="1400/300" />
          
          <CategorySection products={homepageCategoryProducts['League of Legends']} title="League of Legends" onProductClick={handleProductClick} />
          <CategorySection products={homepageCategoryProducts['Valorant']} title="Valorant" onProductClick={handleProductClick} />
          
          <BannerSection banners={banners.filter(b => b.position === 4)} small aspectRatio="1400/400" />
          
          <CategorySection products={homepageCategoryProducts['Zenless Zone Zero']} title="Zenless Zone Zero" onProductClick={handleProductClick} />
        </>
      )}
    </div>
  );
};

// --- Helper Components ---
const BannerSection = ({ banners, small = false, autoPlay = false, aspectRatio = '1400/400' }: { banners: Banner[], small?: boolean, autoPlay?: boolean, aspectRatio?: string }) => {
   if (!banners || banners.length === 0) return null;
   const plugins = autoPlay ? [Autoplay({ delay: 4000, stopOnInteraction: true })] : [];
   return (
    <section className="py-8">
       <div className={`mx-auto px-4 ${small ? 'max-w-6xl' : 'max-w-7xl'}`}>
        <Carousel plugins={plugins} opts={{ loop: true }}>
           <CarouselContent>
             {banners.map(banner => (
               <CarouselItem key={banner.id}>
                 <Link to={banner.link_url || '#'}>
                   <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-auto object-cover rounded-lg" style={{aspectRatio}}/>
                 </Link>
               </CarouselItem>
             ))}
           </CarouselContent>
         </Carousel>
       </div>
    </section>
   );
};

const CategoryGridSection = ({ categories }: { categories: Category[] }) => {
  if (!categories || categories.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
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
  );
};

const FeaturedProductsSection = ({ products, onProductClick }: { products: ProductPublic[], onProductClick: (id: number) => void }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
        <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}>
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <EnhancedProductCard product={product} onProductClick={onProductClick} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 hidden md:flex" />
          <CarouselNext className="right-2 hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

const CategorySection = ({ title, products, onProductClick }: { title: string; products: ProductPublic[]; onProductClick: (id: number) => void; }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link to={`/categories?category=${encodeURIComponent(title)}`} className="flex items-center text-purple-600">ดูทั้งหมด <ArrowRight size={16} className="ml-1" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((p) => <EnhancedProductCard key={p.id} product={p} onProductClick={onProductClick} />)}
        </div>
      </div>
    </section>
  );
};

export default Index;
