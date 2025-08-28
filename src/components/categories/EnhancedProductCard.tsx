// src/components/categories/EnhancedProductCard.tsx
import type { ProductPublic } from "@/types/product";
import { Heart, ShoppingCart, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/context/WishlistContext";
import { toDisplaySrc } from "@/lib/imageUrl";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

/** ดึง URL รูปจากหลายฟิลด์ให้ครอบคลุม (รองรับ key แปลก ๆ) */
function collectImagesFlexible(p: any): string[] {
  const out: string[] = [];
  const push = (u?: string | null) => {
    if (typeof u === "string" && u.trim() && !out.includes(u)) out.push(u.trim());
  };

  // ตัวหลัก
  push(p?.main_image_url);
  push(p?.main_image);
  push(p?.image_url);
  push(p?.imageUrl);
  push(p?.image);
  push(p?.thumbnail_url);
  push(p?.thumbnail);

  // arrays
  const collectFrom = (arr?: any[]) =>
    Array.isArray(arr)
      ? arr.forEach((im: any) =>
          push(typeof im === "string" ? im : im?.image_url || im?.url)
        )
      : undefined;

  collectFrom(p?.all_images);
  collectFrom(p?.product_images);
  collectFrom(p?.images);

  return out;
}

/** สร้าง src ที่ “ต้องได้รูป” : proxy → raw → ว่าง */
const buildSrc = (raw?: string) => {
  if (!raw) return "";
  const proxied = toDisplaySrc(raw, { w: 700, q: 85 });
  return proxied || raw;
};

const EnhancedProductCard = ({ product, onProductClick }: EnhancedProductCardProps) => {
  if (!product) return null;

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const images = collectImagesFlexible(product as any);

  // main
  const mainRaw = images[0];
  const mainSrc = buildSrc(mainRaw);

  // rollover (รูปถัดไปถ้ามี)
  const rolloverRaw = images.find((u) => u && u !== mainRaw);
  const rolloverSrc = buildSrc(rolloverRaw);

  const wishlisted = isInWishlist((product as any).id);

  const status: string =
    (product as any).product_status ??
    (product as any).status ??
    "พรีออเดอร์";

  const price: number =
    Number((product as any).selling_price ?? (product as any).sellingPrice ?? 0) || 0;

  const handleActionClick = (
    e: React.MouseEvent,
    action: "addToCart" | "buyNow"
  ) => {
    e.stopPropagation();
    addToCart(product as any);
    if (action === "buyNow") navigate("/cart");
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={() => onProductClick((product as any).id)}
    >
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="relative w-full aspect-square bg-gray-100">
          {/* main image */}
          {mainRaw && (
            <img
              src={mainSrc}
              alt={(product as any).name ?? "product"}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                const raw = mainRaw;
                if (raw && e.currentTarget.src !== raw) {
                  e.currentTarget.src = raw;
                } else {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }
              }}
              loading="lazy"
              decoding="async"
            />
          )}

          {/* rollover image */}
          {rolloverRaw && (
            <img
              src={rolloverSrc}
              alt={`${(product as any).name ?? "product"} (hover)`}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                const raw = rolloverRaw;
                if (raw && e.currentTarget.src !== raw) {
                  e.currentTarget.src = raw;
                } else {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }
              }}
              loading="lazy"
              decoding="async"
            />
          )}

          {/* สถานะ */}
          {status && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                className={`text-white border-transparent ${
                  status.includes("พร้อม") ? "bg-green-500" : "bg-purple-600"
                }`}
              >
                {status}
              </Badge>
            </div>
          )}

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add to wishlist"
            className="absolute top-2 right-2 z-10 bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product as any);
            }}
          >
            <Heart
              size={18}
              fill={wishlisted ? "currentColor" : "none"}
              className={wishlisted ? "text-red-500" : "text-gray-600"}
            />
          </Button>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold mb-2 truncate text-sm">
            {(product as any).name}
          </h3>

          <div className="flex-grow">
            <p className="text-lg font-bold text-purple-600">
              ฿{price.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <Button
              onClick={(e) => handleActionClick(e, "buyNow")}
              size="sm"
              className="w-full"
              disabled={status === "สินค้าหมด"}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              ซื้อเดี๋ยวนี้
            </Button>
            <Button
              onClick={(e) => handleActionClick(e, "addToCart")}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={status === "สินค้าหมด"}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;
