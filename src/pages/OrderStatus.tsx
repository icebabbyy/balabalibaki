import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink, User, Calendar, Hash } from "lucide-react";
import { usePublineOrders } from "@/hooks/usePublineOrders";
import { supabase } from "@/integrations/supabase/client";

const OrderStatus = () => {
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // ใช้ any เพื่อความยืดหยุ่น
  const [products, setProducts] = useState<Record<string, any>>({});
  // ✨ FIX 2: ดึง `orders` ทั้งหมดออกมาจาก hook เพื่อใช้ในการ filter เอง
  const { orders, loading } = usePublineOrders();

  // (ส่วน fetchProducts ไม่มีการเปลี่ยนแปลง)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => { /* ...โค้ดเดิม... */ };

  // ✨ FIX 2: แก้ไขฟังก์ชัน handleSearch ให้เปรียบเทียบแบบตรงตัว
  const handleSearch = () => {
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      // ค้นหาแบบ case-insensitive และต้องตรงกันทั้งคำ
      const foundOrders = orders.filter(
        order => order.username.toLowerCase() === trimmedUsername.toLowerCase()
      );
      setSearchResults(foundOrders);
    } else {
      setSearchResults([]);
    }
  };

  const getProductInfo = (sku: string) => { /* ...โค้ดเดิม... */ };
  const getStatusIcon = (status: string) => { /* ...โค้ดเดิม... */ };
  const getStatusColor = (status: string) => { /* ...โค้ดเดิม... */ };
  const getProgressPercentage = (status: string, trackingNumber: string) => { /* ...โค้ดเดิม... */ };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ... (ส่วน Search Section ไม่มีการเปลี่ยนแปลง) ... */}
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ผลการค้นหา</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((order, index) => {
                const productInfo = getProductInfo(order.sku);
                
                return (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" style={{ borderColor: '#956ec3' }}>
                        {/* ... (ส่วน CardContent ด้านนอก ไม่มีการเปลี่ยนแปลง) ... */}
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* ... (ส่วน Product Info, Status Progress, Order Details Grid, Admin Notes ไม่มีการเปลี่ยนแปลง) ... */}

                        {/* ✨ FIX 1: เพิ่มส่วนของ Tracking Info และปุ่ม追跡 */}
                        {order.tracking_number && (
                          <div className="border rounded-lg p-3 space-y-2">
                            <div className="text-sm text-gray-600">หมายเลขพัสดุ</div>
                            <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                              {order.tracking_number}
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full text-sm flex items-center justify-center"
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
              })}
            </div>
          </div>
        )}

        {/* ... (ส่วน No Results Message, Loading, Instructions ไม่มีการเปลี่ยนแปลง) ... */}
      </div>
    </div>
  );
};

export default OrderStatus;
