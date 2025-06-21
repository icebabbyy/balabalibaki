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
    : [primaryImage];

  const [showOptions, setShowOptions] = useState(false);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div 
        className="relative w-full h-48 overflow-hidden rounded-t-lg"
        onClick={() => onProductClick(product.id)}
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.product_status && (
          <Badge className="absolute top-2 left-2 bg-purple-600 text-white">
            {product.product_status}
          </Badge>
        )}

        {showOptions && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-2">
            <div className="grid grid-cols-3 gap-1">
              {productImages.slice(0, 3).map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  alt={`Option ${idx + 1}`}
                  className="w-12 h-12 object-cover rounded border border-white"
                />
              ))}
              {productImages.length === 1 && (
                // ถ้ามีแค่รูปเดียว ลอง duplicate random ขึ้นมา
                <>
                  <img src={primaryImage} className="w-12 h-12 object-cover rounded border border-white" />
                  <img src={primaryImage} className="w-12 h-12 object-cover rounded border border-white" />
                </>
              )}
            </div>
          </div>
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
