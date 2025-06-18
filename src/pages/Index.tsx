
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  
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

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('public_products')
        .select('*')
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch banners from Supabase
  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position')
        .limit(2);

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchBanners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Banner - Original smaller size */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div 
          className="relative h-[200px] rounded-lg overflow-hidden mb-8"
          style={{ background: 'linear-gradient(135deg, #956ec3 0%, #a576c9 100%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
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
        </div>

        {/* First Banner */}
        {banners[0] && (
          <section className="mb-8">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={banners[0].image_url} 
                alt="Banner 1"
                className="w-full h-40 object-cover"
              />
            </div>
          </section>
        )}

        {/* Categories Section - Grid layout with thumbnails */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">หมวดหมู่สินค้า</h2>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-24 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3"></div>
                </div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                    <CardContent className="p-3 text-center">
                      <div className="h-16 w-16 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8" style={{ color: '#956ec3' }} />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">ไม่พบหมวดหมู่สินค้า</p>
            </div>
          )}
        </section>

        {/* Second Banner */}
        {banners[1] && (
          <section className="mb-8">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={banners[1].image_url} 
                alt="Banner 2"
                className="w-full h-40 object-cover"
              />
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">สินค้าแนะนำ</h2>
            <Link to="/categories">
              <Button variant="outline" size="sm" style={{ borderColor: '#956ec3', color: '#956ec3' }}>
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-40 mb-2"></div>
                  <div className="bg-gray-200 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="w-full h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Badge 
                          className="absolute top-2 left-2 text-xs"
                          style={{ backgroundColor: '#956ec3' }}
                        >
                          {product.status || 'ใหม่'}
                        </Badge>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                        
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className="h-3 w-3 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">(15)</span>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-lg font-bold" style={{ color: '#956ec3' }}>
                            ฿{product.selling_price?.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            style={{ borderColor: '#956ec3', color: '#956ec3' }}
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
                            className="flex-1 text-xs"
                            style={{ backgroundColor: '#956ec3' }}
                          >
                            ดูสินค้า
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
