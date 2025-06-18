
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/types/banner";

interface BannerEditFormProps {
  banner: Banner;
  onSave: (banner: Banner) => void;
  onCancel: () => void;
}

const BannerEditForm = ({ banner, onSave, onCancel }: BannerEditFormProps) => {
  const [editingBanner, setEditingBanner] = useState<Banner>(banner);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>URL รูปภาพ</Label>
            <Input
              value={editingBanner.image_url}
              onChange={(e) => updateField('image_url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>ตำแหน่ง</Label>
            <Input
              type="number"
              min="1"
              value={editingBanner.position}
              onChange={(e) => updateField('position', parseInt(e.target.value) || 1)}
            />
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
