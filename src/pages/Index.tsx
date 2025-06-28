// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { transformProductData } from "@/utils/transform";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";

interface Banner {
  id: number;
  image_url: string;
}
interface Category {
  id: number;
  name: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ดึง User มาใช้

  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{
    [key: string]: ProductPublic[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // --- Effect สำหรับดึงข้อมูล Wishlist (ทำงานเมื่อ user เปลี่ยน) ---
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist(new Set());
        return;
      }
      try {
        const { data, error } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", user.id);
        if (error) throw error;
        setWishlist(new Set((data || []).map((item) => item.product_id)));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchWishlist();
  }, [user]);

  // --- Effect สำหรับดึงข้อมูลทั้งหมดของหน้า ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBanners(),
        fetchFeaturedProducts(),
        fetchHomepageCategories(),
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const fetchBanners = async () => {
    /* ...โค้ดเดิม ไม่ต้องแก้ไข... */
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .limit(10)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFeaturedProducts((data || []).map(transformProductData));
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  const fetchHomepageCategories = async () => {
    /* ...โค้ดเดิม ไม่ต้องแก้ไข... */
  };

  // --- ฟังก์ชันจัดการ Wishlist (อยู่ที่นี่ที่เดียว) ---
  const handleToggleWishlist = async (product: ProductPublic) => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อใช้งานรายการโปรด");
      navigate("/auth");
      return;
    }
    setWishlistLoading(true);
    const isCurrentlyInWishlist = wishlist.has(product.id);
    try {
      if (isCurrentlyInWishlist) {
        await supabase
          .from("wishlist_items")
          .delete()
          .match({ user_id: user.id, product_id: product.id });
        setWishlist((prev) => {
          const newWishlist = new Set(prev);
          newWishlist.delete(product.id);
          return newWishlist;
        });
        toast.success("ลบออกจากรายการโปรดแล้ว");
      } else {
        await supabase
          .from("wishlist_items")
          .insert({ user_id: user.id, product_id: product.id });
        setWishlist((prev) => new Set(prev).add(product.id));
        toast.success("เพิ่มในรายการโปรดแล้ว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
      console.error("Error toggling wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const CategorySection = ({ title, products, categoryName }: any) => (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link
            to={`/categories/${encodeURIComponent(categoryName)}`}
            className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product: ProductPublic) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onProductClick={(productId) =>
                  navigate(`/product/${productId}`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            ไม่พบสินค้าในหมวดหมู่นี้
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* ... Banners ... */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? (
            <div>...Loading...</div>
          ) : (
            <FeaturedProductsCarousel
              products={featuredProducts}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              wishlistLoading={wishlistLoading}
            />
          )}
        </div>
      </section>
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
