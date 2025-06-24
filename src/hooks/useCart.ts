// src/hooks/useCart.ts
import { toast } from "sonner";
import { ProductPublic } from "@/types/product";

// Hook นี้จะรับผิดชอบแค่การเพิ่มของลงตะกร้าใน localStorage เท่านั้น
export const useCart = () => {
  const addToCart = (product: ProductPublic, quantity = 1, variant: string | null = null) => {
    if (!product) return;

    // สร้าง item สำหรับใส่ตะกร้า
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      image: product.image,
      quantity: quantity,
      sku: product.sku,
      variant: variant,
      product_type: product.product_type || 'ETC'
    };

    // ดึงตะกร้าเก่าจาก localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // เช็คว่ามีสินค้าชิ้นเดียวกัน (และ variant เดียวกัน) อยู่ในตะกร้าแล้วหรือยัง
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === cartItem.id && item.variant === cartItem.variant
    );

    if (existingItemIndex >= 0) {
      // ถ้ามีแล้ว ให้อัปเดตจำนวน
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
      existingCart.push(cartItem);
    }

    // บันทึกตะกร้าใหม่กลับไปที่ localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  return { addToCart }; // ส่งออกไปแค่ฟังก์ชันเดียว
};
