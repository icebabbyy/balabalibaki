import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CategoryBanner = {
  id: string;
  category_id: number | null;
  category_name: string | null;
  image_url: string;
  link_url?: string | null;
  active: boolean;
  updated_at?: string;
};

type NewCategoryBanner = Omit<CategoryBanner, "id" | "updated_at">;

export function useCategoryBanners() {
  const [banners, setBanners] = useState<CategoryBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("category_banners")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) setError(error.message);
    else setBanners((data || []) as CategoryBanner[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const addBanner = async (input: NewCategoryBanner) => {
    const { error } = await supabase.from("category_banners").insert([
      {
        ...input,
        category_id: input.category_id ?? null,
        category_name: input.category_name ?? null,
      },
    ]);
    if (error) throw error;
    await fetchBanners();
  };

  const updateBanner = async (id: string, patch: Partial<CategoryBanner>) => {
    const { error } = await supabase
      .from("category_banners")
      .update({
        ...patch,
        category_id:
          patch.category_id === undefined ? undefined : patch.category_id ?? null,
        category_name:
          patch.category_name === undefined ? undefined : patch.category_name ?? null,
      })
      .eq("id", id);
    if (error) throw error;
    await fetchBanners();
  };

  // เผื่ออนาคต (ตอนนี้ UI ไม่โชว์ปุ่มลบ)
  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from("category_banners").delete().eq("id", id);
    if (error) throw error;
    await fetchBanners();
  };

  return { banners, loading, error, fetchBanners, addBanner, updateBanner, deleteBanner };
}
