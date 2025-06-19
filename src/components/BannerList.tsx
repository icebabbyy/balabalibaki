
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Banner } from "@/types/banner";

interface BannerListProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
}

const BannerList = ({ banners, onEdit, onDelete }: BannerListProps) => {
  const getPositionLabel = (position: number) => {
    const positions = {
      1: "แบนเนอร์หลัก - สไลด์โชว์ด้านบนสุด (หน้าแรก)",
      2: "แบนเนอร์ที่ 2 - รูปภาพเดี่ยวใต้สินค้ามาใหม่",
      3: "แบนเนอร์ที่ 3 - รูปภาพเดี่ยวใต้หมวดหมู่",
      4: "แบนเนอร์ที่ 4 - รูปภาพเดี่ยวด้านล่างสุด"
    };
    return positions[position as keyof typeof positions] || `ตำแหน่ง ${position}`;
  };

  // เรียงลำดับแบนเนอร์ตามตำแหน่ง
  const sortedBanners = [...banners].sort((a, b) => a.position - b.position);

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการแบนเนอร์</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedBanners.map((banner) => (
            <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={banner.image_url || '/placeholder.svg'}
                  alt="Banner"
                  className="w-24 h-16 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">แบนเนอร์ #{banner.position}</h4>
                  <p className="text-sm text-gray-600">{getPositionLabel(banner.position)}</p>
                  <p className="text-sm text-gray-500">
                    สถานะ: {banner.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(banner)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => onDelete(banner.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BannerList;
