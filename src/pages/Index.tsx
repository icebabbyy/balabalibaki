import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";

interface Banner {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  link_url?: string;
  active: boolean;
  position: number;
}

interface Product {
  id: number;
  name: string;
  selling_price: number;
  image: string;
  status?: string;
  category: string;
}

interface Category {
  id: number;
  name: string;
  image?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nikkeProducts, setNikkeProducts] = useState<Product[]>([]);
  const [honkaiProducts, setHonkaiProducts] = useState<Product[]>([]);
  const [lolProducts, setLolProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
    fetchCategories();
    fetchCategoryProducts();
  }, []);

  const fetchBanners = async () => {
    try {
      console.log('Fetching banners...');
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .eq('position', 1) // Only get position 1 banners for main carousel
        .order('created_at', { ascending: false });
      
      console.log('Fetched banners:', data);
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data } = await supabase
        .from('public_products')
        .select('*')
        .limit(8);
      
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*');
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategoryProducts = async () => {
    try {
      // Fetch Nikke products
      const { data: nikkeData } = await supabase
        .from('public_products')
        .select('*')
        .eq('category', 'Nikke')
        .limit(5);
      
      // Fetch Honkai Star Rail products
      const { data: honkaiData } = await supabase
        .from('public_products')
        .select('*')
        .eq('category', 'Honkai : Star Rail')
        .limit(5);
      
      // Fetch League of Legends products
      const { data: lolData } = await supabase
        .from('public_products')
        .select('*')
        .eq('category', 'League of Legends')
        .limit(5);

      setNikkeProducts(nikkeData || []);
      setHonkaiProducts(honkaiData || []);
      setLolProducts(lolData || []);
    } catch (error) {
      console.error('Error fetching category products:', error);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const addToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      quantity: 1,
      image: product.image
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    alert('เพิ่มสินค้าลงตะกร้าแล้ว');
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
          onClick={() => handleProductClick(product.id)}
        />
        {product.status && (
          <Badge className="absolute top-2 left-2 bg-purple-600">
            {product.status}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2" onClick={() => handleProductClick(product.id)}>{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-purple-600">
            ฿{product.selling_price?.toLocaleString()}
          </span>
        </div>
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => handleProductClick(product.id)}
          >
            ซื้อเดี๋ยวนี้
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const CategorySection = ({ title, products, categoryName }: { title: string; products: Product[]; categoryName: string }) => (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link 
            to={`/categories?category=${encodeURIComponent(categoryName)}`}
            className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            ไม่พบสินค้าในหมวดหมู่นี้
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* แบนเนอร์ขนาดกลางแบบ Auto Carousel - Position 1 only */}
      <section className="relative">
        {banners.length > 0 ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Carousel 
              className="w-full h-64 md:h-80"
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: true,
                })
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                      <img
                        src={banner.image_url || '/placeholder.svg'}
                        alt={banner.title || 'Banner'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Banner image failed to load:', banner.image_url);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {(banner.title || banner.description) && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="text-center text-white max-w-md px-4">
                            {banner.title && <h2 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h2>}
                            {banner.description && <p className="text-sm md:text-base">{banner.description}</p>}
                          </div>
                        </div>
                      )}
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

      {/* หมวดหมู่สินค้าทั้งหมด - เน้นรูปภาพ */}
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
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
                        </div>
                      )}
                      {/* เอฟเฟกต์ overlay เมื่อ hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
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

      {/* สินค้ามาใหม่ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* หมวดหมู่ยอดนิยม - Nikke */}
      <CategorySection title="Nikke" products={nikkeProducts} categoryName="Nikke" />

      {/* แบนเนอร์รูปภาพ */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-40 md:h-60 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">ส่วนลดพิเศษ</h3>
              <p className="text-sm md:text-base">สินค้าคุณภาพ ราคาดีที่สุด</p>
            </div>
          </div>
        </div>
      </section>

      {/* หมวดหมู่ยอดนิยม - Honkai : Star Rail */}
      <CategorySection title="Honkai : Star Rail" products={honkaiProducts} categoryName="Honkai : Star Rail" />

      {/* หมวดหมู่ยอดนิยม - League of Legends */}
      <CategorySection title="League of Legends" products={lolProducts} categoryName="League of Legends" />
    </div>
  );
};

export default Index;
