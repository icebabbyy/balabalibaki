// src/components/categories/ProductCard.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Heart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Link } from "react-router-dom"; // เพิ่ม Link

// รับ props เพิ่ม 2 ตัว
interface ProductCardProps {
  product: ProductPublic;
  isInWishlist: boolean;
  onToggleWishlist: (product: ProductPublic) => void;
}

const ProductCard = ({ product, isInWishlist, onToggleWishlist }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const mainImage = product.image || '/placeholder.svg';
  // แก้ไข: ใช้ images_list ที่เราทำใน view
  const rolloverImage = product.images_list?.find(
    (img: any) => img && img.image_url !== mainImage
  )?.image_url;

  const [displayImage, setDisplayImage] = useState(mainImage);

  // ทำให้รูปภาพกลับเป็นรูปหลักเสมอเมื่อ product เปลี่ยนไป
  useEffect(() => {
    setDisplayImage(product.image || '/placeholder.svg');
  }, [product.image]);

  const handleMouseEnter = () => {
    if (rolloverImage) setDisplayImage(rolloverImage);
  };

  const handleMouseLeave = () => {
    setDisplayImage(mainImage);
  };
  
  const handleProductClick = () => {
    const slug = product.slug || product.id.toString();
    navigate(`/product/${slug}`);
  };
  
  const handleToggleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/cart');
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={handleProductClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-64 bg-gray-100">
        <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
        <div className="absolute top-2 left-2 z-10">
          <Badge className={ product.product_status?.trim() === 'พร้อมส่ง' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent' }>
            {product.product_status}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500" 
          onClick={handleToggleWishlistClick}
        >
          <Heart 
            size={18} 
            className={`transition-all duration-200 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
          />
        </Button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <p className="text-xl font-bold text-purple-600 mb-3">฿{product.selling_price.toLocaleString()}</p>
        
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.map((tag: string) => ( //แก้ให้ tag เป็น string
              <Link to={`/products/tag/${encodeURIComponent(tag)}`} key={tag} onClick={(e) => e.stopPropagation()}>
                <Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <div className="space-y-2 mt-auto pt-2 border-t">
          <Button onClick={handleBuyNowClick} className="w-full" size="sm" disabled={product.product_status === 'สินค้าหมด'}><CreditCard className="h-4 w-4 mr-2" />ซื้อเดี๋ยวนี้</Button>
          <Button onClick={handleAddToCartClick} variant="outline" size="sm" className="w-full" disabled={product.product_status === 'สินค้าหมด'}><ShoppingCart className="h-4 w-4 mr-2" />เพิ่มลงตะกร้า</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
