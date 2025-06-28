import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard } from "lucide-react";
import { ProductPublic } from "@/types/product"; // ตรวจสอบว่า path ถูกต้อง
import { toast } from "sonner";

const ProductCard = ({ product }: { product: ProductPublic }) => {
  const navigate = useNavigate();

  // --- ส่วนของการจัดการรูปภาพ ---
  const [currentImage, setCurrentImage] = useState<string | undefined>(product.image);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // ถ้าไม่ได้ hover ให้กลับไปเป็นรูปภาพหลักเสมอ
    if (!isHovered) {
      setCurrentImage(product.image);
      return; // จบการทำงานของ effect
    }

    // ถ้า hover และมี product_images array
    if (isHovered && Array.isArray(product.product_images) && product.product_images.length > 0) {
      // หานิยามรูปภาพที่ไม่ใช่รูปหลัก
      const alternateImage = product.product_images.find(
        (img) => img.image_url !== product.image
      );

      // ถ้าเจอรูปอื่น ให้เปลี่ยนรูป
      if (alternateImage && alternateImage.image_url) {
        setCurrentImage(alternateImage.image_url);
      }
    }
  }, [isHovered, product]); // ให้ effect นี้ทำงานทุกครั้งที่ isHovered หรือข้อมูล product เปลี่ยน


  // --- ฟังก์ชันอื่นๆ เหมือนเดิม ---
  const handleProductClick = () => {
    const slug = product.slug || product.id.toString();
    navigate(`/product/${slug}`);
  };

  const addToCart = () => {
    // ... (โค้ด addToCart ของคุณเหมือนเดิม) ...
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart();
    navigate('/cart');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart();
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    navigate(`/products/tag/${encodeURIComponent(tag)}`);
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={currentImage || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg transition-opacity duration-300"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
        />
        {/* ... (ส่วน Badge แสดง product_status เหมือนเดิม) ... */}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-purple-600">
            ฿{product.selling_price?.toLocaleString()}
          </span>
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800"
                onClick={(e) => handleTagClick(e, tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="space-y-2 mt-auto">
          {/* ... (ส่วนปุ่ม Button เหมือนเดิม) ... */}
          <Button size="sm" className="w-full" onClick={handleBuyNow}>
            <CreditCard className="h-4 w-4 mr-1" />
            ซื้อเดี๋ยวนี้
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
