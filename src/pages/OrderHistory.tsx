// src/pages/OrderHistory.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, LogIn } from 'lucide-react';

// เราจะใช้ Type ของ Order ที่เคยสร้างไว้ใน usePublineOrders
// หรือจะประกาศใหม่ที่นี่ก็ได้ครับ
interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
  items: { sku: string, name: string, quantity: number, price: number }[];
}

const OrderHistory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      setLoading(true);

      // 1. เช็คว่ามี user ล็อกอินอยู่หรือไม่
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser ?? null);

      if (currentUser) {
        // 2. ถ้ามี user, ให้ดึงออเดอร์เฉพาะของ user คนนั้น
        try {
          // ✨ สมมติว่าตาราง orders ของคุณมีคอลัมน์ user_id ที่ตรงกับ auth.users.id
          const { data, error } = await supabase
            .from('orders') 
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setOrders(data || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
      
      setLoading(false);
    };

    fetchUserAndOrders();
  }, []);

  const getStatusColor = (status: string) => {
    // ... ฟังก์ชัน getStatusColor เดิม ...
    switch (status) {
      case 'รอตรวจสอบ': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ชำระเงินแล้ว': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'กำลังจัดส่ง': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'จัดส่งแล้ว': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const RenderContent = () => {
    if (loading) {
      return <div className="text-center p-10">กำลังโหลด...</div>;
    }
    
    // ถ้าไม่มี user ล็อกอิน
    if (!user) {
      return (
        <Card className="text-center p-8">
          <LogIn className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold">กรุณาล็อกอิน</h3>
          <p className="text-gray-500 mb-4">คุณต้องเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>
          <Button asChild style={{ backgroundColor: '#956ec3' }}>
            <Link to="/auth">ไปที่หน้าล็อกอิน</Link>
          </Button>
        </Card>
      );
    }
    
    // ถ้าล็อกอินแล้ว แต่ไม่มีออเดอร์
    if (orders.length === 0) {
      return (
        <Card className="text-center p-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold">ยังไม่มีประวัติการสั่งซื้อ</h3>
          <p className="text-gray-500 mb-4">ออเดอร์ทั้งหมดของคุณจะแสดงที่นี่</p>
          <Button asChild style={{ backgroundColor: '#956ec3' }}>
            <Link to="/">เลือกซื้อสินค้า</Link>
          </Button>
        </Card>
      );
    }

    // ถ้าล็อกอินและมีออเดอร์
    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">ออเดอร์ #{order.id}</CardTitle>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">
                วันที่สั่งซื้อ: {new Date(order.created_at).toLocaleDateString('th-TH')}
              </p>
              <p className="font-semibold mb-2">
                ยอดรวม: ฿{order.total_price.toLocaleString()}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/order-details/${order.id}`}>ดูรายละเอียด</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">ประวัติการสั่งซื้อ</h1>
        <RenderContent />
      </div>
    </div>
  );
};

export default OrderHistory;
