import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Heart } from "lucide-react";
import type { ProductPublic } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { toDisplaySrc } from "@/lib/imageUrl";

interface ProductCardProps {
  product: ProductPublic;
  isInWishlist: boolean;
  onToggleWishlist: (product: ProductPublic) => void;
}

/** รวม URL รูปจากหลายฟิลด์ (รองรับทั้ง view/ตาราง) */
function collectImagesFlexible(p: any): string[] {
  const list: string[] = [];
  const push = (u?: string | null) => {
    if (u && typeof u === "string" && u.trim() && !list.includes(u)) list.push(u);
  };

  push(p?.main_image_url);
  if (Array.isArray(p?.all_images))
    p.all_images.forEach((im: any) => push(typeof im === "string" ? im : im?.image_url));
  if (Array.isArray(p?.product_images))
    p.product_images.forEach((im: any) => push(im?.image_url));
  if (Array.isArray(p?.images))
    p.images.forEach((im: any) => push(typeof im === "string" ? im : im?.image_url));
  push(p?.image_url);
  push(p?.image);

  return list;
}

const ProductCard = ({ product, isInWishlist, onToggleWishlist }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const imgs = collectImagesFlexible(product as any);
  const mainRaw = imgs[0] || "";
  const mainImage = mainRaw ? toDisplaySrc(mainRaw, { w: 700, q: 85 }) : "";
  const rolloverRaw = imgs.find((u) => u && u !== mainRaw);
  const rolloverImage = rolloverRaw ? toDisplaySrc(rolloverRaw, { w: 700, q: 85 }) : "";

  const [displayImage, setDisplayImage] = useState(mainImage);

  useEffect(() => {
    setDisplayImage(mainImage);
  }, [mainImage]);

  const handleMouseEnter = () => {
    if (rolloverImage) setDisplayImage(rolloverImage);
  };
  const handleMouseLeave = () => {
    setDisplayImage(mainImage);
  };

  const handleProductClick = () => {
    const slugOrId = (product as any).slug || (product as any).id;
    navigate(`/product/${slugOrId}`);
  };

  const handleToggleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product as any, 1);
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product as any, 1);
    navigate("/cart");
  };

  const status = (product as any).product_status || "พรีออเดอร์";
  const disabled = status === "สินค้าหมด";

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={handleProductClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-64 bg-gray-100">
        {displayImage && (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute top-2 left-2 z-10">
          <Badge
            className={
              status.trim() === "พร้อมส่ง"
                ? "bg-green-500 hover:bg-green-600 text-white border-transparent"
                : "bg-purple-600 hover:bg-purple-700 text-white border-transparent"
            }
          >
            {status}
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
            className={`transition-all duration-200 ${isInWishlist ? "text-red-500 fill-red-500" : "text-gray-500"}`}
          />
        </Button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <p className="text-xl font-bold text-purple-600 mb-3">
          ฿{Number(product.selling_price || 0).toLocaleString()}
        </p>

        {product.tags && (product.tags as any[]).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(product.tags as any[]).map((tag, idx) => {
              const tagName = typeof tag === "string" ? tag : tag?.name;
              if (!tagName) return null;
              return (
                <Link
                  to={`/products/tag/${encodeURIComponent(tagName)}`}
                  key={`${tagName}-${idx}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800">
                    #{tagName}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}

        {/* แถวปุ่มใหม่: ซื้อเดี๋ยวนี้ + ไอคอนตะกร้า */}
        <div className="mt-auto pt-2 border-t flex items-center gap-2">
          <Button
            onClick={handleBuyNowClick}
            className="flex-1"
            size="sm"
            disabled={disabled}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            ซื้อเดี๋ยวนี้
          </Button>
          <Button
            onClick={handleAddToCartClick}
            variant="outline"
            size="icon"
            aria-label="เพิ่มลงตะกร้า"
            className="shrink-0"
            disabled={disabled}
            title="เพิ่มลงตะกร้า"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
