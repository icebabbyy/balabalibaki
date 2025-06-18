
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink, User } from "lucide-react";

const OrderStatus = () => {
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);

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
            statusColor: row[3] === 'ชำระเงินแล้ว' ? 'purple' : 'default'
          }));
          setOrdersData(orders);
        }
      } else {
        console.error('Failed to fetch from Google Sheets');
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
            statusColor: 'purple'
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
          statusColor: 'purple'
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

        {/* Search Results - Flash Cards */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ผลการค้นหา</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((order, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300" style={{ borderColor: '#956ec3' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg" style={{ color: '#956ec3' }}>
                        #{order.orderNumber}
                      </CardTitle>
                      <Badge className={`${getStatusColor(order.status, order.statusColor)} border`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span className="text-xs">{order.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src="/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png" 
                          alt="Product" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Customer Info */}
                      <div>
                        <p className="text-sm text-gray-600">ลูกค้า</p>
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                      </div>
                      
                      {/* Product Name */}
                      <div>
                        <p className="text-sm text-gray-600">สินค้า</p>
                        <p className="font-medium text-gray-800 line-clamp-2">{order.productName}</p>
                      </div>
                      
                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">ราคา</span>
                          <p className="font-semibold" style={{ color: '#956ec3' }}>{order.price}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">จำนวน</span>
                          <p className="font-semibold">{order.quantity}</p>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-purple-700 mb-1">ความคืบหน้า</div>
                        <div className="text-base font-bold text-purple-800">{order.progress}</div>
                      </div>
                      
                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div>
                          <span className="text-xs text-gray-500">เลขติดตาม</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                              {order.trackingNumber}
                            </code>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              ติดตาม
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && username && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบออเดอร์</h3>
              <p className="text-gray-500">ไม่พบออเดอร์สำหรับชื่อผู้ใช้ "{username}" กรุณาตรวจสอบชื่อและลองใหม่อีกครั้ง</p>
            </CardContent>
          </Card>
        )}

        {/* All Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: '#956ec3' }}>รายการออเดอร์ทั้งหมด</CardTitle>
            {loading && <p className="text-sm text-gray-500">กำลังโหลดข้อมูลจาก Google Sheets...</p>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersData.map((order, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold" style={{ color: '#956ec3' }}>
                          #{order.orderNumber}
                        </h3>
                        <Badge className={`${getStatusColor(order.status, order.statusColor)} border`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">ลูกค้า: {order.customerName}</p>
                      <p className="text-sm text-gray-800 mb-2">{order.productName}</p>
                      <div className="text-sm text-gray-500">
                        วันที่: {order.orderDate} | ราคา: {order.price} | จำนวน: {order.quantity}
                      </div>
                      {order.trackingNumber && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Tracking: </span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {order.trackingNumber}
                          </code>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <img 
                        src="/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png" 
                        alt="Product" 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {ordersData.length === 0 && !loading && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีข้อมูลออเดอร์</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderStatus;
