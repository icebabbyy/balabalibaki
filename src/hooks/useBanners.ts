
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Banner, NewBannerForm } from "@/types/banner";

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position');

      if (error) throw error;
      
      // Transform the data to match our Banner interface
      const transformedData: Banner[] = (data || []).map((item: any) => ({
        id: item.id.toString(),
        image_url: item.image_url,
        position: item.position,
        active: item.active,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setBanners(transformedData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดแบนเนอร์');
    } finally {
      setLoading(false);
    }
  };

  const addBanner = async (newBanner: NewBannerForm) => {
    try {
      const { error } = await supabase
        .from('banners')
        .insert([newBanner]);

      if (error) throw error;

      toast.success('เพิ่มแบนเนอร์เรียบร้อยแล้ว');
      fetchBanners();
    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มแบนเนอร์');
    }
  };

  const updateBanner = async (banner: Banner) => {
    try {
      const updateData = {
        image_url: banner.image_url,
        position: banner.position,
        active: banner.active
      };

      const { error } = await supabase
        .from('banners')
        .update(updateData)
        .eq('id', banner.id);

      if (error) throw error;

      toast.success('อัพเดทแบนเนอร์เรียบร้อยแล้ว');
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพเดทแบนเนอร์');
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('คุณต้องการลบแบนเนอร์นี้หรือไม่?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('ลบแบนเนอร์เรียบร้อยแล้ว');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('เกิดข้อผิดพลาดในการลบแบนเนอร์');
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    loading,
    addBanner,
    updateBanner,
    deleteBanner
  };
};
