// src/types/product.ts

export interface ProductPublic {
  id: number;
  name: string;
  selling_price: number;
  description?: string;
  image?: string;
  image_url?: string;
  main_image_url?: string;
  product_status?: string;
  sku?: string;
  quantity?: number;
  shipment_date?: string | null;
  options?: any[];
  product_type?: string;
  created_at?: string | null;
  updated_at?: string | null;
  slug?: string;

  // tags อาจมาจาก view เป็น string[] หรือ {id, name}[]
  tags?: string[] | { id: number; name: string }[];

  // 👇 field ที่ view public_products อาจส่งมา
  category?: string;
  category_name?: string;

  product_images?: Array<{ id: number; image_url: string; order: number }>;
  images?: Array<{ id: number; image_url: string; order: number }>;

  // 👇 ใช้สำหรับ hover swap
  all_images?: Array<{ id: number; image_url: string; order: number }>;
}
