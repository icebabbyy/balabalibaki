
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: number;
  username: string;
  items: any;
  status: string;
  tracking_number: string;
  admin_notes: string;
  deposit: number;
  profit: number;
  total_selling_price: number;
  shipping_cost: number;
  discount: number;
  created_at: string;
  updated_at: string;
}

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderTracking = async (orderId: number, trackingNumber: string, adminNotes: string) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order tracking:', error);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        return false;
      }

      toast.success('อัปเดตข้อมูลเรียบร้อยแล้ว');
      await fetchOrders(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error updating order tracking:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        return false;
      }

      toast.success('อัปเดตสถานะเรียบร้อยแล้ว');
      await fetchOrders(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    updating,
    updateOrderTracking,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
