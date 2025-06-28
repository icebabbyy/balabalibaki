// src/components/categories/EnhancedProductCard.tsx

import { ProductPublic } from '@/types/product';
import { Heart, ShoppingCart, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"; // ✨ นำ Card กลับมา
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

  // Logic สำหรับ Swap Image ยังคงใช้แบบ CSS เพื่อความเสถียร
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
  
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    navigate(`/products/tag/${encodeURIComponent(tag)}`);
  };

  return (
    // ✨ FIX: ใช้ Card และเอา flex, h-full ออกเพื่อให้ความสูงเป็นอิสระ
    <Card
      className="overflow-hidden cursor-pointer group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={() => onProductClick(product.id)}
    >
      <CardContent className="p-0">
        <div className="relative w-full aspect-[4/5] bg-gray-100">
          {/* รูปภาพหลัก */}
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
          />
          {/* รูปภาพตอน hover */}
          {rolloverImage && (
            <img
              src={rolloverImage}
              alt={`${product.name} (hover)`}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            />
          )}
          <div className="absolute top-2 left-2 z-10">
            {product.product_status && (
              <Badge className={`text-white border-transparent ${
                product.product_status === 'พร้อมส่ง' 
                  ? 'bg-green-500' 
                  : 'bg-purple-600'
              }`}>
                {product.product_status}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500" onClick={(e) => { e.stopPropagation(); /* Wishlist */ }}>
            <Heart size={18} />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2 text-sm h-10">{product.name}</h3>
          
          <p className="text-lg font-bold text-purple-600 mb-3">
            ฿{product.selling_price.toLocaleString()}
          </p>

          {/* ส่วนแสดง Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800"
                  onClick={(e) => handleTagClick(e, tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* ✨ FIX: นำปุ่มแบบเดิมกลับมา */}
          <div className="space-y-2 pt-2">
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
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;
