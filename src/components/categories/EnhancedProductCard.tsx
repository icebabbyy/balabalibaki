// src/components/EnhancedProductCard.tsx

import { useState } from 'react';
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

  const [displayImage, setDisplayImage] = useState(product.image || product.product_images?.[0]?.image_url);
  const rolloverImage = product.product_images?.find(img => img.image_url !== product.image)?.image_url;

  const handleMouseEnter = () => { if (rolloverImage) setDisplayImage(rolloverImage); };
  const handleMouseLeave = () => { setDisplayImage(product.image || product.product_images?.[0]?.image_url); };
  
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
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative w-full h-64 bg-gray-100">
        <img
          src={displayImage || ''}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
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
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500" onClick={(e) => { e.stopPropagation(); /* Wishlist logic here */ }}>
          <Heart size={18} />
        </Button>
      </div>

      {/* แก้ไขโครงสร้างทั้งหมดที่นี่ */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        
        <p className="text-xl font-bold text-purple-600 mb-3">
          ฿{product.selling_price.toLocaleString()}
        </p>

        {/* mt-auto จะดันกลุ่มปุ่มนี้ไปอยู่ล่างสุดของการ์ด */}
        <div className="space-y-2 mt-auto pt-2">
          <Button
              onClick={handleBuyNowClick}
              className="w-full"
              size="sm"
              disabled={product.product_status === 'สินค้าหมด'}
          >
              <CreditCard />
              ซื้อเดี๋ยวนี้
          </Button>
          <Button
              onClick={handleAddToCartClick}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={product.product_status === 'สินค้าหมด'}
          >
              <ShoppingCart />
              เพิ่มลงตะกร้า
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
