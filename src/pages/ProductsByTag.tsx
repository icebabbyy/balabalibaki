import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProductGrid from "@/components/categories/ProductGrid";
import type { ProductPublic } from "@/types/product";
import { toast } from "sonner";

/**
 * ดึงสินค้าโดย "ชื่อแท็ก" (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
 * 1) หา tag_id จาก tags
 * 2) หา product_id จาก product_tags
 * 3) ดึงสินค้า: พยายามจาก view public_products ก่อน → ถ้าไม่มี/เออเรอร์ fallback ไปตาราง products
 */
export default function ProductsByTag() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) return;
    fetchProductsByTag(tag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const fetchProductsByTag = async (rawTag: string) => {
    setLoading(true);
    try {
      const q = decodeURIComponent(rawTag).replace(/^#/, "");

      // 1) หา tag_id (exact -> contains)
      let { data: t1, error: e1 } = await supabase
        .from("tags")
        .select("id,name")
        .ilike("name", q)
        .maybeSingle();
      if (e1) console.warn("tags.ilike(exact) error:", e1);

      if (!t1) {
        const { data: t2, error: e1b } = await supabase
          .from("tags")
          .select("id,name")
          .ilike("name", `%${q}%`)
          .limit(1);
        if (e1b) console.warn("tags.ilike(contains) error:", e1b);
        t1 = t2?.[0] || null;
      }

      if (!t1) {
        setProducts([]);
        return;
      }

      // 2) product_id ทั้งหมดที่ติดแท็กนี้
      const { data: links, error: e2 } = await supabase
        .from("product_tags")
        .select("product_id")
        .eq("tag_id", t1.id);

      if (e2) throw e2;

      const ids = (links || []).map((r) => r.product_id);
      if (!ids.length) {
        setProducts([]);
        return;
      }

      // 3) ดึงสินค้า
      let result: any[] = [];

      // ลอง view ก่อน
      const testView = await supabase.from("public_products").select("id").limit(1);
      if (!testView.error) {
        const { data, error } = await supabase
          .from("public_products")
          .select("*")
          .in("id", ids)
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = data || [];
      } else {
        // fallback → ตาราง products (เลือกฟิลด์สำคัญ + รูปใน product_images)
        const { data, error } = await supabase
          .from("products")
          .select(`
            id, name, selling_price, description, image, image_url, main_image_url,
            product_status, sku, quantity, shipment_date, options, product_type,
            created_at, updated_at, slug,
            product_images:product_images ( id, image_url, "order" )
          `)
          .in("id", ids)
          .order("created_at", { ascending: false });

        if (error) throw error;
        result = data || [];
      }

      // map → ProductPublic
      const transformed: ProductPublic[] = result.map((item: any) => ({
        id: item.id,
        name: item.name,
        selling_price: Number(item.selling_price ?? 0),
        description: item.description ?? "",
        image: item.image ?? null,
        image_url: item.image_url ?? null,
        main_image_url: item.main_image_url ?? null,
        product_status: item.product_status ?? null,
        sku: item.sku ?? null,
        quantity: item.quantity ?? 0,
        shipment_date: item.shipment_date ?? null,
        options: item.options ?? null,
        product_type: item.product_type ?? null,
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null,
        slug: item.slug ?? null,
        product_images: Array.isArray(item.product_images)
          ? item.product_images.map((im: any) => ({
              id: im.id ?? 0,
              image_url: im.image_url ?? im.url ?? "",
              order: im.order ?? 0,
            }))
          : [],
        images: Array.isArray(item.images)
          ? item.images.map((im: any) => ({
              id: im.id ?? 0,
              image_url: im.image_url ?? im.url ?? "",
              order: im.order ?? 0,
            }))
          : undefined,
      }));

      setProducts(transformed);
    } catch (err) {
      console.error("[ProductsByTag] error:", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
      setProducts([]);
    } finally {
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

  const tagDisplay = tag ? decodeURIComponent(tag) : "";

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
