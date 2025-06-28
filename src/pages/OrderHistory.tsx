// src/pages/OrderHistory.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Interfaces สำหรับ type-safety
interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

interface ProcessedOrder {
  id: number;
  username: string;
  items: OrderItem[]; // <--- ข้อมูล item ที่ผ่านการแปลงแล้ว
  total_price: number;
  shipping_cost: number;
  shipping_address: string;
  status: string;
  created_at: string;
}

interface Product {
  sku: string;
  name: string;
  image: string;
}

// ============== OrderHistoryCard Component ==============
// ย้าย Card มาเป็น Component ของตัวเองเพื่อความสะอาด
const OrderHistoryCard = ({ order, productsMap }: { order: ProcessedOrder, productsMap: Record<string, Product> }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  return (
    <Card className="p-4 sm:p-6 shadow-sm">
      {/* Header ของ Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h3 className="font-bold text-lg mb-2 sm:mb-0">ออเดอร์ # {order.id}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="cursor-default">{order.status || 'N/A'}</Button>
          <Button variant="ghost" size="sm" onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
            {isDetailsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ส่วนรายละเอียดที่ซ่อน/แสดงได้ */}
      {isDetailsVisible && (
        <div className="mt-4">
          <div className="border-t pt-4 flex justify-between text-sm">
            <div>
              <p>จำนวนสินค้า: {order.items.length} รายการ</p>
              <p className="text-gray-500 mt-1">
                {order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH', { dateStyle: 'long' }) : 'ไม่ระบุวันที่'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-purple-700">฿{order.total_price?.toLocaleString() || 0}</p>
              <p className="text-gray-500">ค่าจัดส่ง: ฿{order.shipping_cost?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">รายการสินค้า:</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.sku} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={productsMap[item.sku]?.image || 'https://via.placeholder.com/64'}
                      alt={productsMap[item.sku]?.name || item.name}
                      className="w-16 h-16 object-cover rounded-md bg-gray-100"
                    />
                    <div>
                      <p className="font-semibold">{productsMap[item.sku]?.name || item.name}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.quantity} x ฿{item.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">ที่อยู่จัดส่ง:</h4>
            <div className="bg-gray-50 p-4 rounded-md text-gray-700 text-sm">
              {order.shipping_address || 'ไม่ระบุ'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};


// ============== OrderHistory Page Component ==============
const OrderHistory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(`Session Error: ${sessionError.message}`);
        
        const currentUser = session?.user;
        setUser(currentUser);

        if (!currentUser?.email) {
          setLoading(false);
          return; // ไม่ต้องทำอะไรต่อถ้าไม่ล็อกอิน
        }

        // 2. Fetch Orders
        const { data: rawOrders, error: orderError } = await supabase
          .from('publice_orders')
          .select('*')
          .ilike('username', `%${currentUser.email}%`);
        
        if (orderError) throw new Error(`Order Fetch Error: ${orderError.message}`);
        if (!rawOrders) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // 3. Process Orders and get all unique SKUs (SAFE ZONE)
        // **จุดสำคัญ: แปลง JSON ที่นี่ที่เดียว ภายใน try-catch**
        const processedOrders: ProcessedOrder[] = [];
        const allSkus = new Set<string>();

        for (const rawOrder of rawOrders) {
          let items: OrderItem[] = [];
          try {
            // ถ้า item_json เป็น null หรือ empty string ให้ใช้ []
            items = JSON.parse(rawOrder.item_json || '[]');
          } catch (e) {
            console.error(`Invalid JSON in order #${rawOrder.id}:`, rawOrder.item_json);
            // ถ้า JSON ผิดพลาด ก็ให้ items เป็น array ว่างๆไปเลย แต่ยังแสดงออเดอร์
          }
          
          processedOrders.push({ ...rawOrder, items });
          items.forEach(item => allSkus.add(item.sku));
        }
        setOrders(processedOrders);
        
        // 4. Fetch corresponding products if there are any SKUs
        if (allSkus.size > 0) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('sku, name, image')
            .in('sku', Array.from(allSkus));

          if (productError) throw new Error(`Product Fetch Error: ${productError.message}`);
          
          if (productData) {
            const productMap = productData.reduce((acc, p) => {
              acc[p.sku] = p;
              return acc;
            }, {} as Record<string, Product>);
            setProductsMap(productMap);
          }
        }
      } catch (e: any) {
        console.error("A critical error occurred:", e);
        setError(e.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);
  
  // ============== Render Logic ==============
  const RenderContent = () => {
    if (loading) {
      return <div className="text-center p-10"><Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-600"/></div>;
    }
    if (error) {
       return (
        <Card className="p-8 text-center bg-red-50 text-red-700">
            <AlertCircle className="h-12 w-12 mx-auto mb-4"/>
            <h3 className="text-xl font-bold">เกิดข้อผิดพลาด</h3>
            <p className="text-sm mt-2">{error}</p>
        </Card>
      );
    }
    if (!user) {
      return (
        <Card className="p-8 text-center">
          <p>กรุณาล็อกอินเพื่อดูประวัติการสั่งซื้อ</p>
          <Button asChild className="mt-4" style={{backgroundColor: '#956ec3'}}><Link to="/auth">ไปที่หน้าล็อกอิน</Link></Button>
        </Card>
      );
    }
    if (orders.length === 0) {
      return (
        <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4"/>
            <h3 className="text-xl font-bold">ยังไม่มีประวัติการสั่งซื้อ</h3>
            <p className="text-gray-500">ออเดอร์ทั้งหมดของคุณจะแสดงที่นี่</p>
        </Card>
      );
    }
    return (
      <div className="space-y-6">
        {orders.map(order => (
          <OrderHistoryCard key={order.id} order={order} productsMap={productsMap} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ประวัติการสั่งซื้อ</h1>
          {user && <p className="text-gray-600">{user.email}</p>}
        </div>
        <RenderContent />
      </main>
    </div>
  );
};

export default OrderHistory;
