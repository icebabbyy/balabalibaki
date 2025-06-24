// src/components/categories/ProductCard.js
import { useState } from 'react';
import { ProductPublic } from '@/types/product';

// *** แก้ไข Interface ให้รับ onProductClick ***
interface ProductCardProps {
  product: ProductPublic;
  onProductClick: () => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
  // State จัดการรูปภาพที่จะแสดง
  const [displayImage, setDisplayImage] = useState(product.image);

  // รูปที่สองสำหรับ Rollover (รูปแรกในอัลบั้ม)
  const rolloverImage = product.product_images?.[0]?.image_url;

  const handleMouseEnter = () => {
    if (rolloverImage) {
      setDisplayImage(rolloverImage);
    }
  };

  const handleMouseLeave = () => {
    setDisplayImage(product.image); // กลับไปใช้รูปหลัก
  };

  return (
    // *** แก้ไขให้ div ตัวนอกสุดรับ onProductClick ***
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onProductClick} // <-- ทำให้การคลิกทำงานที่นี่
    >
      <div className="relative w-full h-64 bg-gray-200">
        <img
          src={displayImage}
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
            {/* เราไม่จำเป็นต้องใส่ onClick ที่ปุ่มนี้แล้ว เพราะ div ทั้งหมดสามารถคลิกได้ */}
            <div className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-center">
                ดูรายละเอียด
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
