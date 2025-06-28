// src/pages/OrderHistory.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Eye, EyeOff, Login } from 'lucide-react';

interface Order {
  id: number;
  username: string;
  item_json: string;
  sku: string;
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

const OrderHistoryCard = ({ order, product }: { order: Order, product?: Product }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  // คำนวณราคาสินค้าหลัก = ยอดรวม - ค่าส่ง
  const itemsTotal = order.total_price - (order.shipping_cost || 0);
  const items = JSON.parse(order.item_json || '[]') as { name: string, sku: string, quantity: number, price: number }[];


  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg"># {order.id}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">{order.status || 'ไม่ระบุสถานะ'}</Button>
          <Button variant="ghost" size="sm" onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
            {isDetailsVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isDetailsVisible ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
          </Button>
        </div>
      </div>

      {isDetailsVisible && (
        <>
          <div className="border-b my-4 pb-4 flex justify-between text-sm">
            <div>
              <p>จำนวนสินค้า: {items.length} รายการ</p>
              <p className="text-gray-500">
                <span className="mr-2">🗓️</span>
                {order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'}) : 'ไม่ระบุวันที่'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-purple-700">฿{order.total_price?.toLocaleString()}</p>
              <p className="text-gray-500">รวมค่าจัดส่ง: ฿{order.shipping_cost?.toLocaleString() || '0'}</p>
            </div>
          </div>

          <div className="my-4">
            <h4 className="font-semibold mb-2">รายการสินค้า:</h4>
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img src={product?.image || 'https://via.placeholder.com/64'} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4 bg-gray-100"/>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.quantity} x ฿{item.price?.toLocaleString()}</p>
                  <p className="text-gray-600">฿{(item.quantity * item.price).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="my-4">
            <h4 className="font-semibold mb-2">ที่อยู่จัดส่ง:</h4>
            <div className="bg-gray-50 p-4 rounded-md text-gray-700">
              {order.shipping_address || 'ไม่ระบุ'}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}


const OrderHistory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      // 1. Get User
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser);

      if (currentUser?.email) {
        // 2. Fetch Orders for that user
        const { data: orderData, error: orderError } = await supabase
          .from('publice_orders')
          .select('*')
          .ilike('username', `%${currentUser.email}%`);

        if (orderError) {
          console.error("Error fetching orders:", orderError);
          setLoading(false);
          return;
        }
        setOrders(orderData || []);

        // 3. Get all unique SKUs from orders
        if (orderData && orderData.length > 0) {
          const skus = [...new Set(orderData.flatMap(o => {
            try {
              const items = JSON.parse(o.item_json || '[]');
              return items.map((i: any) => i.sku);
            } catch {
              return [];
            }
          }))].filter(Boolean); // Filter out null/undefined SKUs

          if (skus.length > 0) {
            // 4. Fetch corresponding products
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('sku, name, image')
              .in('sku', skus);

            if (productError) {
              console.error("Error fetching products:", productError);
            } else {
              const productMap = (productData || []).reduce((acc, p) => {
                acc[p.sku] = p;
                return acc;
              }, {} as Record<string, Product>);
              setProducts(productMap);
            }
          }
        }
      }
      setLoading(false);
    };
    fetchAllData();
  }, []);
  
  const RenderContent = () => {
    if (loading) {
      return <div className="text-center p-10"><Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-600"/></div>;
    }
    if (!user) {
      return <Card className="p-8 text-center"><p>กรุณาล็อกอินเพื่อดูประวัติการสั่งซื้อ</p></Card>;
    }
    if (orders.length === 0) {
      return (
        <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4"/>
            <h3 className="text-xl font-bold">ยังไม่มีประวัติการสั่งซื้อ</h3>
            <p className="text-gray-500">ออเดอร์ทั้งหมดของคุณจะแสดงที่นี่</p>
            <Button asChild className="mt-4" style={{backgroundColor: '#956ec3'}}><Link to="/">เลือกซื้อสินค้า</Link></Button>
        </Card>
      );
    }
    return (
      <div className="space-y-6">
        {orders.map(order => (
          <OrderHistoryCard 
            key={order.id} 
            order={order} 
            // หา product ที่ตรงกับ sku แรกใน json เพื่อแสดงรูปภาพหลัก
            product={products[JSON.parse(order.item_json || '[]')[0]?.sku]} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ประวัติการสั่งซื้อ</h1>
          {user && <p className="text-gray-600">{user.email}</p>}
        </div>
        <RenderContent />
      </div>
    </div>
  );
};

export default OrderHistory;
