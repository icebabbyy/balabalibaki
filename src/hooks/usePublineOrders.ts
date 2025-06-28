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
  const searchOrdersByUsername = useCallback((username: string): PublineOrder[] => {
    if (!username) {
      return [];
    }
    const lowercasedUsername = username.toLowerCase();
    return allOrders.filter(
      (order) => order.username.toLowerCase() === lowercasedUsername
    );
  }, [allOrders]); // ฟังก์ชันนี้จะถูกสร้างใหม่ก็ต่อเมื่อ allOrders เปลี่ยนแปลง

  return { loading, searchOrdersByUsername };
};
