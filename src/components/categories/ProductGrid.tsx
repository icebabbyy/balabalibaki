
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  status: string;
  sku: string;
}

interface ProductGridProps {
  products: Product[];
  onProductClick: (productId: number) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id}
          product={product}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
