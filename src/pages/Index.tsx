import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";

// Interfaces
interface Banner { id: string; image_url: string; link_url?: string; position: number; }
interface Category { id: number; name: string; image?: string; }

// Helper function to map data safely
const mapProduct = (item: any): ProductPublic | null => {
  if (!item) return null;
  return {
    id: item.id || 0,
    name: item.name || "",
    selling_price: item.selling_price,
    category: item.category || "",
    image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์",
    slug: item.slug || String(item.id),
    product_images: Array.isArray(item.product_images) ? item.product_images.filter(img => img && img.image_url) : [],
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
  };
};

const Index = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState({
    banners: true,
    featured: true,
    categories: true,
    homepageProducts: true
  });

  // ✨ 1. แยก useEffect สำหรับ Banners
  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase.from('banners').select('*').eq('active', true).order('position');
      if (error) console.error('Error fetching banners:', error);
      else setBanners(data || []);
      setLoading(prev => ({...prev, banners: false}));
    };
    fetchBanners();
  }, []);

  // ✨ 2. แยก useEffect สำหรับ Featured Products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase.from('public_products').select('*').limit(12).order('created_at', { ascending: false });
      if (error) console.error('Error fetching featured products:', error);
      else setFeaturedProducts(data?.filter(Boolean).map(mapProduct).filter(Boolean) as ProductPublic[] || []);
      setLoading(prev => ({...prev, featured: false}));
    };
    fetchFeaturedProducts();
  }, []);
  
  // ✨ 3. แยก useEffect สำหรับ Categories ทั้งหมด
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select('*').eq('display_on_homepage', true).order('homepage_order');
      if (error) console.error('Error fetching all categories:', error);
      else setAllCategories(data || []);
      setLoading(prev => ({...prev, categories: false}));
    };
    fetchCategories();
  }, []);

  // ✨ 4. แยก useEffect สำหรับสินค้าในหมวดหมู่หน้าแรก
  useEffect(() => {
    const fetchHomepageCategories = async () => {
      const displayCategoryNames = ['Nikke', 'Honkai : Star Rail', 'League of Legends', 'Valorant', 'Zenless Zone Zero'];
      const { data, error } = await supabase.from('public_products').select('*').in('category', displayCategoryNames);
      if (error) { console.error('Error fetching products for categories:', error); }
      else {
        const mappedProducts = (data || []).filter(Boolean).map(mapProduct).filter(Boolean) as ProductPublic[];
        const productMap: Record<string, ProductPublic[]> = {};
        displayCategoryNames.forEach(catName => {
          productMap[catName] = mappedProducts.filter(p => p.category === catName).slice(0, 5);
        });
        setHomepageCategoryProducts(productMap);
      }
      setLoading(prev => ({...prev, homepageProducts: false}));
    };
    fetchHomepageCategories();
  }, []);


  const handleProductClick = (productId: number) => {
    // ...
  };

  const isLoading = Object.values(loading).some(status => status === true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen"><p>กำลังโหลด...</p></div>
      ) : (
        <>
          {/* Layout ทั้งหมดที่เคยทำไว้ */}
        </>
      )}
    </div>
  );
};

// ... (Helper Components: CategorySection, BannerSection, etc. วางไว้นอก Index)

export default Index;
