import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductPublic } from "@/types/product";

interface VariantImage {
  variant_name: string;
  image_url: string;
}

interface EnhancedProductCardProps {
  product: ProductPublic;
  productImages?: VariantImage[];  // ✅ เพิ่มเพื่อรับรูป variant / additional
  onProductClick: (productId: number) => void;
  onAddToCart?: (product: ProductPublic) => void;
}

const EnhancedProductCard = ({
  product,
  productImages = [],
  onProductClick,
  onAddToCart
}: EnhancedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.image || '/placeholder.svg';

  // ✅ หา hover image จาก productImages ถ้ามี
  const hoverImage = (() => {
    if (productImages.length === 0) return product.productImages?.[0] || primaryImage;

    const match = productImages.find(img =>
      img.variant_name?.toLowerCase() === product.name.toLowerCase()
    );
    return match?.image_url || product.productImages?.[0] || primaryImage;
  })();

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <img
            src={isHovered ? hoverImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 ease-in-out"
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out'
            }}
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

        <div className="p-4">
          <h3 
            className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 hover:text-purple-600 transition-colors"
            onClick={() => onProductClick(product.id)}
          >
