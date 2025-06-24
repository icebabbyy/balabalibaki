// src/components/EnhancedProductCard.tsx
import { useState } from 'react';
import { ProductPublic } from '@/types/product';
import { Heart, ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart'; // <-- import ศูนย์บัญชาการตะกร้า
import { useNavigate } from 'react-router-dom';

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

const EnhancedProductCard = ({ product, onProductClick }: EnhancedProductCardProps) => {
  if (!product) { return null; }

  const { addToCart, buyNow } = useCart(); // <-- เรียกใช้ฟังก์ชันจากศูนย์กลาง
  const navigate = useNavigate();

  const [displayImage, setDisplayImage] = useState(product.image || product.product_images?.[0]?.image_url);
  const rolloverImage = product.product_images?.find(img => img.image_url !== product.image)?.image_url;

  const handleMouseEnter = () => { if (rolloverImage) setDisplayImage(rolloverImage); };
  const handleMouseLeave = () => { setDisplayImage(product.image || product.product_images?.[0]?.image_url); };
  
  // สร้างฟังก์ชันเฉพาะสำหรับการคลิกปุ่มในการ์ด เพื่อไม่ให้ event ส่งไปถึง div หลัก
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง div ครอบ
    addToCart(product);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง div ครอบ
    // สำหรับการ์ด, ปุ่ม Buy Now จะพาไปหน้า Detail ก่อน เพื่อให้ลูกค้าเลือกตัวเลือก
    navigate(`/product/${product.id}`);
  };


  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onProductClick(product.id)} // คลิกที่ไหนก็ได้ในการ์ด จะไปหน้า Detail
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
        <button className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors">
            <Heart size={18} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
        <div className="mt-2 flex-grow">
            <p className="text-xl font-bold text-gray-900">฿{product.selling_price.toLocaleString()}</p>
        </div>
        
        {/* === ส่วนของปุ่มที่แก้ไขใหม่ทั้งหมด === */}
        <div className="mt-auto space-y-2 pt-4">
            <button
                onClick={handleBuyNowClick}
                className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                disabled={product.product_status === 'สินค้าหมด'}
            >
                <CreditCard className="h-4 w-4 mr-2" />
                <span>{product.product_status === 'สินค้าหมด' ? 'สินค้าหมด' : 'ซื้อเดี๋ยวนี้'}</span>
            </button>
            <button
                onClick={handleAddToCartClick}
                className="w-full bg-white border border-purple-600 text-purple-600 font-bold py-2 px-4 rounded-md hover:bg-purple-100 transition-colors flex items-center justify-center"
                disabled={product.product_status === 'สินค้าหมด'}
            >
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span>เพิ่มลงตะกร้า</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
