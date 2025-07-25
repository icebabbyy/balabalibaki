// src/hooks/usePublineOrders.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// กำหนด type ของ order ที่ดึงมาจาก publine_orders
interface PublineOrder {
  id: number;
  username: string;
  sku: string;
  qty: number;
  price: number;
  deposit: number;
  status: string;
  tracking_number: string | null;
  admin_notes: string | null;
  // เพิ่ม field อื่นๆ ตามตารางของคุณ
}

export const usePublineOrders = () => {
  const [allOrders, setAllOrders] = useState<PublineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('publine_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        setAllOrders(data || []);
      } catch (error) {
        console.error('Error fetching publine orders:', error);
        // ในกรณีที่เกิด error, ควรจะแสดง toast หรือ message บอก user
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  // สร้างฟังก์ชันสำหรับค้นหาแบบ Exact Match (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
const searchOrders = useCallback((searchTerm: string): PublineOrder[] => {
  if (!searchTerm) {
    return [];
  }
  const lowercasedTerm = searchTerm.toLowerCase().trim();
  return allOrders.filter(
    (order) => 
      (order.customer_name && order.customer_name.toLowerCase().includes(lowercasedTerm)) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(lowercasedTerm))
  );
}, [allOrders]);
  return { loading, searchOrders };
};
