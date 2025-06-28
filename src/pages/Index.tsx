import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";

// ✨ 1. Import คอมโพเนนต์การ์ดที่เราทำไว้ดีแล้ว
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";

// (Interfaces Banner, Category ไม่มีการเปลี่ยนแปลง)
interface Banner { /* ... */ }
interface Category { /* ... */ }

const Index = () => {
  const navigate = useNavigate();
  // (State declarations ไม่มีการเปลี่ยนแปลง)
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  // ผมได้ปรับปรุงการดึงข้อมูลให้มีประสิทธิภาพและจัดการ state loading ได้ดีขึ้น
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBanners(),
          fetchFeaturedProducts(),
          fetchCategories(),
          fetchHomepageCategories(),
        ]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

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
    // ✨ แก้ไขให้ดึงข้อมูลจาก 'product_images' ที่ถูกต้อง
    product_images: item.product_images && Array.isArray(item.product_images) 
      ? item.product_images.filter(img => img && img.image_url) 
      : [],
    product_type: item.product_type || "ETC",
    created_at: item.created_at || "",
    updated_at: item.updated_at || "",
    tags: item.tags || [],
    slug: item.slug || String(item.id),
  });

  const fetchBanners = async () => { /* ... โค้ดเดิม ... */ };
  const fetchFeaturedProducts = async () => { /* ... โค้ดเดิม ... */ };
  const fetchCategories = async () => { /* ... โค้ดเดิม ... */ };
  const fetchHomepageCategories = async () => { /* ... โค้ดเดิม ... */ };

  const handleProductClick = (productId: number) => {
    const allProducts = [...featuredProducts, ...Object.values(categoryProducts).flat()];
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      navigate(`/product/${product.slug || product.id}`);
    }
  };
  
  // ✨ 2. ลบ const ProductCard = ... ที่ซ้ำซ้อนทิ้งไปทั้งหมด

  const CategorySection = ({ title, products, categoryName }: { title: string; products: ProductPublic[]; categoryName: string }) => (
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
            {/* ✨ 3. เรียกใช้ EnhancedProductCard ที่ import มา */}
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

  const BannerSection = ({ banners }: { banners: Banner[] }) => { /* ... โค้ดเดิม ... */ };
  
  // แก้ไข FeaturedProductsCarousel ให้ใช้ EnhancedProductCard ด้วย
  const FeaturedProductsCarousel = ({ products }: { products: ProductPublic[] }) => (
    <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}>
      <CarouselContent className="-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            {/* ✨ 3. เรียกใช้ EnhancedProductCard ที่ import มา */}
            <EnhancedProductCard product={product} onProductClick={handleProductClick} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* ... (ส่วน JSX อื่นๆ เหมือนเดิม) ... */}
    </div>
  );
};

export default Index;
