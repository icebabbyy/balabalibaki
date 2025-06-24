// src/components/categories/ProductCard.tsx (The Final Fix)
import { useState } from 'react';
import { ProductPublic } from '@/types/product';

interface ProductCardProps {
  product: ProductPublic;
  onProductClick: () => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {

  // ==================================================================
  // บรรทัดนี้คือพระเอก: ป้องกัน Error ที่เราเจอโดยตรง
  // ถ้า product prop ยังไม่มีข้อมูลเข้ามา, ให้หยุดการทำงานของ component นี้ไปเลย
  if (!product) {
    return null; 
  }
  // ==================================================================

  // โค้ดส่วนที่เหลือจะทำงานก็ต่อเมื่อ 'product' มีข้อมูลแล้วเท่านั้น
  const [displayImage, setDisplayImage] = useState(product.image);

  const rolloverImage = product.product_images?.[0]?.image_url;

  const handleMouseEnter = () => {
    if (rolloverImage) {
      setDisplayImage(rolloverImage);
    }
  };

  const handleMouseLeave = () => {
    setDisplayImage(product.image);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      onClick={onProductClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-64 bg-gray-200">
        <img
          src={displayImage || ''}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {product.product_status && (
           <span className={`absolute top-2 left-2 text-xs font-semibold text-white px-2 py-1 rounded ${
               product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-orange-500'
           }`}>
               {product.product_status}
           </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
        <p className="text-xl font-bold text-gray-900 mt-2">฿{product.selling_price.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mt-1 mb-4">{product.category}</p>
        <div className="mt-auto">
            <div className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-center">
                ดูรายละเอียด
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
