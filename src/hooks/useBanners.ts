// src/hooks/useBanners.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Banner = {
  id: string;          // uuid
  image_url: string;
  active: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
};

type NewBanner = {
  image_url: string;
  active?: boolean;
  position?: number;
};

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("position", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("fetch banners error:", error);
    } else {
      setBanners((data || []) as Banner[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

const deleteBanner = async (id: string) => {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) {
    console.error("Banner delete error:", error);
    throw error;
  }
  await fetchAll();
};
  // ⚠️ ปล่อยให้ DB gen UUID เอง และส่งเฉพาะคอลัมน์ที่มีจริงเท่านั้น
  const addBanner = async (payload: NewBanner) => {
    const insertRow = {
      image_url: payload.image_url,
      active: payload.active ?? true,
      position: payload.position ?? 0,
    };

    const { data, error } = await supabase
      .from("banners")
      .insert(insertRow)   // ไม่มี id / ไม่มี link_url / ไม่มี title
      .select()
      .single();

    if (error) {
      console.error("Banner insert error:", error);
      throw error;
    }
    await fetchAll();
    return data as Banner;
  };

  const updateBanner = async (id: string, changes: Partial<Omit<Banner, "id">>) => {
    // ป้องกันการเผลอส่ง id กลับไป
    const { id: _drop, ...safeChanges } = (changes || {}) as any;

    const { data, error } = await supabase
      .from("banners")
      .update(safeChanges)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Banner update error:", error);
      throw error;
    }
    await fetchAll();
    return data as Banner;
  };

return { banners, loading, addBanner, updateBanner, deleteBanner, refetch: fetchAll };
}
