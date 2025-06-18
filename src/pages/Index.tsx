
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Heart, ShoppingCart, TrendingUp, Package, Zap } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useBanners } from "@/hooks/useBanners";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { banners, loading } = useBanners();
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Mock data for featured products
  const featuredProducts = [
    {
      id: 1,
      name: "Kuromi Limited Edition Figure",
      price: 2500,
      originalPrice: 3000,
      image: "/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png",
      rating: 4.8,
      reviews: 124,
      badge: "ขายดี",
      discount: 17
    },
    {
      id: 2,
      name: "Gwen Spider-Verse Statue",
      price: 3500,
      originalPrice: 4200,
      image: "/lovable-uploads/487f8c60-99c5-451d-a44f-f637d86b3b11.png",
      rating: 4.9,
      reviews: 89,
      badge: "ใหม่",
      discount: 17
    },
    {
      id: 3,
      name: "Sanrio Mystery Box Set",
      price: 1800,
      originalPrice: 2200,
      image: "/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png",
      rating: 4.7,
      reviews: 256,
      badge: "โปรโมชั่น",
      discount: 18
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Banner Carousel */}
      <div className="relative">
        {loading ? (
          <div className="h-[400px] bg-gray-200 animate-pulse flex items-center justify-center">
            <p className="text-gray-500">กำลังโหลดแบนเนอร์...</p>
          </div>
        ) : banners && banners.length > 0 ? (
          <Carousel
            plugins={[Autoplay({ delay: 4000 })]}
            className="w-full"
          >
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="relative h-[400px] overflow-hidden">
                    <img
                      src={banner.image_url}
                      alt={`Banner ${banner.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white max-w-2xl px-4">
                        <h1 className="text-4xl font-bold mb-4">ยินดีต้อนรับสู่ Lucky Shop</h1>
                        <p className="text-xl mb-6">ร้านขายของสะสม ฟิกเกอร์ และของเล่นคุณภาพ</p>
                        <Link to="/categories">
                          <Button 
                            size="lg" 
                            style={{ backgroundColor: '#956ec3' }}
                            className="hover:opacity-90"
                          >
                            เริ่มช้อปปิ้ง
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        ) : (
          // Default banner when no banners are configured
          <div className="relative h-[400px] overflow-hidden">
            <div 
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #956ec3 0%, #a576c9 100%)' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-4xl font-bold mb-4">ยินดีต้อนรับสู่ Lucky Shop</h1>
                  <p className="text-xl mb-6">ร้านขายของสะสม ฟิกเกอร์ และของเล่นคุณภาพ</p>
                  <Link to="/categories">
                    <Button 
                      size="lg" 
                      className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                      เริ่มช้อปปิ้ง
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">หมวดหมู่สินค้า</h2>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-24 mb-2"></div>
                  <div className="bg-gray-200 rounded h-4"></div>
                </div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  to={`/categories?category=${encodeURIComponent(category.name)}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-300 border">
                    <div 
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#956ec3' }}
                    >
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-600">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่พบหมวดหมู่สินค้า</p>
            </div>
          )}
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">สินค้าแนะนำ</h2>
            <Link to="/categories">
              <Button variant="outline" style={{ borderColor: '#956ec3', color: '#956ec3' }}>
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge 
                      className="absolute top-2 left-2"
                      style={{ backgroundColor: '#956ec3' }}
                    >
                      {product.badge}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    {product.discount > 0 && (
                      <Badge className="absolute top-2 right-12 bg-red-500">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl font-bold" style={{ color: '#956ec3' }}>
                          ฿{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ฿{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        style={{ borderColor: '#956ec3', color: '#956ec3' }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        ใส่ตะกร้า
                      </Button>
                      <Link to={`/product/${product.id}`} className="flex-1">
                        <Button 
                          className="w-full"
                          style={{ backgroundColor: '#956ec3' }}
                        >
                          ดูสินค้า
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
