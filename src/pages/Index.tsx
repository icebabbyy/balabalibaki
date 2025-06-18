
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Index = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      // Fetch products with limit 5 per category
      const { data: productsData } = await supabase
        .from('public_products')
        .select('*')
        .limit(30);

      // Fetch banners
      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position');

      // Fetch new products (latest 8)
      const { data: newProductsData } = await supabase
        .from('public_products')
        .select('*')
        .order('id', { ascending: false })
        .limit(8);

      // Simulate best sellers (random selection for now)
      const { data: bestSellersData } = await supabase
        .from('public_products')
        .select('*')
        .limit(8);

      setCategories(categoriesData || []);
      setProducts(productsData || []);
      setBanners(bannersData || []);
      setNewProducts(newProductsData || []);
      setBestSellers(bestSellersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = (categoryName) => {
    return products.filter(product => product.category === categoryName).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">Lucky Shop</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="hover:text-purple-200 transition-colors">หน้าแรก</Link>
                <Link to="/categories" className="hover:text-purple-200 transition-colors">หมวดหมู่</Link>
                <Link to="/qa" className="hover:text-purple-200 transition-colors">Q&A</Link>
                <Link to="/reviews" className="hover:text-purple-200 transition-colors">รีวิว</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  className="w-64 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700">
                <ShoppingCart className="h-6 w-6" />
              </Button>
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700">
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Banner Carousel */}
        {banners.length > 0 && (
          <section className="mb-12">
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {banners.map((banner, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                      <div
                        className="w-full h-full bg-cover bg-center flex items-center justify-center"
                        style={{
                          backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.7), rgba(147, 51, 234, 0.7)), url(${banner.image_url || '/placeholder.svg'})`
                        }}
                      >
                        <div className="text-center text-white">
                          <h2 className="text-3xl md:text-5xl font-bold mb-4">ของขวัญพิเศษ</h2>
                          <p className="text-lg md:text-xl mb-6">สำหรับคนที่คุณรัก</p>
                          <Button className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-full">
                            เลือกของขวัญ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Categories Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-800 mb-4">หมวดหมู่สินค้า</h2>
            <p className="text-lg text-purple-600">เลือกซื้อได้ตามหมวดหมู่ที่คุณสนใจ</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-purple-200 hover:border-purple-400 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                      <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* New Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-purple-800">สินค้ามาใหม่</h2>
            <Link to="/categories?filter=new">
              <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-purple-100 hover:border-purple-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    ใหม่
                  </span>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-2xl font-bold text-purple-600 mb-3">
                    ฿{product.selling_price?.toLocaleString()}
                  </p>
                  
                  <div className="space-y-2">
                    <Link to={`/product/${product.id}`}>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-purple-800">สินค้าขายดี</h2>
            <Link to="/categories?filter=bestseller">
              <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-purple-100 hover:border-purple-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    ขายดี
                  </span>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-2xl font-bold text-purple-600 mb-3">
                    ฿{product.selling_price?.toLocaleString()}
                  </p>
                  
                  <div className="space-y-2">
                    <Link to={`/product/${product.id}`}>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories and Products */}
        {categories.map((category) => {
          const categoryProducts = getProductsByCategory(category.name);
          
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category.id} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-purple-800">{category.name}</h3>
                <Link to={`/categories?category=${encodeURIComponent(category.name)}`}>
                  <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {categoryProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-purple-100 hover:border-purple-300">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.status && (
                        <span className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {product.status}
                        </span>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-2xl font-bold text-purple-600 mb-3">
                        ฿{product.selling_price?.toLocaleString()}
                      </p>
                      
                      <div className="space-y-2">
                        <Link to={`/product/${product.id}`}>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            ดูรายละเอียด
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          เพิ่มลงตะกร้า
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default Index;
