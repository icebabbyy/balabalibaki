// src/pages/OrderStatus.tsx

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Package, ExternalLink, User, Hash, AlertCircle } from "lucide-react";
import { usePublineOrders } from "@/hooks/usePublineOrders";
import { supabase } from "@/integrations/supabase/client";

const OrderStatus = () => {
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  
  // Hook จะจัดการเรื่อง loading และการค้นหาให้เรา
  const { loading, searchOrdersByUsername } = usePublineOrders();

  useEffect(() => {
    // ฟังก์ชันนี้ไม่มีการเปลี่ยนแปลง
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('sku, name, image');
        if (error) throw error;
        if (data) {
          const productMap = data.reduce((acc: any, product: any) => {
            acc[product.sku] = product;
            return acc;
          }, {});
          setProducts(productMap);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);
  
  const handleSearch = () => {
    // เรียกใช้ฟังก์ชันค้นหาจาก hook โดยตรง
    const foundOrders = searchOrdersByUsername(username);
    setSearchResults(foundOrders);
  };

  const getProductInfo = (sku: string) => { /* ...โค้ดเดิม... */ };
  const getStatusColor = (status: string) => { /* ...โค้ดเดิม... */ };
  const getProgressPercentage = (status: string, trackingNumber: string | null) => { /* ...โค้ดเดิม... */ };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">เช็คสถานะสินค้า</h1>
          <p className="text-gray-600">สำหรับลูกค้า Facebook - ค้นหาด้วยชื่อผู้ใช้</p>
        </div>

        {/* Search Section */}
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
              <Button 
                onClick={handleSearch}
                disabled={loading}
                style={{ backgroundColor: '#956ec3' }}
                className="hover:opacity-90"
              >
                <Search className="h-4 w-4 mr-2" />
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- ส่วนแสดงผลลัพธ์ --- */}
        {/* แสดงเมื่อกำลังโหลดข้อมูลครั้งแรก */}
        {loading && <div className="text-center p-8">กำลังโหลดข้อมูลออเดอร์ทั้งหมด...</div>}

        {/* แสดงเมื่อค้นหาแล้วเจอ */}
        {!loading && searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ผลการค้นหา</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((order, index) => {
                // เพิ่มการตรวจสอบเผื่อข้อมูลผิดพลาด
                if (!order || !order.sku) return null; 
                const productInfo = getProductInfo(order.sku);
                return (
                  <Dialog key={order.id || index}>
                    {/* ... ส่วนของ DialogTrigger และ DialogContent เหมือนเดิม แต่เพิ่มปุ่ม Track & Trace ... */}
                  </Dialog>
                );
              })}
            </div>
          </div>
        )}

        {/* แสดงเมื่อค้นหาแล้วไม่เจอ */}
        {!loading && searchResults.length === 0 && username && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบออเดอร์</h3>
              <p className="text-gray-500">ไม่พบออเดอร์สำหรับชื่อผู้ใช้ "{username}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
