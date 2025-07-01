import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order } from '@/types/order';

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // เราจะ map เฉพาะข้อมูลที่จำเป็นต้องใช้ในหน้า Admin
      const formattedOrders: Order[] = (data || []).map((order: any) => ({
  id: order.id,
  created_at: order.created_at,
  status: order.status,
  items: Array.isArray(order.items) ? order.items : [],
  customer_info: {
    ...(order.customer_info || {}),
    email: order.customer_info?.email || order.profiles?.email
  },
  username: order.profiles?.username || order.customer_info?.name || 'Guest',
  tracking_number: order.tracking_number,
  admin_notes: order.admin_notes,
  total_selling_price: order.total_selling_price || 0, // << เพิ่มบรรทัดนี้กลับเข้ามา
}));
      
      setOrders(formattedOrders);

    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error('ไม่สามารถโหลดข้อมูลออเดอร์ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`อัปเดตสถานะเป็น "${newStatus}"`);
      await fetchOrders();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setUpdating(false);
    }
  };

  const updateOrderTracking = async (orderId: number, trackingNumber: string, adminNotes: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber, admin_notes: adminNotes })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success("อัปเดตข้อมูล Tracking สำเร็จ");
      return true;
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดต Tracking");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { 
    orders, 
    loading, 
    updating,
    updateOrderStatus, 
    updateOrderTracking,
    refetch: fetchOrders 
  };
};