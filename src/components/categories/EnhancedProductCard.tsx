// src/components/categories/EnhancedProductCard.tsx

import { ProductPublic } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

const EnhancedProductCard = ({ product, onProductClick }: EnhancedProductCardProps) => {
  if (!product) { return null; }

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const mainImage = product.image || '/placeholder.svg';
  const rolloverImage = product.product_images?.find(img => img.image_url !== mainImage)?.image_url;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // ถ้ามี options/variants, ให้ไปที่หน้าสินค้า
    if (product.options && product.options.length > 0) {
      onProductClick(product.id);
    } else {
      // ถ้าไม่มี ก็เพิ่มลงตะกร้าเลย
      addToCart(product);
    }
  };

  return (
    // ✨ FIX: เปลี่ยนจาก Card เป็น div ธรรมดา และใช้ group สำหรับ hover
    <div
      className="cursor-pointer group text-left"
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100 mb-2">
        {/* รูปภาพหลัก */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {/* รูปภาพตอน hover */}
        {rolloverImage && (
          <img
            src={rolloverImage}
            alt={`${product.name} (hover)`}
            className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          />
        )}
        {/* ป้าย Sale หรือสถานะอื่นๆ สามารถใส่ที่นี่ได้ */}
      </div>

      <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mt-1">฿{product.selling_price.toLocaleString()}</p>
      
      {/* ✨ FIX: เปลี่ยนจากปุ่ม เป็น Text Link */}
      <button 
        onClick={handleActionClick}
        className="text-sm text-purple-600 hover:underline mt-2 text-left"
      >
        {product.options && product.options.length > 0 ? 'เลือกตัวเลือก' : 'เพิ่มลงตะกร้า'}
      </button>
    </div>
  );
};

export default EnhancedProductCard;
