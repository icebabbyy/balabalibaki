
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryManager from "@/components/CategoryManager";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  product_status: string;
  sku: string;
  shipment_date?: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
  display_on_homepage: boolean;
  homepage_order: number;
}

interface Banner {
  id: string;
  image_url: string;
  position: string;
  active: boolean;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [productImages, setProductImages] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch featured products
      const { data: products, error: productsError } = await supabase
        .from('public_products')
        .select('*')
        .limit(12)
        .order('id', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        const mappedProducts: Product[] = (products || []).map(item => ({
          id: item.id || 0,
          name: item.product_name || '',
          selling_price: item.selling_price || 0,
          category: item.category || '',
          description: item.description || '',
          image: item.image || '',
          product_status: item.product_status || 'พรีออเดอร์',
          sku: item.product_sku || '',
          shipment_date: item.shipment_date || ''
        }));
        setFeaturedProducts(mappedProducts);

        // Fetch product images for carousel
        const productIds = mappedProducts.map(p => p.id);
        if (productIds.length > 0) {
          const { data: images } = await supabase
            .from('product_images')
            .select('product_id, image_url, order')
            .in('product_id', productIds)
            .order('order', { ascending: true });

          if (images) {
            const imageMap: Record<number, string[]> = {};
            images.forEach(img => {
              if (!imageMap[img.product_id]) {
                imageMap[img.product_id] = [];
              }
              imageMap[img.product_id].push(img.image_url);
            });
            setProductImages(imageMap);
          }
        }
      }

      // Fetch categories for homepage
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('display_on_homepage', true)
        .order('homepage_order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch banners
      const { data: bannersData, error: bannersError } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position');

      if (bannersError) {
        console.error('Error fetching banners:', bannersError);
      } else {
        setBanners(bannersData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mainBanner = banners.find(banner => banner.position === 'main');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลด...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Banner */}
        {mainBanner && (
          <section className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden">
            <img
              src={mainBanner.image_url}
              alt="Main Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4">
                  ยินดีต้อนรับ
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl mb-6">
                  ค้นพบสินค้าคุณภาพดีที่นี่
                </p>
                <Link to="/categories">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    เลือกซื้อสินค้า
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">หมวดหมู่สินค้า</h2>
                <p className="text-lg text-gray-600">เลือกหมวดหมู่ที่คุณสนใจ</p>
              </div>
              <CategoryManager categories={categories} />
            </div>
          </section>
        )}

        {/* Featured Products Carousel */}
        {featuredProducts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">สินค้าแนะนำ</h2>
                <p className="text-lg text-gray-600">สินค้าล่าสุดและยอดนิยม</p>
              </div>
              <FeaturedProductsCarousel 
                products={featuredProducts} 
                productImages={productImages}
              />
              <div className="text-center mt-8">
                <Link to="/categories">
                  <Button variant="outline" size="lg">
                    ดูสินค้าทั้งหมด
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="py-16 bg-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              พร้อมเริ่มช้อปปิ้งแล้วหรือยัง?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              สมัครสมาชิกวันนี้รับส่วนลดพิเศษ 10%
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="outline" className="bg-white text-purple-600 hover:bg-gray-100">
                  สมัครสมาชิก
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  เลือกซื้อสินค้า
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
