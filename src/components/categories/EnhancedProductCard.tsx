import { useState, useEffect } from "react";
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
  const [imageLoaded, setImageLoaded] = useState(false);

  const primaryImage = product.main_image_url || product.image || '/placeholder.svg';
  const hoverImage = (product.product_images || []).find(img => img.image_url !== primaryImage)?.image_url || null;

  // Preload hover image
  useEffect(() => {
    if (hoverImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = hoverImage;
    }
  }, [hoverImage]);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={product.name}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 z-10 pointer-events-none ${
              isHovered && hoverImage && imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {/* Hover Image */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} (preview)`}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 z-20 pointer-events-none ${
                isHovered && imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          <Badge 
            className={`absolute top-2 left-2 text-white z-30 ${
              product.product_status === 'พรีออเดอร์' 
                ? 'bg-orange-500' 
                : 'bg-green-500'
            }`}
          >
            {product.product_status}
          </Badge>
        </div>
        
        <div className="p-4">
          <h3 
            className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 hover:text-purple-600 transition-colors"
            onClick={() => onProductClick(product.id)}
          >
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
          <p className="text-xl font-bold mb-3" style={{ color: '#956ec3' }}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;
