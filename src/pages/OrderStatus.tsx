
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";

const OrderStatus = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Google Sheets API integration
  const SHEET_ID = '1eVQgmf07HGO5x6T0CLXwFrkMLDF5QWPqV1C4TcfZHz4';
  const SHEET_NAME = 'Sheet1';
  const API_KEY = 'AIzaSyBH8-your-api-key'; // User needs to add their API key

  useEffect(() => {
    fetchOrdersFromGoogleSheets();
  }, []);

  const fetchOrdersFromGoogleSheets = async () => {
    try {
      setLoading(true);
      // For demo purposes, using mock data since API key is needed
      const mockSheetData = [
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
      ];
      setOrdersData(mockSheetData);
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
    if (orderNumber) {
      const foundOrder = ordersData.find(order => 
        order.orderNumber.toLowerCase().includes(orderNumber.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(orderNumber.toLowerCase())
      );
      setSearchResult(foundOrder || null);
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
          <p className="text-gray-600">ค้นหาและติดตามสถานะการสั่งซื้อของคุณ</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: '#956ec3' }}>ค้นหาหมายเลขออเดอร์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Input
                type="text"
                placeholder="กรอกหมายเลขออเดอร์ เช่น SPXTH04722225606..."
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
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

        {/* Search Result */}
        {searchResult && (
          <Card className="mb-8" style={{ borderColor: '#956ec3' }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg" style={{ color: '#956ec3' }}>
                      ออเดอร์ #{searchResult.orderNumber}
                    </CardTitle>
                    <Badge className={`${getStatusColor(searchResult.status, searchResult.statusColor)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(searchResult.status)}
                        <span>{searchResult.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-gray-600">ลูกค้า: {searchResult.customerName}</p>
                  <div className="mt-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <div className="text-sm font-medium text-purple-700 mb-1">ความคืบหน้า</div>
                      <div className="text-lg font-bold text-purple-800">{searchResult.progress}</div>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <img 
                    src="/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png" 
                    alt="Product" 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">รายละเอียดสินค้า</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">{searchResult.productName}</h5>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ราคา</span>
                      <p className="font-semibold" style={{ color: '#956ec3' }}>{searchResult.price}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">SKU</span>
                      <p className="font-semibold">{searchResult.sku}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">จำนวน</span>
                      <p className="font-semibold">{searchResult.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ค่าจัดส่ง</span>
                      <p className="font-semibold">{searchResult.shippingCost}</p>
                    </div>
                  </div>

                  {searchResult.trackingNumber && (
                    <div className="mt-4">
                      <span className="text-gray-600 text-sm">เลข</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-white px-3 py-1 rounded border text-sm font-mono">
                          {searchResult.trackingNumber}
                        </code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Link to Track And Trace : Thailand Post
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>วันเวลา: {searchResult.orderDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {searchResult === null && orderNumber && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบออเดอร์</h3>
              <p className="text-gray-500">ไม่พบหมายเลขออเดอร์ที่ค้นหา กรุณาตรวจสอบหมายเลขและลองใหม่อีกครั้ง</p>
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

        {/* Instructions for Google Sheets Integration */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">การตั้งค่า Google Sheets API</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700">
            <p className="mb-2">เพื่อให้ระบบสามารถดึงข้อมูลจาก Google Sheets ได้:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>สร้าง Google Cloud Project และเปิดใช้งาน Google Sheets API</li>
              <li>สร้าง API Key และแทนที่ในโค้ด</li>
              <li>ตั้งค่า Google Sheets ให้เป็น Public หรือแชร์กับ Service Account</li>
              <li>ปรับแต่ง Column mapping ให้ตรงกับข้อมูลใน Sheet</li>
            </ol>
            <p className="mt-2 text-xs">
              ตอนนี้ใช้ข้อมูล Mock สำหรับทดสอบ - กรุณาแทนที่ API_KEY ด้วย API Key จริง
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderStatus;
