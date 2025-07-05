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

      const formattedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        items: Array.isArray(order.items) ? order.items : [],
        customer_info: {
          ...(order.customer_info || {}),
          email: order.customer_info?.email || order.profiles?.email,
          name: order.customer_info?.name || order.profiles?.username || 'Guest',
        },
        username: order.profiles?.username || order.customer_info?.name || 'Guest',
        tracking_number: order.tracking_number,
        admin_notes: order.admin_notes,
        total_selling_price: order.total_selling_price,
        // เพิ่ม field อื่นๆ ที่อาจจะยังขาดไปตาม Type ของคุณ
        deposit: order.deposit,
        shipping_cost: order.shipping_cost,
        discount: order.discount,
        profit: order.profit,
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
        .update({ 
          tracking_number: trackingNumber, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success("อัปเดตข้อมูล Tracking สำเร็จ");
      // เราจะไม่เรียก fetchOrders() ที่นี่แล้ว
      // แต่จะให้ Dialog เป็นคนสั่งโหลดใหม่ผ่าน onUpdate
      return true;
    } catch (error) {
      console.error('Error updating order tracking:', error);
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
// Note: This hook is designed to manage order data, including fetching, updating status, and tracking information.
// It can be used in components to display and manage orders efficiently.