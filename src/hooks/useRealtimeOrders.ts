
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeOrder {
  id: number;
  username: string;
  items: any;
  status: string;
  tracking_number: string;
  admin_notes: string;
  deposit: number;
  profit: number;
  total_selling_price: number;
  created_at: string;
  updated_at: string;
  admin_read: boolean;
  notification_sent: boolean;
  payment_slip_url?: string;
  qr_code_generated?: boolean;
  payment_confirmed_at?: string;
}

export const useRealtimeOrders = () => {
  const [orders, setOrders] = useState<RealtimeOrder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      updateUnreadCount(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (ordersList: RealtimeOrder[]) => {
    const unread = ordersList.filter(order => !order.admin_read).length;
    setUnreadCount(unread);
  };

  const markAsRead = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ admin_read: true })
        .eq('id', orderId);

      if (error) {
        console.error('Error marking order as read:', error);
        return false;
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, admin_read: true } : order
      ));
      return true;
    } catch (error) {
      console.error('Error marking order as read:', error);
      return false;
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6a2/PEcSEELIHO8tiJOQcZZ7zn55RPFAhUqOzxtWcaB5Mq9');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Real-time order change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as RealtimeOrder;
            setOrders(prev => [newOrder, ...prev]);
            setUnreadCount(prev => prev + 1);
            playNotificationSound();
            toast.success(`ออเดอร์ใหม่! #${newOrder.id} จาก ${newOrder.username || 'ไม่ระบุ'}`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as RealtimeOrder;
            setOrders(prev => prev.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            ));
            updateUnreadCount([]);
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as RealtimeOrder;
            setOrders(prev => prev.filter(order => order.id !== deletedOrder.id));
            updateUnreadCount([]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    unreadCount,
    loading,
    markAsRead,
    refetch: fetchOrders
  };
};
