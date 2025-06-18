
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PublineOrder {
  id: number;
  username: string;
  item_json: string;
  item: string;
  sku: string;
  qty: string;
  price: string;
  deposit: number;
  balance: number;
  status: string;
  tracking_number: string;
  admin_notes: string;
  photo: string;
}

export const usePublineOrders = () => {
  const [orders, setOrders] = useState<PublineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publine_orders')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching publine orders:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching publine orders:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  const searchOrdersByUsername = (username: string) => {
    return orders.filter(order => 
      order.username && order.username.toLowerCase().includes(username.toLowerCase())
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    searchOrdersByUsername,
    refetch: fetchOrders
  };
};
