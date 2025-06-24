// src/components/EnhancedProductCard.tsx

import { useState } from 'react';
import { ProductPublic } from '@/types/product';
import { Heart } from 'lucide-react';

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

const EnhancedProductCard = ({ product, onProductClick }: EnhancedProductCardProps) => {
  // ป้องกัน Error หาก product ไม่มีข้อมูล
  if (!product) {
    return null;
  }

  // 1. สร้าง State เพื่อควบคุมรูปภาพที่จะแสดงผล
  //    - ค่าเริ่มต้น: ใช้รูปหลัก (product.image) ถ้าไม่มี ให้ใช้รูปแรกในอัลบั้มแทน
  const [displayImage, setDisplayImage] = useState(product.image || product.product_images?.[0]?.image_url);

  // 2. เตรียมรูปสำหรับสลับตอน hover (รูปแรกในอัลบั้ม)
  const rolloverImage = product.product_images?.[0]?.image_url;

  // 3. ฟังก์ชันเมื่อเมาส์ชี้
  const handleMouseEnter = () => {
    // ถ้ามี rolloverImage และมันไม่ซ้ำกับรูปที่แสดงอยู่ ก็ให้สลับไปแสดง rolloverImage
    if (rolloverImage && rolloverImage !== displayImage) {
      setDisplayImage(rolloverImage);
    }
  };

  // 4. ฟังก์ชันเมื่อเมาส์ออก
  const handleMouseLeave = () => {
    // กลับไปแสดงรูปเริ่มต้นเสมอ
    setDisplayImage(product.image || product.product_images?.[0]?.image_url);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ทำให้ Div ทั้งหมดคลิกได้ */}
      <div onClick={() => onProductClick(product.id)} className="flex flex-col h-full">
        {/* ส่วนของรูปภาพ: มีแท็ก img แค่ตัวเดียว */}
        <div className="relative w-full h-64 bg-gray-100">
          <img
            src={displayImage || ''} // ผูก src กับ State ของเรา
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
          />
          {/* ป้ายสถานะสินค้า */}
          <div className="absolute top-2 left-2">
            {product.product_status && (
              <span className={`text-xs font-semibold text-white px-2 py-1 rounded ${
                product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {product.product_status}
              </span>
            )}
          </div>
          {/* ปุ่ม Wishlist */}
          <button className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors">
            <Heart size={18} />
          </button>
        </div>

        {/* ส่วนของรายละเอียด */}
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
