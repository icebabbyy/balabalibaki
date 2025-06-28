// src/utils/transform.ts

import { ProductPublic } from "@/types/product";

export const transformProductData = (item: any): ProductPublic => {
  const tagsArray: string[] = item.tags && Array.isArray(item.tags) 
    ? item.tags.filter(Boolean) 
    : [];

  // ✨ แก้ไขให้มองหา product_images ที่ถูกต้อง
  const productImages: Array<{ id: number; image_url: string; order: number }> = [];
  if (item.product_images && Array.isArray(item.product_images)) {
    item.product_images.forEach((img: any) => {
      if (img && typeof img === 'object' && img.image_url) {
        productImages.push({
          id: Number(img.id) || 0,
          image_url: String(img.image_url),
          order: Number(img.order) || 0
        });
      }
    });
  }

  return {
    id: Number(item.id) || 0,
    name: String(item.name) || '',
    selling_price: Number(item.selling_price) || 0,
    category: String(item.category) || '',
    description: String(item.description) || '',
    image: String(item.image) || '',
    product_status: String(item.product_status) || 'พรีออเดอร์',
    sku: String(item.sku) || '',
    quantity: Number(item.quantity) || 0,
    shipment_date: String(item.shipment_date) || '',
    options: item.options || null,
    product_type: String(item.product_type) || 'ETC',
    created_at: String(item.created_at) || '',
    updated_at: String(item.updated_at) || '',
    slug: String(item.slug) || String(item.id),
    tags: tagsArray,
    product_images: productImages
  };
};
