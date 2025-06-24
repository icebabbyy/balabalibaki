// src/components/categories/ProductCard.tsx (เวอร์ชัน Safe Mode)
import { useState, useEffect } from 'react';
import { ProductPublic } from '@/types/product';

interface ProductCardProps {
  product?: ProductPublic; // เพิ่ม ? เพื่อรองรับกรณี product อาจจะยังไม่มีค่า
  onProductClick: () => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {

  // *** ป้องกันขั้นที่ 1: ถ้าไม่มีข้อมูล product ให้ return หน้าว่างๆ ไปเลย ***
  if (!product) {
    // หรือจะแสดงผลเป็น Skeleton UI ก็ได้
    return <div className="bg-white rounded-lg shadow-md h-96"></div>;
  }

  const [displayImage, setDisplayImage] = useState(product.image);
  
  // ใช้ useEffect เพื่ออัปเดตรูปภาพเมื่อ product prop เปลี่ยนไป (สำคัญมาก)
  useEffect(() => {
    setDisplayImage(product.image);
  }, [product.image]);

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
        {/* *** ป้องกันขั้นที่ 2: ใช้ Optional Chaining (?.) ทุกจุด *** */}
        <img
          src={displayImage || ''} // ถ้า displayImage เป็น undefined ให้ใช้ string ว่างแทน
          alt={product?.name || 'Product Image'}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {product?.product_status && (
           <span className={`absolute top-2 left-2 text-xs font-semibold text-white px-2 py-1 rounded ${
               product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-orange-500'
           }`}>
               {product.product_status}
           </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product?.name}</h3>
        <p className="text-sm text-gray-500 mt-1">SKU: {product?.sku}</p>
        <p className="text-xl font-bold text-gray-900 mt-2">฿{product?.selling_price?.toLocaleString() || 0}</p>
        <p className="text-sm text-gray-600 mt-1 mb-4">{product?.category}</p>
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
