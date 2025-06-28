// src/components/categories/ProductCard.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Heart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // เพิ่ม import supabase

const ProductCard = ({ product }: { product: ProductPublic }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const mainImage = product.image || '/placeholder.svg';
  // แก้ไข: ใช้ images_list ที่เราทำใน view
  const rolloverImage = product.images_list?.find(
    (img: any) => img && img.image_url !== mainImage
  )?.image_url;

  const [displayImage, setDisplayImage] = useState(mainImage);
  
  // --- State ใหม่สำหรับจัดการ Wishlist ใน Card แต่ละใบ ---
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  // --- useEffect สำหรับเช็คสถานะ user และ wishlist ตอนเริ่ม ---
  useEffect(() => {
    const checkStatus = async () => {
      setIsWishlistLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user && product.id) {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();
        setIsInWishlist(!!data);
      }
      setIsWishlistLoading(false);
    };
    checkStatus();
  }, [product.id]); // ให้เช็คใหม่ทุกครั้งที่ product เปลี่ยน

  const handleMouseEnter = () => {
    if (rolloverImage) setDisplayImage(rolloverImage);
  };
  const handleMouseLeave = () => {
    setDisplayImage(mainImage);
  };
  
  const handleProductClick = () => {
    const slug = product.slug || product.id.toString();
    navigate(`/product/${slug}`);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product); // ใช้ addToCart เดียวกันแล้วค่อย navigate
    navigate('/cart');
  };

  // --- ฟังก์ชันสำหรับกดหัวใจ (เพิ่ม/ลบ Wishlist) ---
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง Card
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อใช้งาน Wishlist");
      navigate('/auth');
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (isInWishlist) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        const { error } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setIsInWishlist(false);
        toast.success("ลบออกจากรายการโปรด");
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้าไป
        const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setIsInWishlist(true);
        toast.success("เพิ่มในรายการโปรดแล้ว");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={handleProductClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-64 bg-gray-100">
        <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
        <div className="absolute top-2 left-2 z-10">
          {product.product_status && (
            <Badge className={
              product.product_status?.trim() === 'พร้อมส่ง' 
                ? 'bg-green-500 hover:bg-green-600 text-white border-transparent'
                : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
            }>
              {product.product_status}
            </Badge>
          )}
        </div>
        {/* --- แก้ไข #1: ต่อปุ่มหัวใจเข้ากับฟังก์ชัน --- */}
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-10 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500" 
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
        >
          <Heart 
            size={18} 
            className={`transition-all duration-200 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
          />
        </Button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <p className="text-xl font-bold text-purple-600 mb-3">฿{product.selling_price.toLocaleString()}</p>
        
        {/* --- แก้ไข #2: แสดงผล tags ที่มาจาก public_products view --- */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.map((tag: any) => (
              <Badge
                key={tag.slug || tag.name} // ใช้ slug หรือ name เป็น key
                variant="outline"
                className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/tag/${tag.slug || encodeURIComponent(tag.name)}`);
                }}
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2 mt-auto pt-2 border-t">
          <Button onClick={handleBuyNowClick} className="w-full" size="sm" disabled={product.product_status === 'สินค้าหมด'}>
            <CreditCard className="h-4 w-4 mr-2" />ซื้อเดี๋ยวนี้
          </Button>
          <Button onClick={handleAddToCartClick} variant="outline" size="sm" className="w-full" disabled={product.product_status === 'สินค้าหมด'}>
            <ShoppingCart className="h-4 w-4 mr-2" />เพิ่มลงตะกร้า
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
