// src/components/EnhancedProductCard.tsx
import { useState } from 'react';
import { ProductPublic } from '@/types/product';
import { Heart, ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // <--- Import ที่สำคัญ

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
    addToCart(product, 1, null); // เพิ่มสินค้า default 1 ชิ้น
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, null); // เพิ่มสินค้าลงตะกร้า
    navigate('/cart'); // แล้วพาไปหน้าตะกร้า
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative w-full h-64 bg-gray-100">
        <img src={displayImage || ''} alt={product.name} className="w-full h-full object-cover"/>
        <div className="absolute top-2 left-2">
            {product.product_status && (
              <span className={`text-xs font-semibold text-white px-2 py-1 rounded ${
                product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {product.product_status}
              </span>
            )}
        </div>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors" onClick={(e) => {e.stopPropagation(); alert('Wishlist clicked!')}}>
            <Heart size={18} />
        </Button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
        <div className="mt-2 flex-grow">
            <p className="text-xl font-bold text-gray-900">฿{product.selling_price.toLocaleString()}</p>
        </div>
        
        <div className="mt-auto space-y-2 pt-4">
            <Button
                onClick={handleBuyNowClick}
                className="w-full"
                disabled={product.product_status === 'สินค้าหมด'}
            >
                <CreditCard />
                <span>{product.product_status === 'สินค้าหมด' ? 'สินค้าหมด' : 'ซื้อเดี๋ยวนี้'}</span>
            </Button>
            <Button
                onClick={handleAddToCartClick}
                variant="outline"
                className="w-full"
                disabled={product.product_status === 'สินค้าหมด'}
            >
                <ShoppingCart />
                <span>เพิ่มลงตะกร้า</span>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
