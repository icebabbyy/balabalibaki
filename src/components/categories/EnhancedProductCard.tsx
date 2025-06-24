
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useEffect, useState } from "react";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
  onAddToCart?: (product: ProductPublic) => void;
}

const EnhancedProductCard = ({ product, onProductClick, onAddToCart }: EnhancedProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const primaryImage = product.main_image_url || product.image || '/placeholder.svg';

  // Get hover image from product_images array
  const productImages = (product.product_images || [])
    .map(img => img.image_url)
    .filter(url => url !== primaryImage);
  
  const hoverImage = productImages.length > 0 ? productImages[0] : null;

  // Preload hover image
  useEffect(() => {
    if (hoverImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = hoverImage;
    }
  }, [hoverImage]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div 
        className="relative w-full h-48 overflow-hidden rounded-t-lg"
        onClick={() => onProductClick(product.id)}
      >
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
            hoverImage && imageLoaded ? 'group-hover:opacity-0' : ''
          }`}
        />

        {/* Hover Image */}
        {hoverImage && imageLoaded && (
          <img
            src={hoverImage}
            alt={`${product.name} - alternate view`}
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        {/* Badge */}
        {product.product_status && (
          <Badge className="absolute top-2 left-2 bg-purple-600 text-white z-10">
            {product.product_status}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 
          className="font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors"
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
