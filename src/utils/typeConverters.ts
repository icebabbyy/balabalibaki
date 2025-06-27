
import { Json } from "@/integrations/supabase/types";

export const jsonToStringArray = (jsonData: Json | Json[] | null | undefined): string[] => {
  if (!jsonData) return [];
  
  if (Array.isArray(jsonData)) {
    return jsonData.filter((item): item is string => typeof item === 'string');
  }
  
  return [];
};

export const jsonToProductImages = (jsonData: Json | Json[] | null | undefined): Array<{id: number, image_url: string, order: number}> => {
  if (!jsonData) return [];
  
  if (Array.isArray(jsonData)) {
    return jsonData.map((item: any, index: number) => ({
      id: index,
      image_url: typeof item === 'string' ? item : item?.image_url || '',
      order: index
    }));
  }
  
  return [];
};
