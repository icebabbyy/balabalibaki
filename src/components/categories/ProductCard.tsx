
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { user } = useAuth();

  const primaryImage = product.main_image_url || product.image || '/placeholder.svg';

  // Get hover image from product_images array
  const productImages = (product.product_images || [])
    .map(img => img.image_url)
    .filter(url => url !== primaryImage);
  
  const hoverImage = productImages.length > 0 ? productImages[0] : null;

  // Check if product is in wishlist
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.includes(product.id));
  }, [product.id]);

  // Preload hover image
  useEffect(() => {
    if (hoverImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = hoverImage;
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

  // Determine which image to show
  const currentImage = (isHovered && hoverImage && imageLoaded) ? hoverImage : primaryImage;

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onProductClick(product.id)}
    >
      <CardContent className="p-0">
        <div 
          className="aspect-square relative overflow-hidden rounded-t-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <Badge 
            className={`absolute top-2 left-2 text-white ${
              product.product_status === 'พรีออเดอร์' 
                ? 'bg-orange-500' 
                : 'bg-green-500'
            }`}
          >
            {product.product_status}
          </Badge>

          {/* Wishlist Button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={toggleWishlist}
          >
            <Heart 
              className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} 
            />
          </Button>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
            {product.name}
          </h3>
          <p className="text-xl font-bold" style={{ color: '#956ec3' }}>
            ฿{product.selling_price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">{product.category}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
