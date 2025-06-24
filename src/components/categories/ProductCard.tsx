// src/components/categories/ProductCard.js
import { useState } from 'react';
import { ProductPublic } from '@/types/product';

interface ProductCardProps {
  product: ProductPublic;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  // State เพื่อเก็บ URL ของรูปภาพที่จะแสดงผล
  const [displayImage, setDisplayImage] = useState(product.image);

  // หา URL ของรูปภาพที่สองสำหรับ Rollover (ถ้ามี)
  const rolloverImage = product.product_images && product.product_images.length > 0
    ? product.product_images[0].image_url
    : null;

  // ฟังก์ชันเมื่อนำเมาส์มาวางบนการ์ด
  const handleMouseEnter = () => {
    if (rolloverImage) {
      setDisplayImage(rolloverImage);
    }
  };

  // ฟังก์ชันเมื่อนำเมาส์ออกจากการ์ด
  const handleMouseLeave = () => {
    setDisplayImage(product.image); // กลับไปใช้รูปภาพหลัก
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* ส่วนแสดงรูปภาพ */}
      <div className="relative w-full h-64 bg-gray-200">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {/* ป้ายสถานะสินค้า */}
        {product.product_status && (
           <span className={`absolute top-2 left-2 text-xs font-semibold text-white px-2 py-1 rounded ${
               product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-orange-500'
           }`}>
               {product.product_status}
           </span>
        )}
      </div>

      {/* ส่วนรายละเอียดสินค้า */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
        <p className="text-xl font-bold text-gray-900 mt-2">฿{product.selling_price.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mt-1 mb-4">{product.category}</p>
        
        <div className="mt-auto">
          <button className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
            ซื้อเดี๋ยวนี้
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
