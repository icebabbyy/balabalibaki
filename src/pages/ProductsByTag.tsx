// src/pages/ProductsByTag.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProductGrid from "@/components/categories/ProductGrid";
import type { ProductPublic } from "@/types/product";
import { toast } from "sonner";

/**
 * แสดงสินค้าตาม "แท็ก" (case-insensitive)
 * ลำดับความพยายาม:
 *  1) RPC: get_product_ids_by_tag_name(tag_name)
 *  2) หา tag_id จากตาราง tags (exact → contains) แล้วดึง product_ids จาก product_tags
 *  3) ดึงสินค้าจาก view สาธารณะ public_products ตาม id ที่ได้
 */
export default function ProductsByTag() {
  // รองรับทั้ง /products/tag/:tag และ /products/tag/:tagSlug
  const params = useParams<{ tag?: string; tagSlug?: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);

  // สร้างคีย์ค้นหาแบบ clean
  const tagQuery = useMemo(() => {
    const raw = (params.tag ?? params.tagSlug ?? "").toString();
    return decodeURIComponent(raw).replace(/^#/, "").trim();
  }, [params.tag, params.tagSlug]);

  useEffect(() => {
    if (!tagQuery) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetchProductsByTag(tagQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagQuery]);

  const fetchProductsByTag = async (q: string) => {
    setLoading(true);

    // safety timeout กันค้างหน้าหมุน
    const timer = setTimeout(() => {
      setLoading(false);
      toast.error("โหลดช้าเกินไป ลองรีเฟรชอีกครั้ง");
    }, 10000);

    try {
      let ids: number[] = [];

      // ---------- 1) ลองใช้ RPC ถ้ามี ----------
      const { data: rpcIds, error: rpcErr } = await supabase
        .rpc("get_product_ids_by_tag_name", { tag_name: q });

      if (!rpcErr && Array.isArray(rpcIds) && rpcIds.length > 0) {
        ids = rpcIds
          .map((r: any) => Number(r?.id ?? r))
          .filter(Number.isFinite);
      }

      // ---------- 2) Fallback: tags → product_tags ----------
      if (ids.length === 0) {
        // หา tag id (ลอง exact → ไม่เจอค่อย contains)
        let { data: t1 } = await supabase
          .from("tags")
          .select("id")
          .ilike("name", q)
          .maybeSingle();

        if (!t1) {
          const { data: t2 } = await supabase
            .from("tags")
            .select("id")
            .ilike("name", `%${q}%`)
            .limit(1);
          t1 = t2?.[0] || null;
        }

        if (t1?.id) {
          const { data: links } = await supabase
            .from("product_tags")
            .select("product_id")
            .eq("tag_id", t1.id);

          ids = (links ?? [])
            .map((r: any) => Number(r?.product_id))
            .filter(Number.isFinite);
        }
      }

      if (ids.length === 0) {
        setProducts([]);
        return;
      }

      // ---------- 3) ดึงสินค้าจาก view สาธารณะ ----------
      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .in("id", ids)
        // ใช้ id แทน created_at (บาง view อาจไม่มี)
        .order("id", { ascending: false });

      if (error) throw error;

      const result = (data ?? []) as any[];

      // map ให้เข้ากับ ProductPublic (กัน null ทุกฟิลด์)
      const transformed: ProductPublic[] = result.map((item: any) => ({
        id: Number(item.id),
        name: item.name ?? "",
        selling_price: Number(item.selling_price ?? 0),
        description: item.description ?? "",
        image: item.image ?? null,
        image_url: item.image_url ?? null,
        main_image_url: item.main_image_url ?? null,

        // กันกรณี component เก่าต้องอ่าน category: map จากชื่อที่มีใน view
        // (บางโปรเจคใช้ category_name, บางอันใช้ category)
       category: String(item.category_name ?? item.category ?? "") || "",

        product_status: item.product_status ?? null,
        sku: item.sku ?? null,
        quantity: Number(item.quantity ?? 0),
        shipment_date: item.shipment_date ?? null,
        options: item.options ?? null,
        product_type: item.product_type ?? null,
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null,
        slug: item.slug ?? null,

        // normalize images (view นี้ใช้ "images")
        product_images: Array.isArray(item.images)
          ? item.images
              .filter(Boolean)
              .map((im: any) => ({
                id: Number(im.id ?? 0),
                image_url: im.image_url ?? im.url ?? "",
                order: Number(im.order ?? 0),
              }))
          : [],

        // เผื่อบางที่ใช้ฟิลด์ images ตรงๆ
        images: Array.isArray(item.images)
          ? item.images
              .filter(Boolean)
              .map((im: any) => ({
                id: Number(im.id ?? 0),
                image_url: im.image_url ?? im.url ?? "",
                order: Number(im.order ?? 0),
              }))
          : undefined,
      }));

      setProducts(transformed);
    } catch (err) {
      console.error("[ProductsByTag] error:", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
      setProducts([]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const handleProductClick = (productId: number) => {
    const p = products.find((x) => x.id === productId);
    if (p?.slug) navigate(`/product/${p.slug}`);
    else navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-600 font-medium">กำลังโหลดข้อมูลสินค้า…</p>
        </div>
      </div>
    );
  }

  const tagDisplay = tagQuery || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            สินค้าแท็ก: {tagDisplay}
          </h1>
          <p className="text-gray-600">
            {products.length > 0
              ? `พบสินค้า ${products.length} รายการ`
              : "ไม่พบสินค้าที่มีแท็กนี้"}
          </p>
        </header>

        {products.length > 0 ? (
          <ProductGrid products={products} onProductClick={handleProductClick} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              ไม่พบสินค้าที่มีแท็ก “{tagDisplay}”
            </p>
            <Link
              to="/"
              className="text-purple-600 hover:text-purple-700 underline mt-4 inline-block"
            >
              กลับไปหน้าแรก
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
