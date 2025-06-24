import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
  onAddToCart?: (product: ProductPublic) => void;
}

const EnhancedProductCard = ({ product, onProductClick, onAddToCart }: EnhancedProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { user } = useAuth();
  
  const primaryImage = product.main_image_url || product.image || '/placeholder.svg';

  const productImages = (product.product_images || [])
    .map(img => img.image_url)
    .filter(url => url && url !== primaryImage);

  const hoverImage = productImages.length > 0 ? productImages[0] : null;

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.includes(product.id));
  }, [product.id]);

  useEffect(() => {
    if (hoverImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(false);
      img.src = hoverImage;
    } else {
      setImageLoaded(true); // ไม่มีภาพ hover ก็ถือว่าโหลดเสร็จ
    }
  }, [hoverImage]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบเพื่อใช้งานรายการสินค้าที่ถูกใจ');
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isInWishlist) {
      const updatedWishlist = wishlist.filter((id: number) => id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
      toast.success('ลบออกจากรายการสินค้าที่ถูกใจแล้ว');
    } else {
      const updatedWishlist = [...wishlist, product.id];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(true);
      toast.success('เพิ่มในรายการสินค้าที่ถูกใจแล้ว');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div 
        className="relative w-full h-48 overflow-hidden rounded-t-lg"
        onClick={() => onProductClick(product.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Primary image */}
{/* รูปภาพหลัก */}
<img
  src={primaryImage}
  alt={product.name}
  className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none ${
    isHovered && hoverImage && imageLoaded ? 'opacity-0' : 'opacity-100'
  }`}
/>

{/* รูปภาพรอง */}
{hoverImage && (
  <img
    src={hoverImage}
    alt={`${product.name} (preview)`}
    className={`w-full h-full object-cover absolute inset-0 z-20 transition-opacity duration-300 pointer-events-none ${
      isHovered && imageLoaded ? 'opacity-100' : 'opacity-0'
    }`}
/>
)}

        {/* Badge */}
        {product.product_status && (
          <Badge className="absolute top-2 left-2 bg-purple-600 text-white z-10">
            {product.product_status}
          </Badge>
        )}

        {/* Wishlist Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
          onClick={toggleWishlist}
        >
          <Heart 
            className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} 
          />
        </Button>
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
