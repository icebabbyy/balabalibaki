import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhotoCopyPaste from "@/components/PhotoCopyPaste";
import type { NewCategoryBannerForm } from "@/types/categoryBanner";

type Props = {
  categories: { id: number; name: string }[];
  onSubmit: (payload: NewCategoryBannerForm) => void;
};

export default function CategoryBannerForm({ categories, onSubmit }: Props) {
  const [form, setForm] = useState<NewCategoryBannerForm>({
    image_url: "",
    category_id: undefined,
    category_name: "",
    link_url: "",
    active: true,
  });
  const update = (k: keyof NewCategoryBannerForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.image_url) return alert("กรุณาเลือกรูปภาพ");
    if (!form.category_id && !form.category_name) return alert("เลือกหมวดหรือพิมพ์ชื่อหมวดอย่างน้อยหนึ่งอย่าง");
    onSubmit(form);
    setForm({ image_url: "", category_id: undefined, category_name: "", link_url: "", active: true });
  };

  return (
    <Card>
      <CardHeader><CardTitle>เพิ่มแบนเนอร์หมวดหมู่</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <PhotoCopyPaste
          currentImage={form.image_url}
          onImageChange={(url) => update("image_url", url)}
          label="รูปภาพแบนเนอร์หมวดหมู่"
          folder="category-banners"
        />

        <div className="space-y-2">
          <Label>เลือกหมวด (optional)</Label>
          <Select value={form.category_id ? String(form.category_id) : ""} onValueChange={(v) => update("category_id", v ? Number(v) : undefined)}>
            <SelectTrigger><SelectValue placeholder="-- เลือกหมวดจากรายการ --" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">หรือพิมพ์ชื่อหมวดเองด้านล่าง</p>
        </div>

        <div className="space-y-2">
          <Label>ชื่อหมวด (optional)</Label>
          <input className="w-full border rounded px-3 py-2" placeholder="เช่น League of Legends"
            value={form.category_name ?? ""} onChange={(e) => update("category_name", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>ลิงก์ (ถ้ามี)</Label>
          <input className="w-full border rounded px-3 py-2" placeholder="https://..."
            value={form.link_url ?? ""} onChange={(e) => update("link_url", e.target.value)} />
        </div>

        <div className="flex items-center space-x-2">
          <Switch checked={form.active} onCheckedChange={(c) => update("active", c)} />
          <Label>เปิดใช้งาน</Label>
        </div>

        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSubmit}>เพิ่มแบนเนอร์หมวดหมู่</Button>
      </CardContent>
    </Card>
  );
}
