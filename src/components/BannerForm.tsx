
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { NewBannerForm } from "@/types/banner";

interface BannerFormProps {
  onSubmit: (banner: NewBannerForm) => void;
}

const BannerForm = ({ onSubmit }: BannerFormProps) => {
  const [newBanner, setNewBanner] = useState<NewBannerForm>({
    image_url: '',
    position: 1,
    active: true
  });

  const handleSubmit = () => {
    onSubmit(newBanner);
    setNewBanner({
      image_url: '',
      position: 1,
      active: true
    });
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setNewBanner(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>เพิ่มแบนเนอร์ใหม่</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="banner-url">URL รูปภาพ</Label>
            <Input
              id="banner-url"
              placeholder="https://example.com/image.jpg"
              value={newBanner.image_url}
              onChange={(e) => updateField('image_url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-position">ตำแหน่ง</Label>
            <Input
              id="banner-position"
              type="number"
              min="1"
              value={newBanner.position}
              onChange={(e) => updateField('position', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={newBanner.active}
            onCheckedChange={(checked) => updateField('active', checked)}
          />
          <Label>เปิดใช้งาน</Label>
        </div>
        <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
          เพิ่มแบนเนอร์
        </Button>
      </CardContent>
    </Card>
  );
};

export default BannerForm;
