
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: ProductPublic }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(product.image || '/placeholder.svg');

  // Handle image hover effect
  useEffect(() => {
    if (isHovered && product.product_images && product.product_images.length > 0) {
      const firstExtraImage = product.product_images.find(img => img.image_url !== product.image);
      if (firstExtraImage) {
        setCurrentImage(firstExtraImage.image_url);
      }
    } else {
      setCurrentImage(product.image || '/placeholder.svg');
    }
  }, [isHovered, product.image, product.product_images]);

  const handleProductClick = (productId: number) => {
    // Find the product slug - if not available, fallback to ID
    const slug = product.slug || productId.toString();
    navigate(`/product/${slug}`);
  };

  const addToCart = (product: ProductPublic) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      image: product.image,
      quantity: 1,
      sku: product.sku,
      variant: null,
      product_type: product.product_type || 'ETC'
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === cartItem.id && item.variant === cartItem.variant
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    navigate('/cart');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
      onClick={() => handleProductClick(product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg transition-opacity duration-300"
        />
        {product.product_status && (
          <Badge className="absolute top-2 left-2">
            {product.product_status}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-purple-600">
            ฿{product.selling_price?.toLocaleString()}
          </span>
        </div>
        
        <div className="space-y-2 mt-auto">
          <Button
            size="sm"
            className="w-full"
            onClick={handleBuyNow}
          >
            <CreditCard className="h-4 w-4" />
            ซื้อเดี๋ยวนี้
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
