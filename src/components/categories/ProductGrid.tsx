// src/components/categories/ProductGrid.tsx

import { ProductPublic } from "@/types/product";
import EnhancedProductCard from "./EnhancedProductCard"; // ตรวจสอบว่า path ไปยัง EnhancedProductCard ถูกต้อง

interface ProductGridProps {
  products: ProductPublic[];
  onProductClick: (productId: number) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา</p>
      </div>
    );
  }

  return (
    // ✨ FIX: กำหนดจำนวนคอลัมน์ของ Grid ให้เหมาะสมในแต่ละขนาดหน้าจอ
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {products.map((product) => (
        // ✨ FIX: ส่ง props ทั้ง product และ onProductClick ไปให้การ์ดแต่ละใบ
        <EnhancedProductCard
          key={product.id}
          product={product}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
