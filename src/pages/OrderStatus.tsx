
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Package, Truck, CheckCircle } from "lucide-react";

const OrderStatus = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = () => {
    // Mock order data for demonstration
    if (orderNumber) {
      setSearchResult({
        orderNumber: orderNumber,
        status: 'กำลังจัดส่ง',
        items: [
          { name: 'เสื้อยืดคุณภาพพรีเมียม', quantity: 2, price: 599 },
          { name: 'กระเป๋าสะพายหรู', quantity: 1, price: 1299 }
        ],
        total: 2497,
        trackingNumber: 'TH123456789',
        estimatedDelivery: '25 ธ.ค. 2024'
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รอชำระเงิน':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'กำลังจัดส่ง':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'จัดส่งแล้ว':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอชำระเงิน':
        return 'bg-yellow-100 text-yellow-800';
      case 'กำลังจัดส่ง':
        return 'bg-blue-100 text-blue-800';
      case 'จัดส่งแล้ว':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">เช็คสถานะสินค้า</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-purple-800">ค้นหาหมายเลขออเดอร์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Input
                type="text"
                placeholder="กรอกหมายเลขออเดอร์..."
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Search className="h-4 w-4 mr-2" />
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Result */}
        {searchResult && (
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-purple-800">
                  ออเดอร์ #{searchResult.orderNumber}
                </CardTitle>
                <Badge className={getStatusColor(searchResult.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(searchResult.status)}
                    <span>{searchResult.status}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">รายการสินค้า</h4>
                <div className="space-y-2">
                  {searchResult.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">จำนวน: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-purple-600">฿{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-800">ยอดรวม</span>
                <span className="text-xl font-bold text-purple-600">฿{searchResult.total.toLocaleString()}</span>
              </div>

              {/* Tracking Info */}
              {searchResult.trackingNumber && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">หมายเลขติดตาม</p>
                      <p className="text-lg font-semibold text-purple-600">{searchResult.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">กำหนดการจัดส่ง</p>
                      <p className="text-lg font-semibold text-purple-600">{searchResult.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">สถานะการจัดส่ง</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">ได้รับออเดอร์แล้ว</p>
                      <p className="text-sm text-gray-500">23 ธ.ค. 2024, 14:30</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">กำลังเตรียมสินค้า</p>
                      <p className="text-sm text-gray-500">23 ธ.ค. 2024, 16:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">กำลังจัดส่ง</p>
                      <p className="text-sm text-gray-500">24 ธ.ค. 2024, 09:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-400">จัดส่งแล้ว</p>
                      <p className="text-sm text-gray-400">รอการอัพเดท</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg text-purple-800">ต้องการความช่วยเหลือ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              หากคุณมีคำถามเกี่ยวกับออเดอร์ของคุณ สามารถติดต่อเราได้ผ่านทางช่องทางต่อไปนี้
            </p>
            <div className="flex space-x-4">
              <Link to="/qa">
                <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                  คำถามที่พบบ่อย
                </Button>
              </Link>
              <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                ติดต่อเรา
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderStatus;
