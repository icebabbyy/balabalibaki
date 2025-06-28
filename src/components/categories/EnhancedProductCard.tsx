import { ProductPublic } from '@/types/product';
import { Heart, ShoppingCart, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
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

  const mainImage = product.image || product.product_images?.[0]?.image_url || '/placeholder.svg';
  const rolloverImage = product.product_images?.find(img => img.image_url !== mainImage)?.image_url;

  const handleActionClick = (e: React.MouseEvent, action: 'addToCart' | 'buyNow') => {
    e.stopPropagation();
    addToCart(product);
    if (action === 'buyNow') {
      navigate('/cart');
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={() => onProductClick(product.id)}
    >
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="relative w-full aspect-square bg-gray-100">
          <img src={mainImage} alt={product.name} className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"/>
          {rolloverImage && (
            <img src={rolloverImage} alt={`${product.name} (hover)`} className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"/>
          )}
          <div className="absolute top-2 left-2 z-10">
            {product.product_status && (
              <Badge className={`text-white border-transparent ${product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-purple-600'}`}>
                {product.product_status}
              </Badge>
            )}
          </div>
          {/* ✨ FIX 3: เพิ่ม aria-label ให้ปุ่ม Wishlist */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Add to wishlist"
            className="absolute top-2 right-2 z-10 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500" 
            onClick={(e) => { e.stopPropagation(); /* Wishlist logic here */ }}
          >
            <Heart size={18} />
          </Button>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {/* ✨ FIX 2: เอา h-10 ออก ทำให้ความสูงยืดหยุ่น */}
          <h3 className="font-semibold mb-2 line-clamp-2 text-sm">{product.name}</h3>
          
          <div className="flex-grow">
            <p className="text-lg font-bold text-purple-600">
              ฿{product.selling_price?.toLocaleString()}
            </p>
            {/* ✨ FIX 1: ลบส่วนแสดง Tags ออกไป */}
          </div>

          <div className="space-y-2 mt-4">
            <Button onClick={(e) => handleActionClick(e, 'buyNow')} size="sm" className="w-full" disabled={product.product_status === 'สินค้าหมด'}>
              <CreditCard className="h-4 w-4 mr-2" />
              ซื้อเดี๋ยวนี้
            </Button>
            <Button onClick={(e) => handleActionClick(e, 'addToCart')} variant="outline" size="sm" className="w-full" disabled={product.product_status === 'สินค้าหมด'}>
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
