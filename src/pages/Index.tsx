// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ✨ FIX: เพิ่ม import ที่ขาดไป
import Header from "@/components/Header"; 
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product"; // สมมติว่า type นี้มีอยู่จริงและถูกต้อง

// Interfaces (คงไว้เหมือนเดิม)
interface Banner {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  link_url?: string;
  active: boolean;
  position: number;
}

interface Category {
  id: number;
  name: string;
  image?: string;
}

const Index = () => {
  const navigate = useNavigate();

  // ✨ FEATURE: คง State ของ Banner ทั้ง 4 ตำแหน่งไว้ครบถ้วน
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);

  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{ [key: string]: ProductPublic[] }>({});
  const [loading, setLoading] = useState(true);

  // ✨ IMPROVEMENT: ปรับปรุงการดึงข้อมูลให้มีประสิทธิภาพด้วย Promise.all
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBanners(),
          fetchFeaturedProducts(),
          fetchCategories(),
          fetchHomepageCategories()
        ]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- DATA FETCHING FUNCTIONS ---

  // ✨ FEATURE: คงการดึง Banner ทุกตำแหน่งไว้
  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      
      const allBanners = data || [];
      setMainBanners(allBanners.filter(b => b.position === 1));
      setSecondBanners(allBanners.filter(b => b.position === 2));
      setThirdBanners(allBanners.filter(b => b.position === 3));
      setFourthBanners(allBanners.filter(b => b.position === 4));
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };
  
  const transformProduct = (item: any): ProductPublic => ({
    id: item.id || 0,
    name: item.name || '',
    selling_price: item.selling_price || 0,
    category: item.category || '',
    description: item.description || '',
    image: item.image || '',
    product_status: item.product_status || 'พรีออเดอร์',
    sku: item.sku || '',
    quantity: item.quantity || 0,
    shipment_date: item.shipment_date || '',
    options: item.options || null,
    images_list: item.images_list || [],
    product_type: item.product_type || 'ETC',
    created_at: item.created_at || '',
    updated_at: item.updated_at || '',
    tags: item.tags || [],
    slug: item.slug || String(item.id),
  });

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase.from('public_products').select('*').limit(10);
      if (error) throw error;
      setFeaturedProducts((data || []).map(transformProduct));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchHomepageCategories = async () => {
    try {
      const displayCategories = ['Nikke', 'Honkai : Star Rail', 'League of Legends'];
      const { data: categoriesData, error: catError } = await supabase.from('categories').select('*').in('name', displayCategories);
      if (catError) throw catError;
      setHomepageCategories(categoriesData || []);

      const { data: productsData, error: prodError } = await supabase.from('public_products').select('*').in('category', displayCategories).limit(15);
      if (prodError) throw prodError;
      
      const allProducts = (productsData || []).map(transformProduct);
      const productsByCategory: { [key: string]: ProductPublic[] } = {};
      displayCategories.forEach(name => {
        productsByCategory[name] = allProducts.filter(p => p.category === name).slice(0, 5);
      });
      setCategoryProducts(productsByCategory);
    } catch (error) {
      console.error('Error fetching homepage categories:', error);
    }
  };
  
  const handleProductClick = (product: ProductPublic) => {
    navigate(`/product/${product.slug || product.id}`);
  };

  // --- SUB-COMPONENTS ---
  const ProductCard = ({ product }: { product: ProductPublic }) => {
    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Logic to add to cart
      toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Logic to add to cart and navigate
      navigate('/cart');
    };

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full" onClick={() => handleProductClick(product)}>
        <div className="relative">
          <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
          {product.product_status && (
            <Badge className={`absolute top-2 left-2 border-transparent ${product.product_status === 'พร้อมส่ง' ? 'bg-green-500 text-white' : 'bg-purple-600 text-white'}`}>
              {product.product_status} {/* ✨ FIX: เพิ่มข้อความใน Badge */}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
          <span className="text-lg font-bold text-purple-600">฿{product.selling_price?.toLocaleString()}</span>
          <div className="space-y-2 mt-auto pt-3">
            <Button size="sm" className="w-full" onClick={handleBuyNow}>
              <CreditCard className="h-4 w-4 mr-2" /> ซื้อเดี๋ยวนี้
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" /> เพิ่มลงตะกร้า
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>
        )}
      </div>
    </section>
  );

  const BannerSection = ({ banners }: { banners: Banner[] }) => (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {banners.map(banner => (
          <div key={banner.id} className="rounded-lg overflow-hidden">
            <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-auto object-contain" />
          </div>
        ))}
      </div>
    </section>
  );

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {loading ? (
        <div className="text-center py-20">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          {/* Main Banner Section */}
          {mainBanners.length > 0 && (
            <section className="relative">
              <div className="max-w-7xl mx-auto px-4 py-8">
                  <Carousel plugins={[Autoplay({ delay: 4000 })]} opts={{ align: "start", loop: true }}>
                      <CarouselContent>
                          {mainBanners.map((banner) => (
                              <CarouselItem key={banner.id}>
                                  <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                                      <img src={banner.image_url || '/placeholder.svg'} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                                  </div>
                              </CarouselItem>
                          ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                  </Carousel>
              </div>
            </section>
          )}

          {/* Categories Section */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
                {categories.map((category) => (
                  <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-transparent group-hover:border-purple-500 transition-all">
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover"/>
                      </div>
                      <h3 className="font-medium text-sm text-center text-gray-800">{category.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ✨ FIX: แก้ไข FeaturedProductsCarousel ที่เคยพัง โดยสร้าง Carousel ขึ้นมาใหม่ตรงนี้เลย */}
          <section className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
              <Carousel opts={{ align: "start" }}>
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-[-20px]"/>
                <CarouselNext className="right-[-20px]"/>
              </Carousel>
            </div>
          </section>

          {/* ✨ FEATURE: คง Banner Sections และ Category Sections อื่นๆ ไว้ครบ */}
          {secondBanners.length > 0 && <BannerSection banners={secondBanners} />}
          {homepageCategories.map((category) => (
            (categoryProducts[category.name]?.length ?? 0) > 0 &&
            <CategorySection
              key={category.id}
              title={category.name}
              products={categoryProducts[category.name]}
              categoryName={category.name}
            />
          ))}
          {thirdBanners.length > 0 && <BannerSection banners={thirdBanners} />}
          {fourthBanners.length > 0 && <BannerSection banners={fourthBanners} />}
        </>
      )}
    </div>
  );
};

export default Index;
