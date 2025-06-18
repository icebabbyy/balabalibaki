
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
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">Lucky Shop</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="hover:text-purple-200 transition-colors">หน้าแรก</Link>
                <Link to="/categories" className="hover:text-purple-200 transition-colors">หมวดหมู่</Link>
                <Link to="/order-status" className="hover:text-purple-200 transition-colors">เช็คสถานะสินค้า</Link>
                <Link to="/qa" className="hover:text-purple-200 transition-colors">Q&A</Link>
                <Link to="/reviews" className="hover:text-purple-200 transition-colors">รีวิว</Link>
                <Link to="/admin" className="hover:text-purple-200 transition-colors">แอดมิน</Link>
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Banner Carousel - Medium Size */}
        <section className="mb-12">
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {banners.length > 0 ? banners.map((banner, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-48 md:h-64 overflow-hidden rounded-lg">
                    <div
                      className="w-full h-full bg-cover bg-center flex items-center justify-center"
                      style={{
                        backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.7), rgba(147, 51, 234, 0.7)), url(${banner.image_url || '/placeholder.svg'})`
                      }}
                    >
                      <div className="text-center text-white">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">ของขวัญพิเศษ</h2>
                        <p className="text-md md:text-lg mb-6">สำหรับคนที่คุณรัก</p>
                        <Button className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-full">
                          เลือกของขวัญ
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              )) : (
                <CarouselItem>
                  <div className="relative h-48 md:h-64 overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-2xl md:text-4xl font-bold mb-4">ยินดีต้อนรับสู่ Lucky Shop</h2>
                      <p className="text-md md:text-lg mb-6">ช้อปปิ้งสินค้าคุณภาพดี ราคาดี</p>
                      <Button className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-2 rounded-full">
                        เริ่มช้อปปิ้ง
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-800 mb-4">หมวดหมู่สินค้า</h2>
            <p className="text-lg text-purple-600">เลือกซื้อได้ตามหมวดหมู่ที่คุณสนใจ</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-purple-200 hover:border-purple-400 cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors overflow-hidden">
                      <img
                        src={`/placeholder.svg`}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span className="text-lg hidden">📦</span>
                    </div>
                    <h3 className="font-medium text-sm text-gray-800 group-hover:text-purple-600 transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Additional Banner */}
        <section className="mb-12">
          <div className="relative h-32 md:h-40 overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2">สินค้าขายดี ลดราคาพิเศษ!</h2>
              <p className="text-sm md:text-base">ช้อปเลย ก่อนหมดโปรโมชั่น</p>
            </div>
          </div>
        </section>

        {/* New Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">สินค้ามาใหม่</h2>
            <Link to="/categories?filter=new">
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-purple-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    ใหม่
                  </span>
                </div>
                <CardContent className="p-3">
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-medium text-gray-800 mb-1 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h4>
                  </Link>
                  <p className="text-lg font-bold text-purple-600 mb-2">
                    ฿{product.selling_price?.toLocaleString()}
                  </p>
                  
                  <div className="space-y-1">
                    <Link to={`/product/${product.id}`}>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                        ซื้อเดี๋ยวนี้
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 text-xs">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      เพิ่มลงตะกร้า
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">สินค้าขายดี</h2>
            <Link to="/categories?filter=bestseller">
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {bestSellers.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-purple-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    ขายดี
                  </span>
                </div>
                <CardContent className="p-3">
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-medium text-gray-800 mb-1 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h4>
                  </Link>
                  <p className="text-lg font-bold text-purple-600 mb-2">
                    ฿{product.selling_price?.toLocaleString()}
                  </p>
                  
                  <div className="space-y-1">
                    <Link to={`/product/${product.id}`}>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                        ซื้อเดี๋ยวนี้
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 text-xs">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      เพิ่มลงตะกร้า
                    </Button>
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
            <section key={category.id} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                <Link to={`/categories?category=${encodeURIComponent(category.name)}`}>
                  <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-purple-300">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      {product.status && (
                        <span className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {product.status}
                        </span>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <Link to={`/product/${product.id}`}>
                        <h4 className="font-medium text-gray-800 mb-1 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h4>
                      </Link>
                      <p className="text-lg font-bold text-purple-600 mb-2">
                        ฿{product.selling_price?.toLocaleString()}
                      </p>
                      
                      <div className="space-y-1">
                        <Link to={`/product/${product.id}`}>
                          <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                            ซื้อเดี๋ยวนี้
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 text-xs">
                          <ShoppingCart className="h-3 w-3 mr-1" />
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
