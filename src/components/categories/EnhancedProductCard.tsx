
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useState } from "react";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
  onAddToCart?: (product: ProductPublic) => void;
}

const EnhancedProductCard = ({ product, onProductClick, onAddToCart }: EnhancedProductCardProps) => {
  const primaryImage = product.image || '/placeholder.svg';
  const productImages = product.product_images && product.product_images.length > 0 
    ? product.product_images.map(img => img.image_url)
    : [];
  
  // Use second image for hover, or fallback to primary image
  const hoverImage = productImages.length > 0 ? productImages[0] : primaryImage;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div 
        className="relative w-full h-48 overflow-hidden rounded-t-lg figure"
        onClick={() => onProductClick(product.id)}
        style={{ position: 'relative', maxWidth: '100%' }}
      >
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            objectFit: 'cover'
          }}
        />
        
        {/* Hover Image - Only show if there's a different image to show */}
        {hoverImage !== primaryImage && (
          <img
            src={hoverImage}
            alt={`${product.name} - alternate view`}
            className="w-full h-full object-cover image-hover"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
              objectFit: 'cover',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          />
        )}

        {product.product_status && (
          <Badge className="absolute top-2 left-2 bg-purple-600 text-white z-10">
            {product.product_status}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors" onClick={() => onProductClick(product.id)}>
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
