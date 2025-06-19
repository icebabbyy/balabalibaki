
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { NewBannerForm } from "@/types/banner";
import PhotoCopyPaste from "@/components/PhotoCopyPaste";

interface BannerFormProps {
  onSubmit: (banner: NewBannerForm) => void;
}

const BannerForm = ({ onSubmit }: BannerFormProps) => {
  const [newBanner, setNewBanner] = useState<NewBannerForm>({
    image_url: '',
    position: 1,
    active: true
  });

  const bannerPositions = [
    { value: 1, label: "แบนเนอร์หลัก - สไลด์โชว์ด้านบนสุด (หน้าแรก)" },
    { value: 2, label: "แบนเนอร์ที่ 2 - รูปภาพเดี่ยวใต้สินค้ามาใหม่" },
    { value: 3, label: "แบนเนอร์ที่ 3 - รูปภาพเดี่ยวใต้หมวดหมู่" },
    { value: 4, label: "แบนเนอร์ที่ 4 - รูปภาพเดี่ยวด้านล่างสุด" },
  ];

  const handleSubmit = () => {
    if (!newBanner.image_url) {
      alert('กรุณาเลือกรูปภาพ');
      return;
    }
    
    console.log('Submitting banner:', newBanner);
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
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <PhotoCopyPaste
              currentImage={newBanner.image_url}
              onImageChange={(imageUrl) => updateField('image_url', imageUrl)}
              label="รูปภาพแบนเนอร์"
              folder="banners"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-position">ตำแหน่งแบนเนอร์</Label>
            <Select 
              value={newBanner.position.toString()} 
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
