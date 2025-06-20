
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
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const { orders, loading, searchOrdersByUsername } = usePublineOrders();

  // Fetch all products to create SKU mapping
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('sku, name, image');
      
      if (data) {
        const productMap = data.reduce((acc, product) => {
          acc[product.sku] = product;
          return acc;
        }, {});
        setProducts(productMap);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รอชำระเงิน':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ชำระเงินแล้ว':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'กำลังจัดส่ง':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'จัดส่งแล้ว':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ยกเลิก':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอชำระเงิน':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ชำระเงินแล้ว':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'กำลังจัดส่ง':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'จัดส่งแล้ว':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ยกเลิก':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (status, trackingNumber) => {
    if (status === 'จัดส่งแล้ว') return 100;
    if (status === 'กำลังจัดส่ง' && trackingNumber) return 75;
    if (status === 'ชำระเงินแล้ว') return 50;
    if (status === 'รอชำระเงิน') return 25;
    return 0;
  };

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
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={productInfo.image} 
                              alt="Product" 
                              className="w-16 h-16 object-cover rounded-lg"
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
                    
                    {/* Order Detail Modal */}
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Product Info */}
                        <div className="flex space-x-3">
                          <img 
                            src={productInfo.image} 
                            alt="Product" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <Badge className={`text-xs mb-2 ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                            <h3 className="font-semibold text-sm leading-tight">{productInfo.name}</h3>
                            <p className="text-xs text-gray-600 mt-1">{order.username} / {order.qty}</p>
                          </div>
                        </div>

                        {/* Status Progress */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>สถานะการจัดส่ง</span>
                            <span className="text-xs text-gray-500">
                              {getProgressPercentage(order.status, order.tracking_number)}% เสร็จสิ้น
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                backgroundColor: '#956ec3', 
                                width: `${getProgressPercentage(order.status, order.tracking_number)}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">ราคา</span>
                            <p className="font-semibold">฿{order.price}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">SKU</span>
                            <p className="font-semibold">{order.sku}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">จำนวน</span>
                            <p className="font-semibold">{order.qty}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">มัดจำ</span>
                            <p className="font-semibold">฿{order.deposit}</p>
                          </div>
                        </div>

                        {/* Admin Notes */}
                        {order.admin_notes && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-blue-700 mb-1">หมายเหตุจากแอดมิน</div>
                            <p className="text-sm text-blue-800">{order.admin_notes}</p>
                          </div>
                        )}

                        {/* Tracking Info */}
                        {order.tracking_number && (
                          <div className="border rounded-lg p-3">
                            <div className="text-sm text-gray-600 mb-1">หมายเลขติดตาม</div>
                            <div className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                              {order.tracking_number}
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full text-sm"
                              style={{ borderColor: '#956ec3', color: '#956ec3' }}
                              onClick={() => window.open(`https://track.thailandpost.co.th/?trackNumber=${order.tracking_number}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              ติดตามพัสดุ - Thailand Post
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

        {/* No Results Message */}
        {searchResults.length === 0 && username && !loading && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบออเดอร์</h3>
              <p className="text-gray-500">ไม่พบออเดอร์สำหรับชื่อผู้ใช้ "{username}" กรุณาตรวจสอบชื่อและลองใหม่อีกครั้ง</p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
            </CardContent>
          </Card>
        )}

        {/* Instructions when no search */}
        {searchResults.length === 0 && !username && !loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ค้นหาออเดอร์ของคุณ</h3>
              <p className="text-gray-500">กรุณากรอกชื่อผู้ใช้ในช่องค้นหาเพื่อดูสถานะออเดอร์ของคุณ</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
