// src/components/categories/ProductGrid.js
import ProductCard from './ProductCard';
import { ProductPublic } from '@/types/product';

// *** ตรวจสอบให้แน่ใจว่า Interface รับ onProductClick มาถูกต้อง ***
interface ProductGridProps {
  products: ProductPublic[];
  onProductClick: (productId: number) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          // *** ส่ง onProductClick ไปให้ ProductCard ***
          onProductClick={() => onProductClick(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
