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

const OrderStatus = () => {
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  
  // ✨ FIX: กลับมาใช้ searchOrdersByUsername จาก hook เหมือนเดิม
  const { loading, searchOrdersByUsername } = usePublineOrders();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('sku, name, image');
      
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

  // ✨ FIX: ย้อนกลับไปใช้ Logic การค้นหาเดิมของ hook
  const handleSearch = () => {
    if (username.trim()) {
      const foundOrders = searchOrdersByUsername(username.trim());
      setSearchResults(foundOrders);
    } else {
      setSearchResults([]);
    }
  };

  const getProductInfo = (sku: string) => {
    const product = products[sku];
    return {
      name: product?.name || 'ไม่พบชื่อสินค้า',
      image: product?.image || '/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png'
    };
  };

  // ... (ฟังก์ชัน getStatusIcon, getStatusColor, getProgressPercentage ไม่มีการเปลี่ยนแปลง) ...
  const getStatusIcon = (status: string) => { /* ...โค้ดเดิม... */ };
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
           {/* ... (โค้ดใน CardHeader และ CardContent ส่วน Input เหมือนเดิม) ... */}
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ผลการค้นหา</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((order: any, index: number) => {
                const productInfo = getProductInfo(order.sku);
                
                return (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      {/* ... (ส่วน Card ด้านนอกของ Dialog ไม่มีการเปลี่ยนแปลง) ... */}
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* ... (ส่วนแสดงรายละเอียดออเดอร์) ... */}

                        {/* Tracking Info */}
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

        {/* ... (ส่วน No Results, Loading, Instructions เหมือนเดิม) ... */}
      </div>
    </div>
  );
};

export default OrderStatus;
