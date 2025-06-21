
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import WishlistButton from "@/components/WishlistButton";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  product_status: string;
  sku: string;
  shipment_date?: string;
}

interface EnhancedProductCardProps {
  product: Product;
  images?: string[];
  onClick: () => void;
}

const EnhancedProductCard = ({ product, images = [], onClick }: EnhancedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage = product.image;
  const hoverImage = images.length > 1 ? images[1] : images[0] || primaryImage;
  const shouldShowHoverEffect = images.length > 1 && !imageError;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'พร้อมส่ง':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'พรีออเดอร์':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'สินค้าหมด':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            shouldShowHoverEffect && isHovered 
              ? 'opacity-0 scale-105' 
              : 'opacity-100 scale-100'
          }`}
          onError={() => setImageError(true)}
        />
        
        {/* Hover Image */}
        {shouldShowHoverEffect && (
          <img
            src={hoverImage}
            alt={`${product.name} - รูปที่ 2`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              isHovered 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            onError={() => setImageError(true)}
          />
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(product.product_status)} border font-medium`}>
            {product.product_status}
          </Badge>
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <WishlistButton 
            productId={product.id}
            productSku={product.sku}
            size="sm"
          />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-purple-600">
            ฿{formatPrice(product.selling_price)}
          </p>
          
          {product.shipment_date && (
            <p className="text-xs text-gray-500">
              {new Date(product.shipment_date).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short'
              })}
            </p>
          )}
        </div>

        {/* Category */}
        <p className="text-sm text-gray-500 mt-1">{product.category}</p>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
