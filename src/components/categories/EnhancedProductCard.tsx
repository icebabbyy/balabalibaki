import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductPublic } from "@/types/product";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
  onAddToCart?: (product: ProductPublic) => void;
}

const EnhancedProductCard = ({ product, onProductClick, onAddToCart }: EnhancedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- Logic การหารูปภาพ ---
  // รูปหลัก: ดึงจาก main_image_url ก่อน ถ้าไม่มีก็เอา image ถ้าไม่มีอีกก็ใช้รูป placeholder
  const primaryImage = product.main_image_url || product.image || '/placeholder.svg';
  
  // รูปตอน Hover: หารูปแรกในอัลบั้ม product_images ที่ URL ไม่ซ้ำกับรูปหลัก
  // ถ้าหาไม่เจอ hoverImage จะเป็น null
  const hoverImage = (product.product_images || [])
    .find(img => img.image_url && img.image_url !== primaryImage)?.image_url || null;

  // --- Preloading ---
  // ใช้ useEffect เพื่อโหลดรูป hover เตรียมไว้ล่วงหน้า
  // เพื่อให้ตอน hover รูปแสดงผลได้ทันที ไม่ต้องรอโหลด
  useEffect(() => {
    // ถ้ามีรูป hover
    if (hoverImage) {
      const img = new Image(); // สร้าง object รูปภาพในหน่วยความจำ
      img.onload = () => setImageLoaded(true); // เมื่อโหลดเสร็จ ให้ตั้งค่าว่าโหลดแล้ว
      img.src = hoverImage; // สั่งให้เริ่มโหลดรูป
    }
  }, [hoverImage]); // ทำงานใหม่ทุกครั้งที่ hoverImage เปลี่ยนไป

  // ตัวแปรเช็กว่าพร้อมจะแสดงผลการ hover หรือยัง
  // ต้อง hover อยู่, มีรูป hover, และรูปนั้นโหลดเสร็จแล้ว
  const isHoverEffectReady = isHovered && hoverImage && imageLoaded;

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-50">
          {/* --- ส่วนแสดงรูปภาพ --- */}
          
          {/* รูปหลัก */}
          <img
            src={primaryImage}
            alt={product.name}
            className={`
              w-full h-full object-cover absolute inset-0 transition-opacity duration-300 z-10 pointer-events-none 
              ${isHoverEffectReady ? 'opacity-0' : 'opacity-100'}
            `}
          />
          
          {/* รูปตอน Hover (จะถูก render ก็ต่อเมื่อมี hoverImage) */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} (preview)`}
              className={`
                w-full h-full object-cover absolute inset-0 transition-opacity duration-300 z-20 pointer-events-none 
                ${isHoverEffectReady ? 'opacity-100' : 'opacity-0'}
              `}
            />
          )}

          {/* ป้ายสถานะสินค้า */}
          <Badge
            className={`absolute top-2 left-2 text-white z-30 ${
              product.product_status === 'พรีออเดอร์' 
                ? 'bg-orange-500' 
                : 'bg-green-500'
            }`}
          >
            {product.product_status}
          </Badge>
        </div>
        
        {/* --- ส่วนแสดงรายละเอียดสินค้า --- */}
        <div className="p-4">
          <h3
            className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 hover:text-purple-600 transition-colors"
            onClick={() => onProductClick(product.id)}
          >
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
          <p className="text-xl font-bold mb-3" style={{ color: '#956ec3' }}>
            ฿{product.selling_price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mb-3">{product.category}</p>
          
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
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;
