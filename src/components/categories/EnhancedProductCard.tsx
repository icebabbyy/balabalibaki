
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useState, useEffect } from "react";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
  onAddToCart?: (product: ProductPublic) => void;
}

const EnhancedProductCard = ({ product, onProductClick, onAddToCart }: EnhancedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imagePreloaded, setImagePreloaded] = useState(false);

  const primaryImage = product.main_image_url || product.image || '/placeholder.svg';
  
  // Get additional images for hover effect
  const additionalImages = (product.product_images || [])
    .filter(img => img.image_url !== primaryImage)
    .sort((a, b) => a.order - b.order);
  
  const hoverImage = additionalImages.length > 0 ? additionalImages[0].image_url : null;

  // Preload hover image
  useEffect(() => {
    if (hoverImage && !imagePreloaded) {
      const img = new Image();
      img.onload = () => setImagePreloaded(true);
      img.src = hoverImage;
    }
  }, [hoverImage, imagePreloaded]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div 
        className="relative w-full h-48 overflow-hidden rounded-t-lg"
        onClick={() => onProductClick(product.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
            hoverImage && isHovered && imagePreloaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Hover Image */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} - รูปที่ 2`}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
              isHovered && imagePreloaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Loading overlay for hover image */}
        {hoverImage && isHovered && !imagePreloaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Badge */}
        {product.product_status && (
          <Badge className="absolute top-2 left-2 bg-purple-600 text-white z-10">
            {product.product_status}
          </Badge>
        )}

        {/* Image counter indicator */}
        {additionalImages.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            1/{additionalImages.length + 1}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 
          className="font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer"
          onClick={() => onProductClick(product.id)}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
        <p className="text-xl font-bold mb-3 text-purple-600">
          ฿{product.selling_price.toLocaleString()}
        </p>
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
