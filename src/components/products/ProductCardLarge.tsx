// src/components/products/ProductCardLarge.tsx
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductPublic } from "@/types/product";
import { toDisplaySrc } from "@/lib/imageUrl";

const collectImages = (p: any): string[] => {
  const out: string[] = [];
  const push = (u?: string) => {
    if (typeof u === "string" && u.trim() && !out.includes(u)) out.push(u.trim());
  };
  push(p?.main_image_url);
  (p?.all_images || []).forEach((im: any) => push(typeof im === "string" ? im : im?.image_url || im?.url));
  (p?.images || []).forEach((im: any) => push(typeof im === "string" ? im : im?.image_url || im?.url));
  (p?.product_images || []).forEach((im: any) => push(im?.image_url || im?.url));
  push(p?.image_url); push(p?.image);
  return out;
};

export function ProductCardLarge({
  product,
  onProductClick,
}: {
  product: ProductPublic;
  onProductClick?: (id: number) => void;
}) {
  const nav = useNavigate();
  const images = collectImages(product as any);
  const main = images[0];
  const second = images.find((u) => u && u !== main);

  const go = () => {
    if (onProductClick) onProductClick(product.id as any);
    else nav(`/product/${(product as any).slug || product.id}`);
  };

  return (
    <div onClick={go} className="group block cursor-pointer">
      <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {main && (
            <img
              src={toDisplaySrc(main, { w: 900, q: 85 })}
              alt={product.name}
              className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
              loading="lazy"
              decoding="async"
            />
          )}
          {second && (
            <img
              src={toDisplaySrc(second, { w: 900, q: 85 })}
              alt={product.name}
              className="h-full w-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <CardContent className="p-3">
          <div className="line-clamp-2 font-medium">{product.name}</div>
          <div className="mt-1 text-primary font-semibold">
            ฿{Number((product as any).selling_price || 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
