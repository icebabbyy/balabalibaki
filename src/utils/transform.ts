// src/utils/transform.ts

import { ProductPublic } from "@/types/product";

export const transformProductData = (item: any): ProductPublic => {
  return {
    id: item.id || 0,
    name: item.name || "",
    selling_price: item.selling_price || 0,
    category: item.category || "",
    description: item.description || "",
    image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์",
    sku: item.sku || "",
    quantity: item.quantity || 0,
    shipment_date: item.shipment_date || "",
    options: item.options || null,
    product_type: item.product_type || "ETC",
    created_at: item.created_at || "",
    updated_at: item.updated_at || "",
    slug: item.slug || String(item.id),
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    // ✅ FIX: แก้ไขให้มองหา `product_images` ที่ถูกต้องจาก View
    product_images: Array.isArray(item.product_images) 
      ? item.product_images.filter(img => img && img.image_url) 
      : [],
  };
};
