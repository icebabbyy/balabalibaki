import { useState } from 'react';
import { ProductPublic } from '@/types/product';

interface ProductCardProps {
  product: ProductPublic;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  // State สำหรับเก็บ URL รูปที่ต้องแสดง
  const [displayImage, setDisplayImage] = useState(product.image);
  
  // รูปที่สองสำหรับสลับตอน hover
  const rolloverImage = product.product_images?.[0]?.image_url;

  const handleMouseEnter = () => {
    // ถ้ามีรูปที่สอง ให้เปลี่ยนไปแสดงรูปนั้น
    if (rolloverImage) {
      setDisplayImage(rolloverImage);
    }
  };

  const handleMouseLeave = () => {
    // เมื่อเมาส์ออก ให้กลับไปแสดงรูปหลักเสมอ
    setDisplayImage(product.image);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col group"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-64 bg-gray-200">
        {/* ลบ class เจ้าปัญหาอย่าง 'opacity-0' และ 'group-hover:opacity-100' ออกไป
          แล้วผูก src เข้ากับ state ของเราโดยตรง
        */}
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
