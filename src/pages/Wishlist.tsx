// src/pages/Wishlist.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/hooks/useCart";
import { toDisplaySrc } from "@/lib/imageUrl";
import { supabase } from "@/integrations/supabase/client";
import type { ProductPublic } from "@/types/product";

/* ---------------- helpers ---------------- */
const imgW = (raw?: string, w = 800, q = 85) =>
  raw ? toDisplaySrc(raw, { w, q }) || raw : "";

/** รวมทุกฟิลด์รูป เท่าที่อาจเจอในแหล่งข้อมูลต่าง ๆ แล้วคืนรูปแรก */
function pickPrimaryImageFlexible(p: any): string | undefined {
  const out: string[] = [];
  const push = (u?: string | null) => {
    if (typeof u === "string" && u.trim() && !out.includes(u)) out.push(u.trim());
  };
  // เดี่ยว
  push(p?.main_image_url);
  push(p?.main_image);
  push(p?.image_url);
  push(p?.imageUrl);
  push(p?.image);
  push(p?.thumbnail_url);
  push(p?.thumbnail);
  // อาร์เรย์
  const collect = (arr?: any[]) =>
    Array.isArray(arr)
      ? arr.forEach((im: any) =>
          push(typeof im === "string" ? im : im?.image_url || im?.url),
        )
      : null;
  collect(p?.all_images);
  collect(p?.product_images);
  collect(p?.images);

  return out[0];
}

/** map row ของ view public_products -> ProductPublic */
function mapFromView(row: any): ProductPublic {
  const primary = pickPrimaryImageFlexible(row);

  const allRaw: string[] = [
    primary,
    row?.image_url,
    row?.image,
    row?.imageUrl,
    row?.main_image_url,
    row?.main_image,
    row?.thumbnail_url,
    row?.thumbnail,
    ...(Array.isArray(row?.product_images)
      ? row.product_images.map((x: any) => x?.image_url || x?.url)
      : []),
    ...(Array.isArray(row?.images)
      ? row.images.map((x: any) => x?.image_url || x?.url)
      : []),
    ...(Array.isArray(row?.all_images)
      ? row.all_images.map((x: any) => x?.image_url || x?.url)
      : []),
  ].filter((u) => typeof u === "string" && u.trim());

  const uniq = Array.from(new Set(allRaw));
  const imagesNorm = uniq.map((u, i) => ({ id: i, image_url: u, order: i }));

  return {
    id: Number(row.id ?? 0),
    name: String(row.name ?? ""),
    selling_price: Number(row.selling_price ?? row.sellingPrice ?? 0),
    description: String(row.description ?? ""),
    image: primary,
    image_url: row.image_url ?? row.imageUrl ?? undefined,
    main_image_url: row.main_image_url ?? row.main_image ?? undefined,
    product_status: String(row.product_status ?? row.status ?? "พรีออเดอร์"),
    sku: String(row.sku ?? ""),
    quantity: Number(row.quantity ?? 0),
    shipment_date: row.shipment_date ?? null,
    options: row.options ?? [],
    product_type: String(row.product_type ?? "standard"),
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
    slug: row.slug ?? String(row.id),
    category: String(row.category ?? ""),
    category_name: row.category_name ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    product_images: imagesNorm,
    images: imagesNorm,
    all_images: imagesNorm,
  };
}

/* ---------------- page ---------------- */
const Wishlist = () => {
  const navigate = useNavigate();
  const { loading: wlLoading, wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [fetching, setFetching] = useState(false);
  const [items, setItems] = useState<ProductPublic[]>([]);

  /** ดึงเฉพาะ id/slug ที่มีจาก context เพื่อยิงที่ view public_products เท่านั้น */
  const idList = useMemo(() => {
    const ids: number[] = [];
    (wishlistItems || []).forEach((it: any) => {
      const idNum =
        typeof it?.id === "number"
          ? it.id
          : Number(it?.id || it?.product_id || it?.productId || 0);
      if (idNum && !Number.isNaN(idNum) && !ids.includes(idNum)) ids.push(idNum);
    });
    return ids;
  }, [wishlistItems]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!idList || idList.length === 0) {
        setItems([]);
        return;
      }
      setFetching(true);
      // ✅ ดึงจาก VIEW public_products เท่านั้น
      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .in("id", idList);

      if (cancelled) return;
      if (error) {
        console.error("Fetch wishlist from public_products error:", error);
        setItems([]);
      } else {
        const mapped = (data || []).map(mapFromView);
        // จัดลำดับให้เหมือนลำดับใน wishlist
        const orderMap = new Map(idList.map((id, idx) => [id, idx]));
        mapped.sort(
          (a, b) => (orderMap.get(a.id) ?? 9999) - (orderMap.get(b.id) ?? 9999),
        );
        setItems(mapped);
      }
      setFetching(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [idList]);

  const showLoading = wlLoading || fetching;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-600 font-medium">กำลังโหลดรายการโปรด...</p>
        </div>
      </div>
    );
  }

  const hasItems = items && items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">รายการสินค้าที่ถูกใจ</h1>

        {!hasItems ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">ยังไม่มีสินค้าที่ถูกใจ</p>
            <Button onClick={() => navigate("/categories")}>เลือกซื้อสินค้า</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => {
              const raw = pickPrimaryImageFlexible(product);
              const src = imgW(raw, 900);
              const fallback = raw || "/placeholder.svg";

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <img
                      src={src || fallback}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer mb-4"
                      onClick={() =>
                        navigate(`/product/${product.slug || product.id}`)
                      }
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        if (fallback && el.src !== fallback) el.src = fallback;
                        else el.src = "/placeholder.svg";
                      }}
                    />
                    <h3
                      className="font-semibold mb-2 cursor-pointer hover:text-purple-600 line-clamp-2"
                      onClick={() =>
                        navigate(`/product/${product.slug || product.id}`)
                      }
                    >
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-purple-600 mb-3">
                      ฿{Number(product.selling_price || 0).toLocaleString()}
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleWishlist(product)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        นำออกจากรายการโปรด
                      </Button>
                      <Button className="w-full" onClick={() => addToCart(product, 1)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        เพิ่มลงตะกร้า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
