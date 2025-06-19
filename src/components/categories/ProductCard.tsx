
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface ProductCardProps {
  product: Product;
  onProductClick: (productId: number) => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onProductClick(product.id)}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <Badge 
            className={`absolute top-2 left-2 text-white ${
              product.status === 'พรีออเดอร์' 
                ? 'bg-orange-500' 
                : 'bg-green-500'
            }`}
          >
            {product.status}
          </Badge>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
          <p className="text-xl font-bold" style={{ color: '#956ec3' }}>
            ฿{product.selling_price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">{product.category}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
