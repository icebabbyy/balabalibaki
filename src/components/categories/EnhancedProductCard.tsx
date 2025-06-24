// src/components/EnhancedProductCard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { ProductPublic } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, CreditCard } from 'lucide-react';

interface EnhancedProductCardProps {
  product: ProductPublic;
  // ทำให้ onProductClick ไม่จำเป็นต้องส่งมาแล้ว เพราะเราจะใช้ navigate ข้างในนี้แทน
}

const EnhancedProductCard = ({ product }: EnhancedProductCardProps) => {
  if (!product) return null;

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [displayImage, setDisplayImage] = useState(product.image || product.product_images?.[0]?.image_url);
  
  const rolloverImage = product.product_images?.find(img => img.image_url !== product.image)?.image_url;

  const handleMouseEnter = () => { if (rolloverImage) setDisplayImage(rolloverImage); };
  const handleMouseLeave = () => { setDisplayImage(product.image || product.product_images?.[0]?.image_url); };
  
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, null);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, null);
    navigate('/cart');
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div className="relative w-full h-64 bg-gray-100">
        <img src={displayImage || '/placeholder.svg'} alt={product.name || 'Product Image'} className="w-full h-full object-cover"/>
        <div className="absolute top-2 left-2">
          {product.product_status && (
            <Badge>{product.product_status}</Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500" onClick={(e) => e.stopPropagation()}>
          <Heart size={18} />
        </Button>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-purple-600">฿{product.selling_price?.toLocaleString()}</span>
        </div>
        <div className="space-y-2 mt-auto">
          <Button
            size="sm"
            className="w-full"
            onClick={handleBuyNowClick}
            disabled={product.product_status === 'สินค้าหมด'}
          >
            <CreditCard />
            ซื้อเดี๋ยวนี้
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddToCartClick}
            disabled={product.product_status === 'สินค้าหมด'}
          >
            <ShoppingCart />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default EnhancedProductCard;
