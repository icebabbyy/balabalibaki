import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import { toast } from "sonner";

// Interfaces (เหมือนเดิม)
interface Banner { id: string; title?: string; description?: string; image_url: string; link_url?: string; active: boolean; position: number; }
interface Category { id: number; name: string; image?: string; display_on_homepage?: boolean; }

const Index = () => {
  const navigate = useNavigate();
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
    fetchCategories();
    fetchHomepageCategories();
  }, []);

  // --- โค้ดส่วน Fetching Data ทั้งหมด (เหมือนเดิม) ---
  const fetchBanners = async () => { /* ... โค้ดเดิม ... */ };
  const fetchFeaturedProducts = async () => { /* ... โค้ดเดิม ... */ };
  const fetchCategories = async () => { /* ... โค้ดเดิม ... */ };
  const fetchHomepageCategories = async () => { /* ... โค้ดเดิม ... */ };

  // --- ฟังก์ชันการทำงานต่างๆ จะถูกรวมไว้ที่นี่ที่เดียว ---
  const handleProductClick = (idOrSlug: number | string) => {
    // สมมติว่า product มี slug, ถ้าไม่มีใช้ id
    navigate(`/product/${idOrSlug}`);
  };

  const addToCart = (product: ProductPublic) => {
    const cartItem = {
      id: product.id, name: product.name, price: product.selling_price,
      quantity: 1, image: product.image, variant: null
    };
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id && !item.variant);
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };
  
  const buyNow = (product: ProductPublic) => {
      addToCart(product); // ใช้ฟังก์ชัน addToCart ที่มีอยู่แล้ว
      navigate('/cart');
  };

  // --- แก้ไขจุดที่ 1: ปรับ ProductCard ให้รับฟังก์ชันจาก props ---
  const ProductCard = ({ product, onProductClick, onAddToCart, onBuyNow }: { 
    product: ProductPublic,
    onProductClick: (id: number) => void,
    onAddToCart: (product: ProductPublic) => void,
    onBuyNow: (product: ProductPublic) => void,
  }) => {
    // ไม่ต้องประกาศฟังก์ชันซ้ำซ้อนข้างในนี้แล้ว
    return (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
        // เรียกใช้ฟังก์ชันที่รับมาจาก props
        onClick={() => onProductClick(product.id)}
      >
        <div className="relative">
          <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
          {product.product_status && (<Badge className="absolute top-2 left-2">{product.product_status}</Badge>)}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-purple-600">฿{product.selling_price?.toLocaleString()}</span>
          </div>
          <div className="space-y-2 mt-auto pt-3">
            <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}>
              <CreditCard className="h-4 w-4 mr-2" />
              ซื้อเดี๋ยวนี้
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- แก้ไขจุดที่ 2: ปรับ CategorySection ให้รับและส่งต่อฟังก์ชัน ---
  const CategorySection = ({ title, products, categoryName, onProductClick, onAddToCart, onBuyNow }: { 
    title: string; 
    products: ProductPublic[]; 
    categoryName: string;
    onProductClick: (id: number) => void;
    onAddToCart: (product: ProductPublic) => void;
    onBuyNow: (product: ProductPublic) => void;
  }) => (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link to={`/categories?category=${encodeURIComponent(categoryName)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              // --- แก้ไขจุดที่ 3: ส่งต่อฟังก์ชันที่ได้รับมาให้กับ ProductCard ---
              <ProductCard 
                key={product.id} 
                product={product} 
                onProductClick={onProductClick}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>
        )}
      </div>
    </section>
  );

  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => (
    // ... โค้ด BannerSection เดิม ...
  );


  // --- ส่วน Return หลัก (มีการแก้ไขเล็กน้อย) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* ... โค้ดส่วน Banner ... */}
      {/* ... โค้ดส่วนหมวดหมู่สินค้าทั้งหมด ... */}

      {/* สินค้ามาใหม่ */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            // ส่วนนี้ยังคงใช้ Component เดิมของคุณ แต่เราได้เตรียมฟังก์ชันไว้ให้มันแล้ว
            <FeaturedProductsCarousel 
              products={featuredProducts}
              onProductClick={(id) => handleProductClick(id)} // ส่งฟังก์ชันที่ถูกต้องไป
              onAddToCart={addToCart}
            />
          )}
        </div>
      </section>

      {/* ... แบนเนอร์ตำแหน่งที่ 2 ... */}

      {/* แสดงหมวดหมู่ที่เลือกไว้ */}
      {homepageCategories.map((category) => (
        // --- แก้ไขจุดที่ 4: ส่งฟังก์ชันหลักจาก Index ลงไปใน CategorySection ---
        <CategorySection 
          key={category.id}
          title={category.name} 
          products={categoryProducts[category.name] || []} 
          categoryName={category.name}
          onProductClick={(id) => handleProductClick(id)}
          onAddToCart={addToCart}
          onBuyNow={buyNow}
        />
      ))}

      {/* ... แบนเนอร์ตำแหน่งที่ 3 และ 4 ... */}

    </div>
  );
};

export default Index;
