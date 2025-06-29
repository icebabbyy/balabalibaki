import { useState, useEffect, useCallback } from "react";
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
    id: item.id || 0, name: item.name || "", selling_price: item.selling_price,
    category: item.category || "", image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์", slug: item.slug || String(item.id),
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
  const [loading, setLoading] = useState({ banners: true, featured: true, categories: true, homepageProducts: true });

  const stopLoading = (part: keyof typeof loading) => {
    setLoading(prev => ({...prev, [part]: false}));
  };

  // 1. แยก useEffect สำหรับ Banners
  useEffect(() => {
    supabase.from('banners').select('*').eq('active', true).order('position')
      .then(({ data, error }) => {
        if (error) console.error('Error fetching banners:', error);
        else setBanners(data || []);
        stopLoading('banners');
      });
  }, []);

  // 2. แยก useEffect สำหรับ Featured Products
  useEffect(() => {
    supabase.from('public_products').select('*').limit(12).order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Error fetching featured products:', error);
        else setFeaturedProducts(data?.filter(Boolean).map(mapProduct).filter(Boolean) as ProductPublic[] || []);
        stopLoading('featured');
      });
  }, []);
  
  // 3. แยก useEffect สำหรับ Categories Grid
  useEffect(() => {
    supabase.from("categories").select('*').eq('display_on_homepage', true).order('homepage_order')
      .then(({ data, error }) => {
        if (error) console.error('Error fetching all categories:', error);
        else setAllCategories(data || []);
        stopLoading('categories');
      });
  }, []);

  // 4. แยก useEffect สำหรับสินค้าในหมวดหมู่หน้าแรก
  useEffect(() => {
    const fetchHomepageProducts = async () => {
      const displayCategoryNames = ['Nikke', 'Honkai : Star Rail', 'League of Legends', 'Valorant', 'Zenless Zone Zero'];
      const { data, error } = await supabase.from('public_products').select('*').in('category', displayCategoryNames);
      
      if (error) {
        console.error('Error fetching products for categories:', error);
      } else {
        const mappedProducts = (data || []).filter(Boolean).map(mapProduct).filter(Boolean) as ProductPublic[];
        const productMap: Record<string, ProductPublic[]> = {};
        displayCategoryNames.forEach(catName => {
          productMap[catName] = mappedProducts.filter(p => p.category === catName).slice(0, 5);
        });
        setHomepageCategoryProducts(productMap);
      }
      stopLoading('homepageProducts');
    };
    fetchHomepageProducts();
  }, []);

  const handleProductClick = (productId: number) => {
    const allProducts = [...featuredProducts, ...Object.values(homepageCategoryProducts).flat()];
    const product = allProducts.find((p) => p && p.id === productId);
    if (product) navigate(`/product/${product.slug || product.id}`);
  };

  const isPageLoading = Object.values(loading).some(status => status === true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {isPageLoading ? (
        <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
      ) : (
        <>
          <BannerSection banners={banners.filter(b => b.position === 1)} aspectRatio="1400/400" autoPlay />
          <CategoryGridSection categories={allCategories} />
          <FeaturedProductsSection products={featuredProducts} onProductClick={handleProductClick} />
          <CategorySection title="Honkai : Star Rail" products={homepageCategoryProducts['Honkai : Star Rail']} onProductClick={handleProductClick} />
          <CategorySection title="Nikke" products={homepageCategoryProducts['Nikke']} onProductClick={handleProductClick} />
          <BannerSection banners={banners.filter(b => b.position === 2)} />
          <BannerSection banners={banners.filter(b => b.position === 3)} small autoPlay aspectRatio="1400/300" />
          <CategorySection title="League of Legends" products={homepageCategoryProducts['League of Legends']} onProductClick={handleProductClick} />
          <CategorySection title="Valorant" products={homepageCategoryProducts['Valorant']} onProductClick={handleProductClick} />
          <BannerSection banners={banners.filter(b => b.position === 4)} small aspectRatio="1400/400" />
          <CategorySection title="Zenless Zone Zero" products={homepageCategoryProducts['Zenless Zone Zero']} onProductClick={handleProductClick} />
        </>
      )}
    </div>
  );
};

// --- Helper Components ---
const BannerSection = ({ banners, small, autoPlay, aspectRatio }: { banners: Banner[], small?: boolean, autoPlay?: boolean, aspectRatio?: string}) => {
  if (!banners || banners.length === 0) return null;
  const plugins = autoPlay ? [Autoplay({ delay: 4000, stopOnInteraction: true })] : [];
  return (
   <section className="py-8"><div className={`mx-auto px-4 ${small ? 'max-w-6xl' : 'max-w-7xl'}`}>
       <Carousel plugins={plugins} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map(banner => (<CarouselItem key={banner.id}><Link to={banner.link_url || '#'}><img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-auto object-cover rounded-lg" style={{aspectRatio}}/></Link></CarouselItem>))}
          </CarouselContent>
        </Carousel>
      </div></section>
  );
};
const CategoryGridSection = ({ categories }: { categories: Category[] }) => {
 if (!categories || categories.length === 0) return null;
 return (
   <section className="py-12 bg-white"><div className="max-w-7xl mx-auto px-4">
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
     </div></section>
 );
};
const FeaturedProductsSection = ({ products, onProductClick }: { products: ProductPublic[], onProductClick: (id: number) => void }) => {
 if (!products || products.length === 0) return null;
 return (
   <section className="py-6 bg-gray-50"><div className="max-w-7xl mx-auto px-4">
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
     </div></section>
 );
};
const CategorySection = ({ title, products, onProductClick }: { title: string; products: ProductPublic[]; onProductClick: (id: number) => void; }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="py-12 bg-white"><div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link to={`/categories?category=${encodeURIComponent(title)}`} className="flex items-center text-purple-600">ดูทั้งหมด <ArrowRight size={16} className="ml-1" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((p) => <EnhancedProductCard key={p.id} product={p} onProductClick={onProductClick} />)}
        </div>
      </div></section>
  );
};

export default Index;
