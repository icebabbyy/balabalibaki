// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

// Components & Types
import Header from "@/components/Header";
import { ProductPublic } from "@/types/product";
import { toast } from "sonner";

// ✨ สร้าง Interfaces ด้านนอกเพื่อความเป็นระเบียบ
interface Banner {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  link_url?: string;
  active: boolean;
  position: number;
}

interface Category {
  id: number;
  name: string;
  image?: string;
}

// ✨ [1] สร้างฟังก์ชันแปลงข้อมูล เพื่อลดความซ้ำซ้อน (DRY Principle)
const transformProductData = (item: any): ProductPublic => ({
  id: item.id || 0,
  name: item.name || '',
  selling_price: item.selling_price || 0,
  category: item.category || '',
  description: item.description || '',
  image_url: item.image_url || '', // ใช้ image_url เป็นหลักตามรูปภาพ
  product_status: item.product_status || 'พรีออเดอร์',
  sku: item.sku || '',
  quantity: item.quantity || 0,
  shipment_date: item.shipment_date || '',
  options: item.options || null,
  product_type: item.product_type || 'ETC',
  created_at: item.created_at || '',
  updated_at: item.updated_at || '',
  tags: Array.isArray(item.tags) ? item.tags.filter((tag: any) => typeof tag === 'string') : [],
  slug: item.slug || String(item.id),
  product_images: Array.isArray(item.product_images) ? item.product_images : [],
});


const Index = () => {
  const navigate = useNavigate();
  // States
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);

  // ✨ [2] ปรับปรุงการดึงข้อมูลให้มีประสิทธิภาพ ใช้ Promise.all
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBanners(),
        fetchCategories(),
        fetchFeaturedProducts(),
        fetchHomepageData()
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      setMainBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching all categories:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase.from('public_products').select('*').limit(8);
      if (error) throw error;
      setFeaturedProducts((data || []).map(transformProductData));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  // ✨ [3] ปรับปรุง fetchHomepageCategories ให้ดึงข้อมูลสินค้าพร้อมกัน ไม่ต้องรอทีละหมวด
  const fetchHomepageData = async () => {
    try {
      const displayCategoryNames = ['Nikke', 'Honkai : Star Rail', 'Wuthering Waves', 'Zenless Zone Zero', 'Blue Archive'];

      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .in('name', displayCategoryNames);

      if (catError) throw catError;
      setHomepageCategories(categoriesData || []);

      const { data: productsData, error: prodError } = await supabase
        .from('public_products')
        .select('*')
        .in('category', displayCategoryNames)
        .limit(25); // ดึงมาเผื่อไว้ก่อน

      if (prodError) throw prodError;

      const transformedProducts = (productsData || []).map(transformProductData);
      
      const productsByCategory: {[key: string]: ProductPublic[]} = {};
      displayCategoryNames.forEach(catName => {
        productsByCategory[catName] = transformedProducts
          .filter(p => p.category === catName)
          .slice(0, 5); // เอาแค่ 5 ชิ้นต่อหมวด
      });
      setCategoryProducts(productsByCategory);

    } catch (error) {
      console.error('Error fetching homepage data:', error);
    }
  };

  const handleProductClick = (product: ProductPublic) => {
    navigate(`/product/${product.slug || product.id}`);
  };

  // ✨ [4] จัดระเบียบ Component ต่างๆ ให้อยู่ในที่ของมัน
  // --- Product Card Component ---
  const ProductCard = ({ product }: { product: ProductPublic }) => {
    const addToCart = (e: React.MouseEvent, productToAdd: ProductPublic) => {
      e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง Card ด้านนอก (ป้องกันการ navigate)
      
      // (โค้ด addToCart เดิมของคุณ)
      const cartItem = { 
        id: productToAdd.id, 
        name: productToAdd.name, 
        price: productToAdd.selling_price, 
        quantity: 1, 
        image: productToAdd.image_url, 
        variant: null 
      };
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === productToAdd.id && item.variant === null);

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }
      localStorage.setItem('cart', JSON.stringify(existingCart));
      toast.success(`เพิ่ม "${productToAdd.name}" ลงตะกร้าแล้ว`);
    };

    return (
      <Card 
        className="group overflow-hidden flex flex-col cursor-pointer h-full"
        onClick={() => handleProductClick(product)}
      >
        <div className="relative overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full aspect-[1/1] object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.product_status && (
            <Badge className={`absolute top-2 left-2 border-transparent text-white ${
              product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-purple-600'
            }`}>
              {product.product_status}
            </Badge>
          )}
        </div>
        <CardContent className="p-3 flex flex-col flex-grow">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">{product.name}</h3>
          <div className="mt-auto">
            <p className="text-lg font-bold text-purple-600 mb-3">฿{product.selling_price.toLocaleString()}</p>
            <Button className="w-full" onClick={(e) => addToCart(e, product)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // --- Category Card Component ---
  const CategoryCard = ({ category }: { category: Category }) => (
    <Link to={`/categories?category=${encodeURIComponent(category.name)}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200 overflow-hidden">
        <CardContent className="p-0">
            <div className="relative w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100">
                <img 
                    src={category.image || '/placeholder.svg'} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            <h3 className="font-semibold text-xs text-center text-gray-800 p-2 h-10 flex items-center justify-center">
                {category.name}
            </h3>
        </CardContent>
      </Card>
    </Link>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Banner Carousel */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto">
            {mainBanners.length > 0 ? (
                <Carousel plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]} opts={{ loop: true }}>
                    <CarouselContent>
                        {mainBanners.map((banner) => (
                            <CarouselItem key={banner.id}>
                                <div className="w-full aspect-[2.5/1] bg-gray-200">
                                    <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </Carousel>
            ) : ( <div className="w-full aspect-[2.5/1] bg-gray-200 animate-pulse"></div> )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
            {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
          </div>
        </div>
      </section>

      {/* New Arrivals (Featured Products) Carousel */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">สินค้ามาใหม่</h2>
          {loading ? (
            <div className="text-center p-8">Loading...</div>
          ) : (
            <Carousel opts={{ align: "start" }}>
                <CarouselContent className="-ml-4">
                    {featuredProducts.map((product) => (
                        <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-[-1rem] md:left-[-2rem]" />
                <CarouselNext className="right-[-1rem] md:right-[-2rem]" />
            </Carousel>
          )}
        </div>
      </section>

      {/* Sections for specific categories */}
      {homepageCategories.map((category) => (
        (categoryProducts[category.name] || []).length > 0 && (
          <section key={category.id} className="py-10 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Link to={`/categories?category=${encodeURIComponent(category.name)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
                  ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categoryProducts[category.name].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )
      ))}

    </div>
  );
};

export default Index;
