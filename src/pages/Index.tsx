// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth"; // ✨ 1. เพิ่ม import useAuth

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
  display_on_homepage?: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✨ 2. ดึงข้อมูล user มาใช้งาน

  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);

  // ✨ 3. เพิ่ม State สำหรับ Wishlist
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // ✨ 4. เพิ่ม useEffect สำหรับดึงข้อมูล Wishlist ของ User ที่ล็อกอินอยู่
  useEffect(() => {
    if (user) {
      const fetchWishlist = async () => {
        try {
          const { data, error } = await supabase.from('wishlist_items').select('product_id').eq('user_id', user.id);
          if (error) throw error;
          setWishlist(new Set((data || []).map(item => item.product_id)));
        } catch (error) { console.error("Error fetching wishlist:", error); }
      };
      fetchWishlist();
    } else {
      setWishlist(new Set()); // เคลียร์ Wishlist ถ้าไม่มี user
    }
  }, [user]); // ทำงานใหม่ทุกครั้งที่ user เปลี่ยน

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBanners(),
      fetchFeaturedProducts(),
      fetchCategories(),
      fetchHomepageCategories()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchBanners = async () => { /* ... โค้ดเดิมของคุณ ไม่ได้แก้ไข ... */ };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase.from('public_products').select('*').limit(8).order('created_at', { ascending: false });
      if (error) throw error;
      
      // ✨ 5. แก้ไขการ Map ข้อมูลให้ถูกต้อง
      const mappedProducts: ProductPublic[] = (data || []).map(item => ({
        id: item.id || 0,
        name: item.name || '',
        selling_price: item.selling_price || 0,
        category: item.category || '',
        description: item.description || '',
        image: item.image || '',
        product_status: item.product_status || 'พรีออเดอร์',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        shipment_date: item.shipment_date || '',
        options: item.options || null,
        product_type: item.product_type || 'ETC',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
        tags: item.tags || [],
        slug: item.slug || String(item.id),
        images_list: item.images_list || []
      }));
      setFeaturedProducts(mappedProducts);
    } catch (error) { console.error('Error fetching featured products:', error); }
  };

  const fetchCategories = async () => { /* ... โค้ดเดิมของคุณ ไม่ได้แก้ไข ... */ };

  const fetchHomepageCategories = async () => {
    try {
      const displayCategories = ['Nikke', 'Honkai : Star Rail', 'League of Legends'];
      const { data: categoriesData, error: catError } = await supabase.from('categories').select('*').in('name', displayCategories);
      if (catError) throw catError;
      setHomepageCategories(categoriesData || []);

      const { data: productsData, error: prodError } = await supabase.from('public_products').select('*').in('category', displayCategories).limit(15);
      if (prodError) throw prodError;

      // ✨ 6. แก้ไขการ Map ข้อมูลให้ถูกต้อง
      const transformedProducts = (productsData || []).map(item => ({
        id: item.id || 0,
        name: item.name || '',
        selling_price: item.selling_price || 0,
        category: item.category || '',
        description: item.description || '',
        image: item.image || '',
        product_status: item.product_status || 'พรีออเดอร์',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        shipment_date: item.shipment_date || '',
        options: item.options || null,
        product_type: item.product_type || 'ETC',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
        tags: item.tags || [],
        slug: item.slug || String(item.id),
        images_list: item.images_list || []
      }));
      
      const productsByCategory: {[key: string]: ProductPublic[]} = {};
      displayCategories.forEach(catName => {
        productsByCategory[catName] = transformedProducts.filter(p => p.category === catName).slice(0, 5);
      });
      setCategoryProducts(productsByCategory);
    } catch (error) { console.error('Error fetching homepage categories:', error); }
  };

  const handleProductClick = (product: ProductPublic) => {
    navigate(`/product/${product.slug || product.id}`);
  };

  // ✨ 7. เพิ่มฟังก์ชันสำหรับจัดการ Wishlist
  const handleToggleWishlist = async (product: ProductPublic) => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อใช้งานรายการโปรด");
      navigate('/auth');
      return;
    }
    const isCurrentlyInWishlist = wishlist.has(product.id);
    setIsWishlistLoading(true);
    try {
      if (isCurrentlyInWishlist) {
        await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
        setWishlist(prev => { const newSet = new Set(prev); newSet.delete(product.id); return newSet; });
        toast.info("นำออกจากรายการโปรด");
      } else {
        await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        setWishlist(prev => new Set(prev).add(product.id));
        toast.success("เพิ่มในรายการโปรดแล้ว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // ✨ 8. แก้ไข ProductCard ให้รับ props ของ Wishlist
  const ProductCard = ({ product }: { product: ProductPublic }) => {
    // โค้ดส่วน addToCart และ buyNow ที่อยู่ในนี้ จะทำงานแยกกับ Wishlist
    // ซึ่งเป็นไปตามโค้ดที่คุณส่งมาล่าสุด
    const addToCart = (productToAdd: ProductPublic) => { /*... โค้ดเดิม ...*/ };
    const buyNow = (productToBuy: ProductPublic) => { /*... โค้ดเดิม ...*/ };

    return (
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
        onClick={() => handleProductClick(product)}
      >
        <div className="relative">
          <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
          <Button 
            variant="ghost" size="icon" 
            className="absolute top-2 right-2 bg-white/70 rounded-full"
            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product); }}
            disabled={wishlistLoading}
          >
            <Heart className={`transition-all ${wishlist.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
          </Button>
          {product.product_status && <Badge className="absolute top-2 left-2">{product.product_status}</Badge>}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
          <p className="text-lg font-bold text-purple-600 mb-3">฿{product.selling_price?.toLocaleString()}</p>
          <div className="space-y-2 mt-auto">
            <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); buyNow(product); }}>
              <CreditCard className="h-4 w-4 mr-2" />ซื้อเดี๋ยวนี้
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
              <ShoppingCart className="h-4 w-4 mr-2" />เพิ่มลงตะกร้า
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const CategorySection = ({ title, products, categoryName }: any) => (
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
            {products.map((product: ProductPublic) => (<ProductCard key={product.id} product={product} />))}
          </div>
        ) : (<div className="text-center py-8 text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</div>)}
      </div>
    </section>
  );

  const BannerSection = ({ banners, title }: any) => { /* ...โค้ดเดิม... */ };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* ... โครงสร้าง JSX เดิมของคุณทั้งหมด ... */}
      {/* ส่วน Banner หลัก */}
      <section> ... </section>

      {/* สินค้ามาใหม่ */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? ( <div>...Loading...</div> ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner อื่นๆ และ Category อื่นๆ */}
      {secondBanners.length > 0 && <BannerSection banners={secondBanners} />}
      {homepageCategories.map((category) => ( <CategorySection key={category.id} title={category.name} products={categoryProducts[category.name] || []} categoryName={category.name} /> ))}
      {thirdBanners.length > 0 && <BannerSection banners={thirdBanners} />}
      {fourthBanners.length > 0 && <BannerSection banners={fourthBanners} />}
    </div>
  );
};

export default Index;
