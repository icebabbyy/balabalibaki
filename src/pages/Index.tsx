
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [categoryProducts2, setCategoryProducts2] = useState<any[]>([]);
  const [categoryProducts3, setCategoryProducts3] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      // Fetch banners
      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position');

      // Fetch new products
      const { data: newProductsData } = await supabase
        .from('public_products')
        .select('*')
        .order('id', { ascending: false })
        .limit(4);

      // Fetch random category products for section 1
      if (categoriesData && categoriesData.length > 0) {
        const randomCategory1 = categoriesData[Math.floor(Math.random() * categoriesData.length)];
        const { data: categoryData1 } = await supabase
          .from('public_products')
          .select('*')
          .eq('category', randomCategory1.name)
          .limit(4);

        const randomCategory2 = categoriesData[Math.floor(Math.random() * categoriesData.length)];
        const { data: categoryData2 } = await supabase
          .from('public_products')
          .select('*')
          .eq('category', randomCategory2.name)
          .limit(4);

        const randomCategory3 = categoriesData[Math.floor(Math.random() * categoriesData.length)];
        const { data: categoryData3 } = await supabase
          .from('public_products')
          .select('*')
          .eq('category', randomCategory3.name)
          .limit(4);

        setCategoryProducts(categoryData1 || []);
        setCategoryProducts2(categoryData2 || []);
        setCategoryProducts3(categoryData3 || []);
      }

      setCategories(categoriesData || []);
      setBanners(bannersData || []);
      setNewProducts(newProductsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 1. Hero Banner Carousel */}
        <section className="mb-8">
          <Carousel
            className="w-full"
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
          >
            <CarouselContent>
              {banners.slice(0, 4).map((banner, index) => (
                <CarouselItem key={banner.id || index}>
                  <div className="relative h-[200px] rounded-lg overflow-hidden">
                    <img 
                      src={banner.image_url} 
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
              {banners.length === 0 && (
                <CarouselItem>
                  <div 
                    className="relative h-[200px] rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #956ec3 0%, #a576c9 100%)' }}
                  >
                    <div className="text-center text-white">
                      <h1 className="text-2xl font-bold mb-3">ยินดีต้อนรับสู่ Lucky Shop</h1>
                      <p className="text-base mb-4">ร้านขายของสะสม ฟิกเกอร์ และของเล่นคุณภาพ</p>
                      <Link to="/categories">
                        <Button 
                          size="default" 
                          className="bg-white text-purple-600 hover:bg-gray-100"
                        >
                          เริ่มช้อปปิ้ง
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* 2. Categories Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <div className="h-16 w-16 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-8 w-8" style={{ color: '#956ec3' }} />
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. New Products Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">สินค้ามาใหม่</h2>
            <Link to="/categories?filter=new">
              <Button variant="outline" size="sm" style={{ borderColor: '#956ec3', color: '#956ec3' }}>
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="w-full h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                        <img 
                          src={product.image || '/placeholder.svg'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {product.status && (
                        <Badge 
                          className="absolute top-2 left-2 text-xs text-white"
                          style={{ backgroundColor: '#956ec3' }}
                        >
                          {product.status}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="mb-3">
                        <span className="text-lg font-bold" style={{ color: '#956ec3' }}>
                          ฿{product.selling_price?.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs text-white"
                          style={{ backgroundColor: '#6B46C1', borderColor: '#6B46C1' }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          ใส่ตะกร้า
                        </Button>
                        <Button 
                          size="sm"
                          className="flex-1 text-xs text-white"
                          style={{ backgroundColor: '#6B46C1' }}
                        >
                          ซื้อเดี๋ยวนี้
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Random Category Products 1 */}
        {categoryProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{categoryProducts[0]?.category}</h2>
              <Link to={`/categories?category=${encodeURIComponent(categoryProducts[0]?.category || '')}`}>
                <Button variant="outline" size="sm" style={{ borderColor: '#956ec3', color: '#956ec3' }}>
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="w-full h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img 
                            src={product.image || '/placeholder.svg'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {product.status && (
                          <Badge 
                            className="absolute top-2 left-2 text-xs text-white"
                            style={{ backgroundColor: '#956ec3' }}
                          >
                            {product.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                        <div className="mb-3">
                          <span className="text-lg font-bold" style={{ color: '#956ec3' }}>
                            ฿{product.selling_price?.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs text-white"
                            style={{ backgroundColor: '#6B46C1', borderColor: '#6B46C1' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            ใส่ตะกร้า
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1 text-xs text-white"
                            style={{ backgroundColor: '#6B46C1' }}
                          >
                            ซื้อเดี๋ยวนี้
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 5. Random Category Products 2 */}
        {categoryProducts2.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{categoryProducts2[0]?.category}</h2>
              <Link to={`/categories?category=${encodeURIComponent(categoryProducts2[0]?.category || '')}`}>
                <Button variant="outline" size="sm" style={{ borderColor: '#956ec3', color: '#956ec3' }}>
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryProducts2.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="w-full h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img 
                            src={product.image || '/placeholder.svg'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {product.status && (
                          <Badge 
                            className="absolute top-2 left-2 text-xs text-white"
                            style={{ backgroundColor: '#956ec3' }}
                          >
                            {product.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                        <div className="mb-3">
                          <span className="text-lg font-bold" style={{ color: '#956ec3' }}>
                            ฿{product.selling_price?.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs text-white"
                            style={{ backgroundColor: '#6B46C1', borderColor: '#6B46C1' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            ใส่ตะกร้า
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1 text-xs text-white"
                            style={{ backgroundColor: '#6B46C1' }}
                          >
                            ซื้อเดี๋ยวนี้
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. Random Category Products 3 */}
        {categoryProducts3.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{categoryProducts3[0]?.category}</h2>
              <Link to={`/categories?category=${encodeURIComponent(categoryProducts3[0]?.category || '')}`}>
                <Button variant="outline" size="sm" style={{ borderColor: '#956ec3', color: '#956ec3' }}>
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryProducts3.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="w-full h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img 
                            src={product.image || '/placeholder.svg'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {product.status && (
                          <Badge 
                            className="absolute top-2 left-2 text-xs text-white"
                            style={{ backgroundColor: '#956ec3' }}
                          >
                            {product.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                        <div className="mb-3">
                          <span className="text-lg font-bold" style={{ color: '#956ec3' }}>
                            ฿{product.selling_price?.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs text-white"
                            style={{ backgroundColor: '#6B46C1', borderColor: '#6B46C1' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            ใส่ตะกร้า
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1 text-xs text-white"
                            style={{ backgroundColor: '#6B46C1' }}
                          >
                            ซื้อเดี๋ยวนี้
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 7. Bottom Banner */}
        {banners[banners.length - 1] && (
          <section className="mb-8">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={banners[banners.length - 1].image_url} 
                alt="Bottom Banner"
                className="w-full h-40 object-cover"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Index;
