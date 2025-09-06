import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductExtra = {
  product_slug: string;
  brand: string;
  material: string;
  height_mm?: number | null;
  width_mm?: number | null;
  length_mm?: number | null;
  bonus?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function useProductExtraInfo(slug?: string) {
  const q = useQuery({
    queryKey: ["product-extra", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_extra_info")
        .select("*")
        .eq("product_slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as ProductExtra | null;
    },
  });
  return q;
}

export async function upsertProductExtra(payload: ProductExtra) {
  // บังคับ: brand/material ต้องไม่ว่าง
  if (!payload.brand?.trim() || !payload.material?.trim()) {
    throw new Error("กรุณากรอกแบรนด์และวัสดุให้ครบ");
  }
  const { data, error } = await supabase
    .from("product_extra_info")
    .upsert(payload, { onConflict: "product_slug" }) // มีอยู่แล้วก็อัปเดต
    .select()
    .single();
  if (error) throw error;
  return data as ProductExtra;
}

export async function deleteProductExtra(product_slug: string) {
  const { error } = await supabase
    .from("product_extra_info")
    .delete()
    .eq("product_slug", product_slug);
  if (error) throw error;
}
