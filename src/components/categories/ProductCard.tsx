// src/components/categories/ProductCard.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Heart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useCart } from "@/hooks/useCart"; // สมมติว่าคุณมี custom hook นี้
import { toast } from "sonner"; // หรือ toast ปกติ

const ProductCard = ({ product }: { product: ProductPublic }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- ส่วนของการจัดการรูปภาพ ---
  // 1. เตรียม URL รูปภาพไว้ล่วงหน้า
  const mainImage = product.image || '/placeholder.svg';
  // หานิยามรูปภาพที่ไม่ใช่รูปหลัก
  const rolloverImage = product.product_images?.find(
    (img) => img && img.image_url !== mainImage
  )?.image_url;

  // 2. สร้าง State เพื่อเก็บ URL ของรูปภาพที่จะแสดง
  const [displayImage, setDisplayImage] = useState(mainImage);

  // 3. ใช้ useEffect เพื่ออัปเดต displayImage เมื่อ product เปลี่ยนแปลง
  //    (ป้องกันปัญหาข้อมูลมาไม่ทัน)
  useEffect(() => {
    setDisplayImage(product.image || '/placeholder.svg');
  }, [product.image]);


  // 4. ฟังก์ชันสำหรับจัดการ Event ของเมาส์
  const handleMouseEnter = () => {
    // ถ้ามีรูปภาพสำหรับ rollover ก็ให้เปลี่ยนไปแสดงรูปนั้น
    if (rolloverImage) {
      setDisplayImage(rolloverImage);
    }
  };

  const handleMouseLeave = () => {
    // กลับไปแสดงรูปภาพหลักเสมอ
    setDisplayImage(mainImage);
  };
  
  // --- ฟังก์ชันอื่นๆ ---
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
    addToCart(product);
    navigate('/cart');
  };

  return (
    // 5. เพิ่ม onMouseEnter และ onMouseLeave เข้าไปที่ div หลัก
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={handleProductClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 6. ผูก src ของ img เข้ากับ State 'displayImage' */}
      <div className="relative w-full h-64 bg-gray-100">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
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
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500" onClick={(e) => { e.stopPropagation(); /* Wishlist logic here */ }}>
          <Heart size={18} />
        </Button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        
        <p className="text-xl font-bold text-purple-600 mb-3">
          ฿{product.selling_price.toLocaleString()}
        </p>

        <div className="space-y-2 mt-auto pt-2">
          <Button
            onClick={handleBuyNowClick}
            className="w-full"
            size="sm"
            disabled={product.product_status === 'สินค้าหมด'}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            ซื้อเดี๋ยวนี้
          </Button>
          <Button
            onClick={handleAddToCartClick}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={product.product_status === 'สินค้าหมด'}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
