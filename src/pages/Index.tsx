
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position');
      
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
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
        .select('*')
        .limit(12);
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* แบนเนอร์ขนาดกลาง */}
      <section className="relative">
        {banners.length > 0 ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Carousel className="w-full h-64 md:h-80">
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                      <img
                        src={banner.image_url || '/placeholder.svg'}
                        alt={banner.title || 'Banner'}
                        className="w-full h-full object-cover"
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

      {/* หมวดหมู่สินค้า (ใส่รูป thumbnail) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-shadow text-center p-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-purple-600 rounded"></div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm">{category.name}</h3>
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
                <Card 
                  key={product.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* หมวดหมู่สินค้า (สุ่ม) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่ยอดนิยม</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(6, 10).map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-shadow text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-600 rounded"></div>
                    )}
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

      {/* หมวดหมู่สินค้า (สุ่ม) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่แนะนำ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(2, 6).map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-shadow text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-600 rounded"></div>
                    )}
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* แบนเนอร์รูปภาพ */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-40 md:h-60 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">จัดส่งฟรี</h3>
              <p className="text-sm md:text-base">สั่งซื้อตั้งแต่ 500 บาทขึ้นไป</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
