import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink, User, Hash } from "lucide-react";
import { usePublineOrders } from "@/hooks/usePublineOrders";
import { supabase } from "@/integrations/supabase/client";

// ✨ 1. กำหนด Type ของ Order ให้ชัดเจนขึ้น
interface Order {
  id: number;
  username: string;
  sku: string;
  qty: number;
  price: number;
  deposit: number;
  status: string;
  tracking_number: string | null;
  admin_notes: string | null;
}

const OrderStatus = () => {
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});

  // ✨ 2. ทำให้การเรียกใช้ Hook ปลอดภัยขึ้น
  const { loading, searchOrdersByUsername } = usePublineOrders() || { loading: true, searchOrdersByUsername: () => [] };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('sku, name, image');
      if (error) throw error;
      if (data) {
        const productMap = data.reduce((acc: any, product: any) => {
          if (product.sku) {
            acc[product.sku] = product;
          }
          return acc;
        }, {});
        setProducts(productMap);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = () => {
    // ✨ 3. ตรวจสอบก่อนว่าฟังก์ชันค้นหามีอยู่จริงหรือไม่
    if (username.trim() && typeof searchOrdersByUsername === 'function') {
      const foundOrders = searchOrdersByUsername(username.trim());
      setSearchResults(foundOrders || []); // ป้องกันผลลัพธ์เป็น null
    } else {
      setSearchResults([]);
    }
  };

  const getProductInfo = (sku: string) => {
    const product = products[sku];
    return {
      name: product?.name || 'ไม่พบชื่อสินค้า',
      image: product?.image || '/placeholder.svg' // เปลี่ยนเป็น placeholder กลาง
    };
  };

  // (ฟังก์ชัน getStatusColor, getProgressPercentage ไม่มีการเปลี่ยนแปลง)
  const getStatusColor = (status: string) => { /* ... */ };
  const getProgressPercentage = (status: string, trackingNumber: string | null) => { /* ... */ };

  // แยกคอมโพเนนต์ย่อยเพื่อความสะอาด
  const RenderOrderCard = ({ order }: { order: Order }) => {
    const productInfo = getProductInfo(order.sku);
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" style={{ borderColor: '#956ec3' }}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={productInfo.image} 
                  alt={productInfo.name} 
                  className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate" style={{ color: '#956ec3' }}>
                      {order.username}
                    </h3>
                    <Badge className={`${getStatusColor(order.status)} border text-xs`}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-900 font-medium line-clamp-2 mb-1">
                    {productInfo.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      {order.id}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>รายละเอียดออเดอร์</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* ... รายละเอียดใน Dialog ... */}
             {order.tracking_number && (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="text-sm text-gray-600">หมายเลขพัสดุ</div>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">{order.tracking_number}</div>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    style={{ borderColor: '#956ec3', color: '#956ec3' }}
                    onClick={() => window.open(`https://track.thailandpost.co.th/?trackNumber=${order.tracking_number}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    ติดตามพัสดุ - ไปรษณีย์ไทย
                  </Button>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  const RenderContent = () => {
    if (loading) {
      return (
        <Card><CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
        </CardContent></Card>
      );
    }
    if (searchResults.length > 0) {
      return (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ผลการค้นหา</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((order) => <RenderOrderCard key={order.id} order={order} />)}
          </div>
        </div>
      );
    }
    if (username) { // ค้นหาแล้ว แต่ไม่เจอ
      return (
        <Card className="mb-8"><CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบออเดอร์</h3>
          <p className="text-gray-500">ไม่พบออเดอร์สำหรับชื่อผู้ใช้ "{username}"</p>
        </CardContent></Card>
      );
    }
    // หน้าเริ่มต้น ยังไม่ได้ค้นหา
    return (
      <Card><CardContent className="py-8 text-center">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">ค้นหาออเดอร์ของคุณ</h3>
        <p className="text-gray-500">กรุณากรอกชื่อผู้ใช้ในช่องค้นหาเพื่อดูสถานะออเดอร์ของคุณ</p>
      </CardContent></Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">เช็คสถานะสินค้า</h1>
          <p className="text-gray-600">สำหรับลูกค้า Facebook - ค้นหาด้วยชื่อผู้ใช้</p>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2" style={{ color: '#956ec3' }}>
              <User className="h-5 w-5" />
              <span>ค้นหาด้วยชื่อผู้ใช้</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Input
                type="text"
                placeholder="กรอกชื่อผู้ใช้ เช่น Wishyoulucky..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading} style={{ backgroundColor: '#956ec3' }} className="hover:opacity-90">
                <Search className="h-4 w-4 mr-2" />
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ✨ 4. เรียกใช้คอมโพเนนต์ RenderContent เพื่อแสดงผลตามเงื่อนไข */}
        <RenderContent />
      </div>
    </div>
  );
};

export default OrderStatus;
