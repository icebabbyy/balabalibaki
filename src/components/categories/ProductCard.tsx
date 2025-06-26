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

    // เมื่อ hover เปลี่ยนภาพเป็นภาพถัดไป (ถ้ามี)
    useEffect(() => {
        // แก้ไขให้ดึงรูปจาก images_list ที่มาจาก View 'public_products'
        const imageList = product.images_list || [];
        if (isHovered && imageList.length > 1) {
            const altImage = imageList.find((img: any) => img.image_url !== product.image);
            if (altImage) {
                setCurrentImage(altImage.image_url);
            }
        } else {
            setCurrentImage(product.image || '/placeholder.svg');
        }
    }, [isHovered, product.image, product.images_list]);


    // ไปยังหน้ารายละเอียดสินค้า
    const handleProductClick = (productId: number) => {
      const slug = product.slug || productId.toString();
      navigate(`/product/${slug}`);
    };

    // เพิ่มสินค้าลงตะกร้า (ฟังก์ชันนี้ผมนำมาจากโค้ดเดิมของคุณ)
    const addToCart = (productToAdd: ProductPublic) => {
      const cartItem = {
        id: productToAdd.id,
        name: productToAdd.name,
        price: productToAdd.selling_price,
        image: productToAdd.image,
        quantity: 1,
        variant: null,
      };

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === productToAdd.id && item.variant === null);

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }
      localStorage.setItem('cart', JSON.stringify(existingCart));
      toast.success(`เพิ่ม "${productToAdd.name}" ลงในตะกร้าแล้ว`);
    };

    // ซื้อเดี๋ยวนี้
    const handleBuyNow = (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart(product);
      navigate('/cart');
    };

    // เพิ่มตะกร้าอย่างเดียว
    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart(product);
    };

    return (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
        onClick={() => handleProductClick(product.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
          />
          {product.product_status && (
             <Badge 
                className={`absolute top-2 left-2 border ${
                  product.product_status === 'พร้อมส่ง' 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                  : product.product_status === 'พรีออเดอร์'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {product.product_status}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-purple-600">
              ฿{product.selling_price?.toLocaleString()}
            </span>
          </div>

          {/* --- ส่วนแสดงผล Tags ที่แก้ไขแล้ว --- */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(product.tags as string[]).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    // ✅ แก้ไขให้ใช้ Path ที่ถูกต้องตรงนี้
                    navigate(`/products/tag/${encodeURIComponent(tag)}`);
                  }}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2 mt-auto">
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
