// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import Header from "@/components/Header";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard"; // ✨ ใช้ Card ที่เรามีอยู่แล้ว
import { transformProductData } from "@/utils/transform"; // ✨ นำเข้าฟังก์ชันแปลงข้อมูล
import { ProductPublic } from "@/types/product";
import { toast } from "sonner"; // หรือ toast ปกติ

// (ย้าย Interface ออกมาข้างนอกเพื่อให้ชัดเจน)
interface Banner { /* ... */ }
interface Category { /* ... */ }

const Index = () => {
  const navigate = useNavigate();
  // (State declarations เหมือนเดิม)
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      // ✨ ทำให้การดึงข้อมูลทำงานพร้อมกันทั้งหมดเพื่อความเร็ว
      await Promise.all([
        fetchBanners(),
        fetchFeaturedProducts(),
        fetchHomepageCategories()
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const fetchBanners = async () => { /* ...โค้ดเดิม... */ };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase.from('public_products').select('*').limit(8);
      if (error) throw error;
      // ✨ ใช้ฟังก์ชันแปลงข้อมูลที่สร้างไว้
      setFeaturedProducts((data || []).map(transformProductData));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchHomepageCategories = async () => {
    try {
      const displayCategories = ['Nikke', 'Honkai : Star Rail', 'League of Legends'];
      
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .in('name', displayCategories);
      
      if (catError) throw catError;
      setHomepageCategories(categoriesData || []);

      const { data: productsData, error: prodError } = await supabase
        .from('public_products')
        .select('*')
        .in('category', displayCategories)
        .limit(15); // ดึงมาเผื่อ

      if (prodError) throw prodError;

      const transformedProducts = (productsData || []).map(transformProductData);
      
      const productsByCategory: {[key: string]: ProductPublic[]} = {};
      displayCategories.forEach(catName => {
        productsByCategory[catName] = transformedProducts
          .filter(p => p.category === catName)
          .slice(0, 5);
      });
      setCategoryProducts(productsByCategory);

    } catch (error) {
      console.error('Error fetching homepage categories:', error);
    }
  };

  const handleProductClick = (productId: number) => {
    const allProducts = [...featuredProducts, ...Object.values(categoryProducts).flat()];
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      navigate(`/product/${product.slug || product.id}`);
    } else {
      navigate(`/product/${productId}`);
    }
  };
  
  // (addToCart ไม่จำเป็นต้องมีในหน้านี้ เพราะจะถูกจัดการใน EnhancedProductCard)

  const CategorySection = ({ title, products, categoryName }: { title: string; products: ProductPublic[]; categoryName: string }) => (
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
            {/* ✨ ใช้ EnhancedProductCard ที่ import มา */}
            {products.map((product) => (
              <EnhancedProductCard key={product.id} product={product} onProductClick={handleProductClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>
        )}
      </div>
    </section>
  );

  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => { /* ...โค้ดเดิม... */ };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* ... (ส่วน Banner ไม่มีการเปลี่ยนแปลง) ... */}

      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? (
            <div>...Loading...</div> // Placeholder for loading state
          ) : (
            <FeaturedProductsCarousel 
              products={featuredProducts}
              onProductClick={handleProductClick}
              // onAddToCart is handled inside the card
            />
          )}
        </div>
      </section>

      {/* ... (ส่วน Category Sections และ Banners อื่นๆ ไม่มีการเปลี่ยนแปลง) ... */}
       {homepageCategories.map((category) => (
         <CategorySection 
           key={category.id}
           title={category.name} 
           products={categoryProducts[category.name] || []} 
           categoryName={category.name} 
         />
       ))}

    </div>
  );
};

export default Index;
