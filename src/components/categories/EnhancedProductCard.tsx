// src/components/EnhancedProductCard.tsx

import { ProductPublic } from '@/types/product';
import { Heart, ShoppingCart, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

const EnhancedProductCard = ({ product, onProductClick }: EnhancedProductCardProps) => {
  if (!product) { return null; }

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ✨ เราจะหา rolloverImage มาเตรียมไว้ แต่จะไม่ใช้ State หรือ useEffect แล้ว
  const mainImage = product.image || product.product_images?.[0]?.image_url || '/placeholder.svg';
  const rolloverImage = product.product_images?.find(img => img.image_url !== mainImage)?.image_url;

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
    // ✨ 1. ตรวจสอบว่ามี className="group" ที่นี่ (โค้ดของคุณมีอยู่แล้ว เยี่ยมครับ!)
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={() => onProductClick(product.id)}
    >
      {/* ✨ 2. แก้ไขส่วนแสดงรูปภาพใหม่ทั้งหมด */}
      <div className="relative w-full h-64 bg-gray-100">
        {/* รูปภาพหลัก (แสดงตลอดเวลา) */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
        />
        {/* รูปภาพสำรอง (จะแสดงเมื่อ hover ที่ group) */}
        {rolloverImage && (
          <img
            src={rolloverImage}
            alt={`${product.name} (hover)`}
            // 3. ปกติจะซ่อนไว้ (opacity-0) และจะแสดงขึ้นมาเมื่อ hover (group-hover:opacity-100)
            className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          />
        )}

        {/* ส่วน Badge และปุ่ม Heart จะต้องมี z-10 เพื่อให้ลอยอยู่เหนือรูปภาพ */}
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

      {/* ส่วนเนื้อหาของการ์ด (ไม่มีการเปลี่ยนแปลง) */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        
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

export default EnhancedProductCard;
