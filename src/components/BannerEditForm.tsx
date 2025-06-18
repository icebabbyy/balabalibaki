
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banner } from "@/types/banner";

interface BannerEditFormProps {
  banner: Banner;
  onSave: (banner: Banner) => void;
  onCancel: () => void;
}

const BannerEditForm = ({ banner, onSave, onCancel }: BannerEditFormProps) => {
  const [editingBanner, setEditingBanner] = useState<Banner>(banner);

  const bannerPositions = [
    { value: 1, label: "หน้าแรก - แบนเนอร์หลัก (รูปเดียว)" },
    { value: 2, label: "หน้าแรก - แบนเนอร์ข้าง" },
    { value: 3, label: "หน้าหมวดหมู่ - แบนเนอร์บน" },
    { value: 4, label: "หน้าสินค้า - แบนเนอร์โปรโมชั่น" },
    { value: 5, label: "หน้าแรก - แบนเนอร์ล่าง" }
  ];

  const updateField = (field: string, value: string | number | boolean) => {
    setEditingBanner(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editingBanner);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>แก้ไขแบนเนอร์</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>URL รูปภาพ</Label>
            <Input
              value={editingBanner.image_url}
              onChange={(e) => updateField('image_url', e.target.value)}
            />
            {editingBanner.image_url && (
              <div className="mt-2">
                <img 
                  src={editingBanner.image_url} 
                  alt="Preview" 
                  className="w-48 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>ตำแหน่งแบนเนอร์</Label>
            <Select 
              value={editingBanner.position.toString()} 
              onValueChange={(value) => updateField('position', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bannerPositions.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value.toString()}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={editingBanner.active}
            onCheckedChange={(checked) => updateField('active', checked)}
          />
          <Label>เปิดใช้งาน</Label>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
          >
            บันทึกการเปลี่ยนแปลง
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            ยกเลิก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BannerEditForm;
