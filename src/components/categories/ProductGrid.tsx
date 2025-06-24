// src/components/categories/ProductCard.tsx

// 1. นำเข้า useState จาก React
import { useState } from 'react';
import { ProductPublic } from '@/types/product';

interface ProductCardProps {
  product: ProductPublic;
  onProductClick: () => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {

  // 2. สร้าง State เพื่อเก็บ URL ของรูปภาพที่จะแสดง
  //    ค่าเริ่มต้นคือรูปภาพหลักของสินค้า (product.image)
  const [displayImage, setDisplayImage] = useState<string | undefined>(product.image);

  // 3. เตรียม URL ของรูปภาพที่สองสำหรับ Rollover
  //    ใช้ Optional Chaining (?.) เพื่อป้องกัน Error ถ้าไม่มี product_images
  const rolloverImage = product.product_images?.[0]?.image_url;

  // 4. ฟังก์ชันที่จะทำงานเมื่อนำเมาส์ "เข้า" มาในพื้นที่การ์ด
  const handleMouseEnter = () => {
    // ถ้ามีรูปภาพที่สอง (rolloverImage)
    if (rolloverImage) {
      // ให้อัปเดต State ไปเป็น URL ของรูปที่สอง
      setDisplayImage(rolloverImage);
    }
  };

  // 5. ฟังก์ชันที่จะทำงานเมื่อนำเมาส์ "ออก" จากพื้นที่การ์ด
  const handleMouseLeave = () => {
    // อัปเดต State ให้กลับไปเป็น URL ของรูปภาพหลักเสมอ
    setDisplayImage(product.image);
  };

  return (
    // 6. เพิ่ม onMouseEnter และ onMouseLeave เข้าไปที่ div หลักของการ์ด
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      onClick={onProductClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-64 bg-gray-200">
        {/* 7. แก้ไข src ของ img ให้ใช้ State (displayImage) ของเรา */}
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
            <div className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-center">
                ดูรายละเอียด
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
