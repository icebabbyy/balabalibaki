import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { toast } from "sonner";

// ✨ ใช้คอมโพเนนต์การ์ดที่ดีที่สุดที่เราทำร่วมกันมา
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";

// Interfaces สำหรับ type ของข้อมูล
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

const Index = () => {
  const navigate = useNavigate();
  
  // State ทั้งหมดของหน้า
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  // ... ส่วนต่อไปคือฟังก์ชันต่างๆ ...
// ฟังก์ชันนี้จะถูกใช้ร่วมกันในทุกที่ที่ดึงข้อมูลสินค้า
  const mapProduct = (item: any): ProductPublic => ({
    id: item.id || 0,
    name: item.name || "",
    selling_price: item.selling_price || 0,
    category: item.category || "",
    description: item.description || "",
    image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์",
    sku: item.sku || "",
    quantity: item.quantity || 0,
    shipment_date: item.shipment_date || "",
    options: item.options || null,
    product_type: item.product_type || "ETC",
    created_at: item.created_at || "",
    updated_at: item.updated_at || "",
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    slug: item.slug || String(item.id),
    // ✅ FIX: เปลี่ยนจาก item.images_list เป็น item.product_images ให้ถูกต้อง
    product_images: Array.isArray(item.product_images) 
      ? item.product_images.filter(img => img && img.image_url) 
      : [],
  });
const handleProductClick = (productId: number) => {
    // รวมสินค้าจากทุกแหล่งเพื่อหา slug ที่ถูกต้อง
    const allProducts = [...featuredProducts, ...Object.values(categoryProducts).flat()];
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      navigate(`/product/${product.slug || product.id}`);
    }
  };

  // คอมโพเนนต์สำหรับแสดงผลแต่ละ Section ของ Category บนหน้าแรก
  const CategorySection = ({ title, products, categoryName }: { title: string; products: ProductPublic[]; categoryName: string }) => (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link to={`/categories?category=${encodeURIComponent(categoryName)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            // ✅ ใช้ EnhancedProductCard ที่ import มา
            <EnhancedProductCard key={product.id} product={product} onProductClick={handleProductClick} />
          ))}
        </div>
      </div>
    </section>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* ส่วนแสดง Banner หลัก (ถ้ามี) */}
      {banners.filter(b => b.position === 1).length > 0 && 
        <section className="py-8">
          <Carousel plugins={[Autoplay({ delay: 5000 })]} opts={{ loop: true }}>
            <CarouselContent>
              {banners.filter(b => b.position === 1).map((banner) => (
                <CarouselItem key={banner.id}>
                  {/* ... JSX สำหรับ Banner ... */}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </section>
      }

      {/* ส่วนแสดงสินค้าแนะนำ (Featured Products) */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? (
            <div className="text-center">กำลังโหลด...</div>
          ) : (
            <Carousel opts={{ align: "start" }}>
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <EnhancedProductCard product={product} onProductClick={handleProductClick} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          )}
        </div>
      </section>

      {/* ส่วนแสดงสินค้าตาม Category ที่กำหนด */}
      {homepageCategories.map((category) => (
        <CategorySection
          key={category.id}
          title={category.name}
          products={categoryProducts[category.name] || []}
          categoryName={category.name}
        />
      ))}

      {/* ... สามารถเพิ่ม Banner ส่วนอื่นๆ ได้ตามต้องการ ... */}
    </div>
  );
};

export default Index;
