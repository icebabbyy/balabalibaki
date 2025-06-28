// src/pages/OrderStatus.tsx

import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, AlertCircle, Loader2, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Interface ให้ครอบคลุมทุก field ที่จะแสดงใน Modal
interface Order {
  id: number;
  username: string;
  item: string;
  sku: string | null;
  qty: number;
  price: number | null;
  payment_method: string | null; // รูปแบบชำระเงิน
  status: string;
  tracking_number: string | null;
  // สมมติว่ามี field เหล่านี้เพิ่ม
  amount_transferred: number | null; // จำนวนเงินที่โอน
  outstanding_balance: number | null; // ยอดคงค้าง
  release_date: string | null; // วันจำหน่าย
}

// Helper function แปลง status เป็น %
const getStatusProgress = (status: string): number => {
  const statusMap: { [key: string]: number } = {
    'รอตรวจสอบ': 10,
    'สั่งสินค้าแล้ว': 20,
    'รอโรงงานจัดส่ง': 50,
    'สินค้าถึงไทย': 75,
    'จัดส่งแล้ว': 100,
  };
  return statusMap[status] || 0;
};

const OrderStatus = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('publice_orders')
        .select('*')
        .ilike('username', `%${searchTerm.trim()}%`);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching orders:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const RenderOrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>ออเดอร์ #{order.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold truncate">{order.item}</p>
        <p className="text-sm text-gray-500">{order.username}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 w-full" style={{ backgroundColor: '#956ec3' }}>ดูรายละเอียด</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0">
            <div className="p-6">
              <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold">Order Detail</h2>
                  <DialogTrigger asChild><button><X className="h-5 w-5"/></button></DialogTrigger>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-gray-500">{order.payment_method || 'ชำระเต็มจำนวน'}</p>
                  <p className="font-semibold leading-tight">{order.item}</p>
                  <p className="text-sm text-gray-600">{order.username}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>สถานะการจัดส่ง</span>
                  <span className="font-semibold text-purple-600">{order.status}</span>
                </div>
                <Progress value={getStatusProgress(order.status)} className="w-full" />
                <p className="text-xs text-right mt-1">{getStatusProgress(order.status)}% เสร็จสิ้น</p>
              </div>
            </div>
            
            <div className="bg-purple-100 p-4 text-center">
              <p className="text-sm text-purple-800">วันจำหน่าย</p>
              <p className="font-mono text-xs break-all">{order.release_date || 'N/A'}</p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div><p className="text-gray-500">ราคา</p><p className="font-semibold">฿{order.price?.toLocaleString() || 'N/A'}</p></div>
              <div><p className="text-gray-500">SKU</p><p className="font-semibold">{order.sku || 'N/A'}</p></div>
              <div><p className="text-gray-500">รูปแบบการชำระเงิน</p><p className="font-semibold">{order.payment_method || 'N/A'}</p></div>
              <div><p className="text-gray-500">จำนวน</p><p className="font-semibold">{order.qty}</p></div>
              <div><p className="text-gray-500">จำนวนเงินที่โอน</p><p className="font-semibold">฿{order.amount_transferred?.toLocaleString() || 'N/A'}</p></div>
              <div><p className="text-gray-500">ยอดคงค้าง</p><p className="font-semibold">฿{order.outstanding_balance?.toLocaleString() || 'N/A'}</p></div>
            </div>

            {order.tracking_number && (
              <div className="p-6 border-t">
                <p className="text-gray-500 text-sm">เลขพัสดุ</p>
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mt-1">
                  <p className="font-mono text-sm">{order.tracking_number}</p>
                  <a href={`https://track.thailandpost.co.th/?trackNumber=${order.tracking_number}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                  </a>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">ตรวจสอบสถานะสินค้า อัพเดททุกวัน 23.00น.</h1>
        <p className="text-gray-600 mb-8">ค้นหาด้วย Username</p>
        
        <Card className="mb-8"><CardContent className="p-6">
          <div className="flex gap-4">
            <Input type="text" placeholder="กรอกข้อมูลเพื่อค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch} disabled={isSearching} style={{ backgroundColor: '#956ec3' }}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent></Card>

        {isSearching && <div className="text-center p-10">กำลังค้นหา...</div>}
        {hasSearched && !isSearching && searchResults.length === 0 && <div className="text-center p-10"><AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-2"/><p>ไม่พบข้อมูล</p></div>}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map(order => <RenderOrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
