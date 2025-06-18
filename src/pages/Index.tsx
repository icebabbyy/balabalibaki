
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, Star, ShoppingCart, Zap, Clock, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

interface Banner {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
}

interface Product {
  id: number;
  name: string;
  selling_price: number;
  image: string;
  status: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
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

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Banner Carousel */}
      <section className="relative">
        {banners.length > 0 ? (
          <Carousel className="w-full h-96 md:h-[500px]">
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="relative h-96 md:h-[500px] overflow-hidden">
                    <img
                      src={banner.image_url || '/placeholder.svg'}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white max-w-2xl px-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                        <p className="text-xl mb-6">{banner.description}</p>
                        {banner.link_url && (
                          <Button 
                            size="lg" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => window.open(banner.link_url, '_blank')}
                          >
                            ดูรายละเอียด
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        )}
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                ยินดีต้อนรับสู่ Lucky Shop
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                สินค้าจากจีนคุณภาพดี ราคาดี ส่งตรงถึงบ้าน
              </p>
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => navigate('/categories')}
              >
                เริ่มช้อปปิ้ง
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ทำไมต้องเลือก Lucky Shop?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ราคาดีที่สุด</h3>
              <p className="text-gray-600">นำเข้าตรงจากแหล่งผลิต ราคาถูกกว่าช้อปปิ้งออนไลน์ทั่วไป</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">จัดส่งรวดเร็ว</h3>
              <p className="text-gray-600">ระบบจัดส่งที่มีประสิทธิภาพ ส่งถึงบ้านคุณอย่างรวดเร็ว</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">รับประกันคุณภาพ</h3>
              <p className="text-gray-600">คัดเลือกสินค้าคุณภาพดี พร้อมการันตีความพึงพอใจ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">สินค้าแนะนำ</h2>
            <Link to="/categories">
              <Button variant="outline">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
              {featuredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="relative">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.status && (
                      <Badge className="absolute top-2 left-2 bg-purple-600">
                        {product.status}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">
                        ฿{product.selling_price?.toLocaleString()}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">พร้อมเริ่มช้อปปิ้งแล้วหรือยัง?</h2>
          <p className="text-xl mb-8">สำรวจสินค้าหลากหลายและเริ่มสั่งซื้อได้เลยวันนี้</p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => navigate('/categories')}
          >
            เริ่มช้อปปิ้ง
            <ShoppingCart className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
