
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Banner {
  "id BIGSERIAL": string;
  image_url: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string | null;
}

interface NewBannerForm {
  image_url: string;
  position: number;
  active: boolean;
}

const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [newBanner, setNewBanner] = useState<NewBannerForm>({
    image_url: '',
    position: 1,
    active: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดแบนเนอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async () => {
    try {
      const { error } = await supabase
        .from('banners')
        .insert([newBanner]);

      if (error) throw error;

      toast.success('เพิ่มแบนเนอร์เรียบร้อยแล้ว');
      setNewBanner({
        image_url: '',
        position: 1,
        active: true
      });
      fetchBanners();
    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มแบนเนอร์');
    }
  };

  const handleUpdateBanner = async (banner: Banner) => {
    try {
      const updateData = {
        image_url: banner.image_url,
        position: banner.position,
        active: banner.active
      };

      const { error } = await supabase
        .from('banners')
        .update(updateData)
        .eq('"id BIGSERIAL"', banner["id BIGSERIAL"]);

      if (error) throw error;

      toast.success('อัพเดทแบนเนอร์เรียบร้อยแล้ว');
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพเดทแบนเนอร์');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('คุณต้องการลบแบนเนอร์นี้หรือไม่?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('"id BIGSERIAL"', id);

      if (error) throw error;

      toast.success('ลบแบนเนอร์เรียบร้อยแล้ว');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('เกิดข้อผิดพลาดในการลบแบนเนอร์');
    }
  };

  const updateNewBanner = (field: keyof NewBannerForm, value: string | number | boolean) => {
    setNewBanner(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateEditingBanner = (field: keyof Banner, value: string | number | boolean) => {
    if (!editingBanner) return;
    
    setEditingBanner(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Banner */}
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
                onChange={(e) => updateNewBanner('image_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-position">ตำแหน่ง</Label>
              <Input
                id="banner-position"
                type="number"
                min="1"
                value={newBanner.position}
                onChange={(e) => updateNewBanner('position', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newBanner.active}
              onCheckedChange={(checked) => updateNewBanner('active', checked)}
            />
            <Label>เปิดใช้งาน</Label>
          </div>
          <Button onClick={handleAddBanner} className="bg-purple-600 hover:bg-purple-700">
            เพิ่มแบนเนอร์
          </Button>
        </CardContent>
      </Card>

      {/* Banner List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการแบนเนอร์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner["id BIGSERIAL"]} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={banner.image_url || '/placeholder.svg'}
                    alt="Banner"
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">แบนเนอร์ #{banner["id BIGSERIAL"]}</h4>
                    <p className="text-sm text-gray-500">ตำแหน่ง: {banner.position}</p>
                    <p className="text-sm text-gray-500">
                      สถานะ: {banner.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBanner(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDeleteBanner(banner["id BIGSERIAL"])}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Banner Modal */}
      {editingBanner && (
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
                  onChange={(e) => updateEditingBanner('image_url', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>ตำแหน่ง</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingBanner.position}
                  onChange={(e) => updateEditingBanner('position', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingBanner.active}
                onCheckedChange={(checked) => updateEditingBanner('active', checked)}
              />
              <Label>เปิดใช้งาน</Label>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleUpdateBanner(editingBanner)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingBanner(null)}
              >
                ยกเลิก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BannerManager;
