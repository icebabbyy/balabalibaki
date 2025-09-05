import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { CategoryBanner } from "@/types/categoryBanner";

type Props = {
  banners: CategoryBanner[];
  resolveCategoryName: (b: CategoryBanner) => string;
  onEdit: (b: CategoryBanner) => void;
  onDelete: (id: string) => void;
};

export default function CategoryBannerList({
  banners,
  resolveCategoryName,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการแบนเนอร์หมวดหมู่</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {banners.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <img
                src={b.image_url || "/placeholder.svg"}
                className="w-24 h-16 object-cover rounded"
              />
              <div>
                <div className="font-medium">{resolveCategoryName(b)}</div>
                <div className="text-sm text-gray-500">
                  {b.active ? "เปิดใช้งาน" : "ปิดใช้งาน"} | {b.link_url || "—"}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(b)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => onDelete(b.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
