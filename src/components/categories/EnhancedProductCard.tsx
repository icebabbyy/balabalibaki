// src/components/EnhancedProductCard.tsx
import { useState, useEffect } from 'react';
import { ProductPublic } from '@/types/product';
import { Heart } from 'lucide-react';

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

const EnhancedProductCard = ({ product, onProductClick }: EnhancedProductCardProps) => {
  if (!product) { return null; }

  const [displayImage, setDisplayImage] = useState(product.image);

  // เมื่อข้อมูล product เปลี่ยน ให้มั่นใจว่า displayImage ถูกอัปเดตเป็นรูปที่ถูกต้องเสมอ
  useEffect(() => {
    setDisplayImage(product.image);
  }, [product.image]);

  const rolloverImage = product.product_images?.find(img => img.image_url !== product.image)?.image_url;

  const handleMouseEnter = () => { if (rolloverImage) setDisplayImage(rolloverImage); };
  const handleMouseLeave = () => { setDisplayImage(product.image); };

  return (
    // ใช้ไม้แข็ง: เพิ่ม inline style `visibility: 'visible'` เพื่อบังคับให้แสดงผล
    <div
      style={{ visibility: 'visible' }}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div onClick={() => onProductClick(product.id)} className="flex flex-col h-full">
        <div className="relative w-full h-64 bg-gray-100">
          <img
            src={displayImage || ''}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
          />
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
          <div className="mt-2 flex-grow">
            <p className="text-xl font-bold text-gray-900">฿{product.selling_price.toLocaleString()}</p>
          </div>
          <div className="mt-4">
            <button className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
              ซื้อเดี๋ยวนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
