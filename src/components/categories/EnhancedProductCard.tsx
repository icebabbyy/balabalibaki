import type { ProductPublic } from "@/types/product";
import { Heart, ShoppingCart, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/context/WishlistContext";
import { toDisplaySrc } from "@/lib/imageUrl";
import React from "react";

interface EnhancedProductCardProps {
  product: ProductPublic;
  onProductClick: (productId: number) => void;
}

/** สร้าง URL รูปด้วย proxy/transform ถ้าได้ */
const srcW = (raw?: string, w = 700, q = 85) => {
  if (!raw) return "";
  const out = toDisplaySrc(raw, { w, q });
  return out || raw;
};

/** รวม URL รูปจากหลายฟิลด์ */
function collectImagesFlexible(p: any): string[] {
  const out: string[] = [];
  const push = (u?: string | null) => {
    if (typeof u === "string" && u.trim() && !out.includes(u)) out.push(u.trim());
  };

  push(p?.main_image_url);
  push(p?.main_image);
  push(p?.image_url);
  push(p?.imageUrl);
  push(p?.image);
  push(p?.thumbnail_url);
  push(p?.thumbnail);

  const fromArr = (arr?: any[]) =>
    Array.isArray(arr)
      ? arr.forEach((im: any) =>
          push(typeof im === "string" ? im : im?.image_url || im?.url)
        )
      : undefined;

  fromArr(p?.all_images);
  fromArr(p?.product_images);
  fromArr(p?.images);

  return out;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onProductClick,
}) => {
  if (!product) return null;

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const images = collectImagesFlexible(product as any);

  const mainRaw = images[0];
  const rolloverRaw = images.find((u) => u && u !== mainRaw);

  const wishlisted = isInWishlist((product as any).id);

  const status: string =
    (product as any).product_status ??
    (product as any).status ??
    "พรีออเดอร์";

  const price: number =
    Number((product as any).selling_price ?? (product as any).sellingPrice ?? 0) || 0;

  const disabled = status === "สินค้าหมด";

  const onBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product as any);
    navigate("/cart");
  };

  const onAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product as any);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      onClick={() => onProductClick((product as any).id)}
    >
      <CardContent className="p-0 flex flex-col flex-grow">
        {/* รูปสินค้า */}
        <div className="relative w-full aspect-square bg-gray-100">
          {mainRaw && (
            <img
              src={srcW(mainRaw, 700)}
              srcSet={`${srcW(mainRaw, 350)} 350w, ${srcW(mainRaw, 700)} 700w, ${srcW(mainRaw, 1000)} 1000w`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={(product as any).name ?? "product"}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={(e) => {
                const raw = mainRaw;
                if (raw && e.currentTarget.src !== raw) e.currentTarget.src = raw;
                else (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          {rolloverRaw && (
            <img
              src={srcW(rolloverRaw, 700)}
              srcSet={`${srcW(rolloverRaw, 350)} 350w, ${srcW(rolloverRaw, 700)} 700w, ${srcW(rolloverRaw, 1000)} 1000w`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={`${(product as any).name ?? "product"} (hover)`}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={(e) => {
                const raw = rolloverRaw;
                if (raw && e.currentTarget.src !== raw) e.currentTarget.src = raw;
                else (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          {/* สถานะสินค้า */}
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

        {/* เนื้อหา */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem] text-sm">
            {(product as any).name}
          </h3>

          {/* แถวบน: ราคา */}
          <div className="text-lg font-bold text-purple-600">
            ฿{price.toLocaleString()}
          </div>

          {/* แถวล่าง: ซื้อเลย + ตะกร้าขาว (outline) */}
          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={onBuyNow}
              disabled={disabled}
              size="sm"
              className="flex-1 h-10"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              ซื้อเลย
            </Button>

            <Button
              onClick={onAddToCart}
              disabled={disabled}
              variant="outline"
              size="icon"
              aria-label="เพิ่มลงตะกร้า"
              className="shrink-0 h-10 w-10"
              title="เพิ่มลงตะกร้า"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;
