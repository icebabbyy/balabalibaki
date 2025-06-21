import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductPublic } from "@/types/product";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
  onAddToCart?: (product: ProductPublic) => void;
}

const EnhancedProductCard = ({ product, onProductClick, onAddToCart }: EnhancedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // รูปหลัก
  const primaryImage = product.image || '/placeholder.svg';
  // รูป hover เอารูปแรกใน product_images ถ้ามี
  const hoverImage = product.product_images && product.product_images.length > 1
    ? product.product_images[1].image_url
    : primaryImage;

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
        <img
          src={isHovered ? hoverImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        />
        {product.product_status && (
          <Badge 
            className={`absolute top-2 left-2 text-white ${
              product.product_status === 'พรีออเดอร์'
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
          >
            {product.product_status}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 
          className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer"
          onClick={() => onProductClick(product.id)}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
        <p className="text-xl font-bold mb-3 text-purple-600">
          ฿{product.selling_price.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 mb-3">{product.category}</p>
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => onProductClick(product.id)}
          >
            ซื้อเดี๋ยวนี้
          </Button>
          {onAddToCart && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onAddToCart(product)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              เพิ่มลงตะกร้า
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;
