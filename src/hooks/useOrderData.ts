
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
      console.log('Loading order data:', savedOrder);
      
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        console.log('Parsed order data:', parsedOrder);
        
        // Validate order data
        if (!parsedOrder.items || parsedOrder.items.length === 0) {
          toast.error('ไม่พบข้อมูลคำสั่งซื้อ');
          window.location.href = '/cart';
          return;
        }
        
        setOrderData(parsedOrder);
      } else {
        toast.error('ไม่พบข้อมูลคำสั่งซื้อ');
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
