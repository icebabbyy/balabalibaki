
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useOrderData = () => {
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = () => {
    try {
      const savedOrder = localStorage.getItem('pendingOrder');
      console.log('Loading order data from localStorage:', savedOrder);
      
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        console.log('Parsed order data:', parsedOrder);
        
        // Validate order data structure
        if (!parsedOrder.items || parsedOrder.items.length === 0) {
          console.error('No items in saved order');
          toast.error('ไม่พบข้อมูลคำสั่งซื้อ');
          window.location.href = '/cart';
          return;
        }

        if (!parsedOrder.customerInfo) {
          console.error('No customer info in saved order');
          toast.error('ไม่พบข้อมูลลูกค้า');
          window.location.href = '/cart';
          return;
        }

        if (!parsedOrder.totalPrice || parsedOrder.totalPrice <= 0) {
          console.error('Invalid total price in saved order');
          toast.error('ราคารวมไม่ถูกต้อง');
          window.location.href = '/cart';
          return;
        }
        
        setOrderData(parsedOrder);
      } else {
        console.error('No pending order found in localStorage');
        toast.error('ไม่พบข้อมูลคำสั่งซื้อ กรุณาสั่งซื้อใหม่');
        window.location.href = '/cart';
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ');
      window.location.href = '/cart';
    }
  };

  return { orderData };
};
