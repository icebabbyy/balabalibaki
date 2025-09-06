import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  useProductExtraInfo,
  upsertProductExtra,
  deleteProductExtra,
  type ProductExtra,
} from "@/hooks/useProductExtraInfo";

type Prod = { id: number | string; name: string; slug: string; active?: boolean };

const NONE = "__none__";

export default function ProductExtraInfoAdmin() {
  // ----- โหลดรายการสินค้ามาให้เลือก -----
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products-for-extra"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, active")
        .order("updated_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Prod[];
    },
  });

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 100);
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q)
    );
  }, [products, search]);

  // ----- เลือกสินค้า -----
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const extraQ = useProductExtraInfo(selectedSlug || undefined);

  // ----- ฟอร์มข้อมูลเสริม -----
  const [form, setForm] = useState<ProductExtra>({
    product_slug: "",
    brand: "",
    material: "",
    height_mm: null,
    width_mm: null,
    length_mm: null,
    bonus: "",
  });

  // sync ฟอร์มเมื่อเปลี่ยนสินค้า/โหลดข้อมูลเสริมเสร็จ
  useEffect(() => {
    if (!selectedSlug) {
      setForm({
        product_slug: "",
        brand: "",
        material: "",
        height_mm: null,
        width_mm: null,
        length_mm: null,
        bonus: "",
      });
      return;
    }
    if (extraQ.data) {
      setForm({
        product_slug: selectedSlug,
        brand: extraQ.data.brand ?? "",
        material: extraQ.data.material ?? "",
        height_mm: extraQ.data.height_mm ?? null,
        width_mm: extraQ.data.width_mm ?? null,
        length_mm: extraQ.data.length_mm ?? null,
        bonus: extraQ.data.bonus ?? "",
      });
    } else {
      setForm({
        product_slug: selectedSlug,
        brand: "",
        material: "",
        height_mm: null,
        width_mm: null,
        length_mm: null,
        bonus: "",
      });
    }
  }, [selectedSlug, extraQ.data]);

  // helper: อัปเดตฟิลด์
  const setField = <K extends keyof ProductExtra>(key: K, value: ProductExtra[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // validate: บังคับแบรนด์/วัสดุ
  const canSave = selectedSlug && form.brand.trim() && form.material.trim();

  // บันทึก (upsert)
  const handleSave = async () => {
    if (!selectedSlug) return toast.error("กรุณาเลือกสินค้า");
    if (!form.brand.trim() || !form.material.trim()) {
      return toast.error("กรุณากรอก แบรนด์ และ วัสดุ ให้ครบ");
    }
    try {
      await upsertProductExtra({
        product_slug: selectedSlug,
        brand: form.brand.trim(),
        material: form.material.trim(),
        height_mm: form.height_mm ? Number(form.height_mm) : null,
        width_mm: form.width_mm ? Number(form.width_mm) : null,
        length_mm: form.length_mm ? Number(form.length_mm) : null,
        bonus: form.bonus?.trim() ? form.bonus.trim() : null,
      });
      toast.success("บันทึกข้อมูลเสริมสำเร็จ");
      await extraQ.refetch?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "บันทึกล้มเหลว");
    }
  };

  // ลบ
  const handleDelete = async () => {
    if (!selectedSlug) return;
    if (!confirm("ลบข้อมูลเสริมของสินค้านี้?")) return;
    try {
      await deleteProductExtra(selectedSlug);
      toast.success("ลบสำเร็จ");
      await extraQ.refetch?.();
      // เคลียร์ฟอร์ม
      setForm({
        product_slug: selectedSlug,
        brand: "",
        material: "",
        height_mm: null,
        width_mm: null,
        length_mm: null,
        bonus: "",
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Extra Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* เลือกสินค้า */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ค้นหาสินค้า</Label>
              <Input
                placeholder="พิมพ์ชื่อหรือ slug"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>เลือกสินค้า</Label>
              <Select
                value={selectedSlug || NONE}
                onValueChange={(v) => setSelectedSlug(v === NONE ? "" : v)}
                disabled={loadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสินค้า" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value={NONE}>— เลือกสินค้า —</SelectItem>
                  {filtered.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>
                      {p.name} ({p.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ฟอร์มรายละเอียด */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label className="after:content-['*'] after:text-red-500 after:ml-1">แบรนด์</Label>
              <Input
                value={form.brand}
                onChange={(e) => setField("brand", e.target.value)}
                placeholder="เช่น Banpresto"
              />
            </div>

            <div className="space-y-2">
              <Label className="after:content-['*'] after:text-red-500 after:ml-1">วัสดุ</Label>
              <Input
                value={form.material}
                onChange={(e) => setField("material", e.target.value)}
                placeholder="เช่น PVC + ABS"
              />
            </div>

            <div className="space-y-2">
              <Label>สูง (mm)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={form.height_mm ?? ""}
                onChange={(e) =>
                  setField("height_mm", e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder="เช่น 180"
              />
            </div>

            <div className="space-y-2">
              <Label>กว้าง (mm)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={form.width_mm ?? ""}
                onChange={(e) =>
                  setField("width_mm", e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder="เช่น 90"
              />
            </div>

            <div className="space-y-2">
              <Label>ยาว (mm)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={form.length_mm ?? ""}
                onChange={(e) =>
                  setField("length_mm", e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder="เช่น 120"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>ของแถม / Bonus</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={form.bonus ?? ""}
                onChange={(e) => setField("bonus", e.target.value)}
                placeholder="เช่น โปสการ์ดพิเศษ 1 ใบ"
              />
            </div>
          </div>

          {/* ปุ่มแอ็กชัน */}
          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={!canSave} className="bg-purple-600 hover:bg-purple-700">
              บันทึก
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setForm({
                  product_slug: selectedSlug,
                  brand: "",
                  material: "",
                  height_mm: null,
                  width_mm: null,
                  length_mm: null,
                  bonus: "",
                })
              }
              disabled={!selectedSlug}
            >
              ล้างฟอร์ม
            </Button>
            <div className="flex-1" />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!selectedSlug || !extraQ.data}
            >
              ลบข้อมูลของสินค้านี้
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
