// src/hooks/useCart.ts
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProductPublic } from "@/types/product";

export const useCart = () => {
  const navigate = useNavigate();

  const addToCart = (product: ProductPublic, quantity = 1, variant: string | null = null) => {
    if (!product) return;

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

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === cartItem.id && item.variant === cartItem.variant
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  return { addToCart };
};
