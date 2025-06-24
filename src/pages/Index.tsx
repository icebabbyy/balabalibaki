import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import EnhancedProductCard from "@/components/EnhancedProductCard"; // <-- ใช้การ์ดมาตรฐาน

interface Banner {
  id: string; title?: string; description?: string; image_url: string;
  link_url?: string; active: boolean; position: number;
}
interface Category {
  id: number; name: string; image?: string; display_on_homepage?: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBanners(),
      fetchFeaturedProducts(),
      fetchCategories(),
      fetchHomepageCategories(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await supabase.from('banners').select('*').eq('active', true).order('position', { ascending: true });
      const position1 = (data || []).filter(banner => banner.position === 1);
      const position2 = (data || []).filter(banner => banner.position === 2);
      const position3 = (data || []).filter(banner => banner.position === 3);
      const position4 = (data || []).filter(banner => banner.position === 4);
      setMainBanners(position1);
      setSecondBanners(position2);
      setThirdBanners(position3);
      setFourthBanners(position4);
    } catch (error) { console.error('Error fetching banners:', error); }
  };
  
  // ปรับปรุงการดึงข้อมูลให้ดีขึ้น
  const fetchAndMapProducts = async (queryBuilder: any) => {
    const { data, error } = await queryBuilder;
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return (data || []).map((item: any) => {
        // หา main image จากข้อมูลที่ join มา
        const mainImage = item.image || item.product_images?.find((img: any) => img.order === 1)?.image_url || item.product_images?.[0]?.image_url || '';
        return {
            id: item.id || 0,
            name: item.product_name || item.name || '',
            selling_price: item.selling_price || 0,
            category: item.category || '',
            description: item.description || '',
            image: mainImage,
            product_status: item.product_status || 'พรีออเดอร์',
            sku: item.product_sku || item.sku || '',
            quantity: item.quantity || 0,
            shipment_date: item.shipment_date || '',
            options: item.options || null,
            product_type: item.product_type || 'ETC',
            created_at: item.created_at || '',
            updated_at: item.updated_at || '',
            product_images: item.product_images || [],
        };
    }) as ProductPublic[];
  };

  const fetchFeaturedProducts = async () => {
    try {
      const products = await fetchAndMapProducts(
        supabase.from('products').select('*, product_images(image_url, "order")').limit(8)
      );
      setFeaturedProducts(products);
    } catch (error) { console.error('Error fetching featured products:', error); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    } catch (error) { console.error('Error fetching categories:', error); }
  };

  const fetchHomepageCategories = async () => {
    try {
      const displayCategories = ['Nikke', 'Honkai : Star Rail', 'League of Legends'];
      const categoriesData = [];
      const productsData: {[key: string]: ProductPublic[]} = {};
      for (const categoryName of displayCategories) {
        const { data: categoryInfo } = await supabase.from('categories').select('*').eq('name', categoryName).single();
        if (categoryInfo) {
          categoriesData.push(categoryInfo);
          const products = await fetchAndMapProducts(
            supabase.from('products').select('*, product_images(image_url, "order")').eq('category', categoryName).limit(5)
          );
          productsData[categoryName] = products;
        }
      }
      setHomepageCategories(categoriesData);
      setCategoryProducts(productsData);
    } catch (error) { console.error('Error fetching homepage categories:', error); }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <EnhancedProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>
        )}
      </div>
    </section>
  );

  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => (
    <section className="py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {title && <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>}
        {banners.length > 0 ? (
          <div className="h-40 md:h-60 rounded-lg overflow-hidden">
            <Carousel className="w-full h-full" plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]} opts={{ align: "start", loop: true }}>
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative h-40 md:h-60 overflow-hidden rounded-lg">
                      <img src={banner.image_url || '/placeholder.svg'} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        ) : (
          <div className="h-40 md:h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">ส่วนลดพิเศษ</h3>
              <p className="text-sm md:text-base">สินค้าคุณภาพ ราคาดีที่สุด</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="relative">
        {mainBanners.length > 0 ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Carousel className="w-full h-64 md:h-80" plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]} opts={{ align: "start", loop: true }}>
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
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="h-64 md:h-80 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">ยินดีต้อนรับสู่ Lucky Shop</h2>
                <p className="text-sm md:text-base">สินค้าจากจีนคุณภาพดี ราคาดี</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200">
                  <CardContent className="p-2">
                    <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
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

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse"><div className="h-48 bg-gray-200 rounded-t-lg"></div><CardContent className="p-4"><div className="h-4 bg-gray-200 rounded mb-2"></div><div className="h-4 bg-gray-200 rounded w-2/3"></div></CardContent></Card>
              ))}
            </div>
          ) : (
            <FeaturedProductsCarousel products={featuredProducts} onProductClick={handleProductClick} />
          )}
        </div>
      </section>

      {secondBanners.length > 0 && <BannerSection banners={secondBanners} />}
      {homepageCategories.map((category) => (
        <CategorySection key={category.id} title={category.name} products={categoryProducts[category.name] || []} categoryName={category.name} />
      ))}
      {thirdBanners.length > 0 && <BannerSection banners={thirdBanners} />}
      {fourthBanners.length > 0 && <BannerSection banners={fourthBanners} />}
    </div>
  );
};

export default Index;
