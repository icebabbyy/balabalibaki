// ที่อยู่ไฟล์: src/hooks/usePublineOrders.ts (หรือ useOrderSearch.ts)

import { useState, useEffect, useCallback } from 'react';
// แก้ไข: เปลี่ยน Path และเพิ่มนามสกุลไฟล์สำหรับ Deno
import { supabase } from '../integrations/supabase/client.ts'; 

// แก้ไข: สร้าง Interface ใหม่ให้ตรงกับข้อมูลจาก View 'public_order_items'
interface OrderItem {
  order_id: number;
  order_status: string;
  order_created_at: string;
  customer_info: {
    name: string;
    phone?: string;
    address?: string;
    note?: string;
  } | null;
  product_id: number;
  product_name: string;
  sku: string;
}

export const usePublineOrders = () => {
  // เปลี่ยนชื่อ state ให้สื่อความหมายมากขึ้น
  const [allOrderItems, setAllOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // แก้ไข: ดึงข้อมูลจาก View ตัวใหม่ที่ถูกต้อง
      const { data, error } = await supabase
        .from('public_order_items')
        .select('*')
        .order('order_created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setAllOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // แก้ไข: ฟังก์ชันค้นหาให้ตรงกับโครงสร้างข้อมูลใหม่
  const searchOrders = useCallback((searchTerm: string): OrderItem[] => {
    if (!searchTerm.trim()) {
      return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase().trim();
    return allOrderItems.filter(
      (item) => 
        // ค้นหาจากชื่อลูกค้า (ที่อยู่ใน customer_info) และ sku
        (item.customer_info?.name && item.customer_info.name.toLowerCase().includes(lowercasedTerm)) ||
        (item.sku && item.sku.toLowerCase().includes(lowercasedTerm))
    );
  }, [allOrderItems]);

  return { loading, allOrderItems, searchOrders };
};