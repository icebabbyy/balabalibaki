import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import EnhancedProductCard from "@/components/EnhancedProductCard";

// (Interfaces Banner, Category เหมือนเดิม)
interface Banner { id: string; title?: string; description?: string; image_url: string; link_url?: string; active: boolean; position: number; }
interface Category { id: number; name: string; image?: string; display_on_homepage?: boolean; }

const Index = () => {
  const navigate = useNavigate();
  // (State ทั้งหมดเหมือนเดิม)
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);

  // --- 1. ปรับปรุง useEffect ให้ทำงานเป็นลำดับขั้น ---
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      
      // ดึงข้อมูลที่ไม่เกี่ยวข้องกันก่อน
      await Promise.all([
        fetchBanners(),
        fetchFeaturedProducts(),
      ]);

      // ดึงหมวดหมู่ทั้งหมดให้เสร็จก่อน
      const allCategories = await fetchCategories();

      // ถ้ามีหมวดหมู่, ให้เริ่มดึงสินค้าในหมวดหมู่แบบสุ่ม
      if (allCategories && allCategories.length > 0) {
        await fetchRandomHomepageProducts(allCategories);
      }
      
      setLoading(false);
    };
    initPage();
  }, []);

  // --- (ฟังก์ชัน fetchBanners, fetchFeaturedProducts ไม่เปลี่ยนแปลง) ---
  const fetchBanners = async () => { /* ...โค้ดเดิม... */ };
  const fetchFeaturedProducts = async () => { /* ...โค้ดเดิม... */ };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      const allCategories = data || [];
      setCategories(allCategories);
      return allCategories; // ส่งค่ากลับไปให้ฟังก์ชันอื่นใช้ต่อ
    } catch (error) {
      console.error('Error fetching categories:', error);
      return []; // ส่งค่าว่างกลับไปกรณี error
    }
  };
  
  // --- 2. ฟังก์ชันใหม่สำหรับสุ่มและดึงข้อมูลสินค้า ---
  const fetchRandomHomepageProducts = async (allCategories: Category[]) => {
    try {
      // ฟังก์ชันสำหรับสับไพ่ (สุ่มลำดับ) อาร์เรย์
      const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      // สุ่มเลือกหมวดหมู่มา 3 อัน
      const randomCategories = shuffleArray([...allCategories]).slice(0, 3);
      setHomepageCategories(randomCategories);

      const productsData: {[key: string]: ProductPublic[]} = {};
      
      for (const category of randomCategories) {
        const { data: products, error } = await supabase
          .from('public_products_with_main_image')
          .select('*')
          .eq('category', category.name)
          .limit(5);

        if (error) throw error;

        productsData[category.name] = (products || []).map(item => ({
          ...item,
          product_images: [], // สามารถเพิ่ม logic ดึงรูปอัลบั้มที่นี่ถ้าต้องการ
        }));
      }
      setCategoryProducts(productsData);
    } catch (error) {
      console.error('Error fetching homepage products:', error);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // --- (Компоненты CategorySection และ BannerSection ไม่เปลี่ยนแปลง) ---
  const CategorySection = ({ title, products, categoryName }: { title: string; products: ProductPublic[]; categoryName: string }) => ( /* ...โค้ดเดิม... */ );
  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => ( /* ...โค้ดเดิม... */ );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* ... โค้ด JSX ทั้งหมดใน return เหมือนเดิมทุกประการ ... */}
    </div>
  );
};

export default Index;
