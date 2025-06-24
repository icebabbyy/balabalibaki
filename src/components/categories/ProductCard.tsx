// src/components/categories/ProductCard.tsx (เวอร์ชัน Minimalist)
import { useState } from 'react';
import { ProductPublic } from '@/types/product';

interface ProductCardProps {
  product: ProductPublic; // เรากลับมาใช้แบบ required เพราะ Grid จะส่งมาให้เสมอ
  onProductClick: () => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {

  // ถ้าไม่มี product (ป้องกันไว้ก่อน)
  if (!product) {
    return null; 
  }

  // 1. สร้าง state แบบเรียบง่ายที่สุด
  const [displayImage, setDisplayImage] = useState(product.image);

  // 2. ดึงรูปที่สองมาเก็บไว้ตรงๆ
  const rolloverImage = product.product_images?.[0]?.image_url;

  // 3. สร้างฟังก์ชันที่จำเป็น
  const handleMouseEnter = () => {
    if (rolloverImage) {
      setDisplayImage(rolloverImage);
    }
  };

  const handleMouseLeave = () => {
    setDisplayImage(product.image);
  };

  // 4. ส่วน JSX ที่ไม่มีการป้องกันที่ซับซ้อนเกินไป
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
