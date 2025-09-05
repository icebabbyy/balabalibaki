import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhotoCopyPaste from "@/components/PhotoCopyPaste";
import type { CategoryBanner } from "@/types/categoryBanner";

type Props = {
  banner: CategoryBanner;
  categories: { id: number; name: string }[];
  onSave: (b: CategoryBanner) => void;
  onCancel: () => void;
};

export default function CategoryBannerEditForm({
  banner,
  categories,
  onSave,
  onCancel,
}: Props) {
  const [editing, setEditing] = useState<CategoryBanner>(banner);
  const update = (k: keyof CategoryBanner, v: any) =>
    setEditing((prev) => ({ ...prev, [k]: v }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>แก้ไขแบนเนอร์หมวดหมู่</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PhotoCopyPaste
          currentImage={editing.image_url}
          onImageChange={(url) => update("image_url", url)}
          label="รูปภาพแบนเนอร์"
          folder="category-banners"
        />

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>เลือกหมวด (optional)</Label>
            <Select
              value={editing.category_id ? String(editing.category_id) : ""}
              onValueChange={(v) =>
                update("category_id", v ? Number(v) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="-- เลือกหมวดจากรายการ --" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ชื่อหมวด (optional)</Label>
            <input
              className="w-full border rounded px-3 py-2"
              value={editing.category_name ?? ""}
              onChange={(e) => update("category_name", e.target.value)}
              placeholder="เช่น Zenless Zone Zero"
            />
          </div>

          <div className="space-y-2">
            <Label>ลิงก์ (ถ้ามี)</Label>
            <input
              className="w-full border rounded px-3 py-2"
              value={editing.link_url ?? ""}
              onChange={(e) => update("link_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={editing.active}
            onCheckedChange={(c) => update("active", c)}
          />
          <Label>เปิดใช้งาน</Label>
        </div>

        <div className="flex space-x-2">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => onSave(editing)}
          >
            บันทึก
          </Button>
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
