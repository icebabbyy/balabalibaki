// path: src/components/ProductCard.tsx

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard } from "lucide-react";
import { ProductPublic } from "@/types/product"; // ตรวจสอบว่า path นี้ถูกต้อง

/**
 * นี่คือ Reusable Product Card Component
 * มันไม่จำเป็นต้องรู้ว่า "เพิ่มลงตะกร้า" หรือ "ซื้อเลย" ทำงานยังไง
 * หน้าที่ของมันคือการแสดงผล และส่งอีเวนต์กลับไปให้ Parent Component จัดการ
 */

// 1. กำหนด Props ที่ Component นี้จะรับเข้ามา
interface ProductCardProps {
  product: ProductPublic;
}

// 2. สร้าง Component
const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  // 3. สร้างฟังก์ชันการทำงานต่างๆ ไว้ข้างในนี้
  // ฟังก์ชันจะถูกเรียกใช้จากปุ่มหรือการ์ดโดยตรง
  const handleCardClick = () => {
    const path = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
    navigate(path);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // <<-- สำคัญมาก! ป้องกันไม่ให้ handleCardClick ทำงานตอนกดปุ่ม

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      quantity: 1,
      image: product.image,
      variant: null
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation(); // <<-- ป้องกันไม่ให้ handleCardClick ทำงาน
    
    // โค้ดส่วนนี้จะทำงานคล้ายๆ handleAddToCart แต่จะพาไปหน้า cart ต่อ
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
    
    // พาไปหน้าตะกร้า
    navigate('/cart');
  };


  return (
    <Card
      className="hover:shadow-lg transition-shadow flex flex-col cursor-pointer h-full"
      onClick={handleCardClick} // เมื่อคลิกที่การ์ด ให้ไปหน้ารายละเอียด
    >
      <div className="relative">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {product.product_status && (
          <Badge className="absolute top-2 left-2">{product.product_status}</Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-purple-600">
            ฿{product.selling_price?.toLocaleString()}
          </span>
        </div>
        <div className="space-y-2 mt-auto pt-3">
          <Button size="sm" className="w-full" onClick={handleBuyNow}>
            <CreditCard className="h-4 w-4 mr-2" />
            ซื้อเดี๋ยวนี้
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
