
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink, User, Calendar, Hash, ShoppingBag } from "lucide-react";

const OrderStatus = () => {
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Google Sheets API integration
  const SHEET_ID = '1eVQgmf07HGO5x6T0CLXwFrkMLDF5QWPqV1C4TcfZHz4';
  const SHEET_NAME = 'Sheet1';
  const API_KEY = 'AIzaSyDvv1tcIlOg5zKozoO2M_TYi-Bpaji1DSw';

  useEffect(() => {
    fetchOrdersFromGoogleSheets();
  }, []);

  const fetchOrdersFromGoogleSheets = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const rows = data.values;
        
        if (rows && rows.length > 1) {
          // Skip header row and map data
          const orders = rows.slice(1).map((row, index) => ({
            orderNumber: row[0] || `ORDER-${index + 1}`,
            customerName: row[1] || 'ไม่ระบุ',
            productName: row[2] || 'ไม่ระบุสินค้า',
            status: row[3] || 'รอชำระเงิน',
            price: row[4] || '฿0',
            sku: row[5] || '-',
            quantity: row[6] || '1',
            shippingCost: row[7] || '฿0',
            trackingNumber: row[8] || '',
            orderDate: row[9] || 'today',
            progress: row[10] || '0% เสร็จสิ้น',
            statusColor: row[3] === 'ชำระเงินแล้ว' ? 'purple' : 'default',
            productImage: '/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png'
          }));
          setOrdersData(orders);
        }
      } else {
        console.error('Failed to fetch from Google Sheets');
        // Fallback to mock data for demo
        setOrdersData([
          {
            orderNumber: 'SPXTH04722225606',
            customerName: 'Wishyoulucky',
            productName: 'Infinity Studio - Gwen Statue Limited Edition หารเสื้อ 3 ตัว Zoe:S 💜 กล่องสุ่มฟิวโร่ Kuromi The Witch\'s Feast (ยกบ๊อก 8ลิม) Sanrio TOPTOY 💜',
            status: 'ชำระเงินแล้ว',
            price: '฿1',
            sku: '1',
            quantity: '1',
            shippingCost: '฿0',
            trackingNumber: 'SPXTH04722225606',
            orderDate: 'today',
            progress: '0% เสร็จสิ้น',
            statusColor: 'purple',
            productImage: '/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      // Fallback to mock data
      setOrdersData([
        {
          orderNumber: 'SPXTH04722225606',
          customerName: 'Wishyoulucky',
          productName: 'Infinity Studio - Gwen Statue Limited Edition หารเสื้อ 3 ตัว Zoe:S 💜 กล่องสุ่มฟิวโร่ Kuromi The Witch\'s Feast (ยกบ๊อก 8ลิม) Sanrio TOPTOY 💜',
          status: 'ชำระเงินแล้ว',
          price: '฿1',
          sku: '1',
          quantity: '1',
          shippingCost: '฿0',
          trackingNumber: 'SPXTH04722225606',
          orderDate: 'today',
          progress: '0% เสร็จสิ้น',
          statusColor: 'purple',
          productImage: '/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (username.trim()) {
      const foundOrders = ordersData.filter(order => 
        order.customerName.toLowerCase().includes(username.toLowerCase())
      );
      setSearchResults(foundOrders);
    } else {
      setSearchResults([]);
    }
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

  const getStatusColor = (status, statusColor) => {
    if (statusColor === 'purple') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    
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

  const getProgressPercentage = (progress) => {
    const match = progress.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
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

        {/* Search Results - Small Cards */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ผลการค้นหา</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((order, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" style={{ borderColor: '#956ec3' }}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={order.productImage} 
                            alt="Product" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm truncate" style={{ color: '#956ec3' }}>
                                {order.customerName}
                              </h3>
                              <Badge className={`${getStatusColor(order.status, order.statusColor)} border text-xs`}>
                                ชำระแล้ว
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{order.productName}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {order.orderNumber}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {order.orderDate}
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
                      <DialogTitle>Order Detail</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Product Info */}
                      <div className="flex space-x-3">
                        <img 
                          src={order.productImage} 
                          alt="Product" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <Badge className="text-xs mb-2" style={{ backgroundColor: '#956ec3', color: 'white' }}>
                            ชำระสำเร็จแล้ว
                          </Badge>
                          <h3 className="font-semibold text-sm leading-tight">{order.productName}</h3>
                          <p className="text-xs text-gray-600 mt-1">{order.customerName} / {order.quantity}</p>
                        </div>
                      </div>

                      {/* Status Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>สถานะการจัดส่ง</span>
                          <span className="text-xs text-gray-500">{getProgressPercentage(order.progress)}% เสร็จสิ้น</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              backgroundColor: '#956ec3', 
                              width: `${getProgressPercentage(order.progress)}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Shipping Status */}
                      <div className="bg-purple-100 rounded-lg p-3">
                        <div className="text-sm font-medium text-purple-700">ขนส่งโดย</div>
                        <div className="text-lg font-bold text-purple-800">N/A</div>
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">ราคา</span>
                          <p className="font-semibold">{order.price}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">SKU</span>
                          <p className="font-semibold">{order.sku}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">รูปแบบการจัดส่ง</span>
                          <p className="font-semibold">N/A</p>
                        </div>
                        <div>
                          <span className="text-gray-600">จำนวน</span>
                          <p className="font-semibold">{order.quantity}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">จำนวนเงินที่โอน</span>
                          <p className="font-semibold">฿N/A</p>
                        </div>
                        <div>
                          <span className="text-gray-600">ยอดรวมค่าส่ง</span>
                          <p className="font-semibold">฿0</p>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {order.trackingNumber && (
                        <div className="border rounded-lg p-3">
                          <div className="text-sm text-gray-600 mb-1">เลขที่</div>
                          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                            {order.trackingNumber}
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full mt-2 text-sm"
                            style={{ borderColor: '#956ec3', color: '#956ec3' }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Link to Track And Trace : Thailand Post
                          </Button>
                        </div>
                      )}

                      {/* Order Date */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>วันที่สั่ง</span>
                        <span className="ml-auto">{order.orderDate}</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchResults.length === 0 && username && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบออเดอร์</h3>
              <p className="text-gray-500">ไม่พบออเดอร์สำหรับชื่อผู้ใช้ "{username}" กรุณาตรวจสอบชื่อและลองใหม่อีกครั้ง</p>
            </CardContent>
          </Card>
        )}

        {/* Instructions when no search */}
        {searchResults.length === 0 && !username && (
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
