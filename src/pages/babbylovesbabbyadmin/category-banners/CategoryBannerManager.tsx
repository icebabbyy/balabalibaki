import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCategoryBanners, CategoryBanner } from "@/hooks/useCategoryBanners";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PhotoCopyPaste from "@/components/PhotoCopyPaste";

type SimpleCategory = { id: number; name: string };

// sentinel สำหรับ “ไม่เลือกหมวด”
const NONE = "__none__";

export default function CategoryBannerManager() {
  const { banners, loading, addBanner, updateBanner } = useCategoryBanners();

  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [filterActive, setFilterActive] =
    useState<"all" | "active" | "inactive">("all");

  const [editing, setEditing] = useState<CategoryBanner | null>(null);
  const [draft, setDraft] = useState<{
    image_url: string;
    category_id: number | null;
    category_name: string | null;
    link_url: string | null;
    active: boolean;
  }>({
    image_url: "",
    category_id: null,
    category_name: null,
    link_url: null,
    active: true,
  });

  // โหลด categories (ไว้ให้เลือก id/name)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!error) setCategories((data || []) as SimpleCategory[]);
      else console.error("load categories error:", error);
    })();
  }, []);

  // filter แสดงผล
  const shown = useMemo(() => {
    if (filterActive === "all") return banners;
    return banners.filter((b) => (filterActive === "active" ? b.active : !b.active));
  }, [banners, filterActive]);

  // เริ่มเพิ่มใหม่
  const beginCreate = () => {
    setEditing(null);
    setDraft({
      image_url: "",
      category_id: null,
      category_name: null,
      link_url: null,
      active: true,
    });
  };

  // เริ่มแก้ไข
  const beginEdit = (b: CategoryBanner) => {
    setEditing(b);
    setDraft({
      image_url: b.image_url || "",
      category_id: b.category_id ?? null,
      category_name: b.category_name ?? null,
      link_url: b.link_url ?? null,
      active: !!b.active,
    });
  };

  // บันทึก (เพิ่ม/แก้ไข)
  const handleSave = async () => {
    if (!draft.image_url) {
      alert("กรุณาใส่รูปแบนเนอร์");
      return;
    }

    // ถ้าเลือก category_id แล้วไม่กรอกชื่อ จะเติมให้อัตโนมัติ
    const payload = { ...draft };
    if (payload.category_id && !payload.category_name) {
      const found = categories.find((c) => c.id === payload.category_id);
      payload.category_name = found?.name ?? null;
    }

    if (editing) await updateBanner(editing.id, payload);
    else await addBanner(payload);

    // reset
    setEditing(null);
    setDraft({
      image_url: "",
      category_id: null,
      category_name: null,
      link_url: null,
      active: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category Banners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Label>ตัวกรอง:</Label>
            <Select
              value={filterActive}
              onValueChange={(v: "all" | "active" | "inactive") => setFilterActive(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="เลือกตัวกรอง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="active">เปิดใช้งาน</SelectItem>
                <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button onClick={beginCreate}>+ เพิ่มแบนเนอร์</Button>
          </div>

          {/* List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-10">
                <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-purple-600" />
              </div>
            ) : shown.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">
                ไม่มีแบนเนอร์
              </div>
            ) : (
              shown.map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <div className="aspect-[16/9] bg-gray-100">
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-sm text-gray-600">
                      หมวด:{" "}
                      <span className="font-medium">
                        {b.category_name || "-"}{" "}
                        {b.category_id ? `(id: ${b.category_id})` : ""}
                      </span>
                    </div>
                    {b.link_url ? (
                      <div className="text-xs text-gray-500 break-all">
                        ลิงก์: {b.link_url}
                      </div>
                    ) : null}
                    <div className="text-xs text-gray-500">
                      สถานะ: {b.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={() => beginEdit(b)}>
                        แก้ไข
                      </Button>
                      {/* ไม่มีปุ่มลบ ตาม requirement */}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form เพิ่ม/แก้ไข */}
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "แก้ไขแบนเนอร์" : "เพิ่มแบนเนอร์ใหม่"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>หมวด (เลือกจากตาราง)</Label>
              <Select
                value={draft.category_id ? String(draft.category_id) : NONE}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    category_id: v === NONE ? null : Number(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="ไม่เลือกก็ได้ (จะใช้ชื่อหมวดแทน)" />
                </SelectTrigger>
                <SelectContent>
                  {/* ❗ ห้ามใช้ value="" เด็ดขาด */}
                  <SelectItem value={NONE}>— ไม่เลือก —</SelectItem>
                  {categories
                    .filter((c) => c && c.id != null)
                    .map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} (id: {c.id})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>หรือกรอกชื่อหมวด (อิสระ)</Label>
              <Input
                value={draft.category_name ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, category_name: e.target.value || null }))
                }
                placeholder="เช่น Zenless Zone Zero"
              />
              <div className="text-xs text-gray-500">
                ถ้าเลือก category id แล้วไม่ต้องกรอกชื่อนี้ ระบบจะเติมให้อัตโนมัติ
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>รูปภาพแบนเนอร์</Label>
              <PhotoCopyPaste
                currentImage={draft.image_url}
                onImageChange={(url) =>
                  setDraft((d) => ({ ...d, image_url: url }))
                }
                label="เลือกรูป (หรือลงลิงก์)"
                folder="category-banners"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>ลิงก์ (ถ้ามี)</Label>
              <Input
                value={draft.link_url ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, link_url: e.target.value || null }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <Switch
                checked={draft.active}
                onCheckedChange={(checked) =>
                  setDraft((d) => ({ ...d, active: checked }))
                }
              />
              <Label>เปิดใช้งาน</Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              บันทึก
            </Button>
            {editing ? (
              <Button variant="outline" onClick={beginCreate}>
                ยกเลิกแก้ไข
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
