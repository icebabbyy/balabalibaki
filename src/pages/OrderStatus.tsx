
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrderStatus = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Mock orders data
  const mockOrders = [
    {
      orderNumber: 'LS001',
      customerName: 'นาย สมชาย ใจดี',
      status: 'รอชำระเงิน',
      items: [
        { name: 'เสื้อยืดคุณภาพพรีเมียม', quantity: 2, price: 599 },
        { name: 'กระเป๋าสะพายหรู', quantity: 1, price: 1299 }
      ],
      total: 2497,
      orderDate: '23 ธ.ค. 2024',
      trackingNumber: null,
      estimatedDelivery: null
    },
    {
      orderNumber: 'LS002',
      customerName: 'นางสาว วรรณา สวยงาม',
      status: 'กำลังจัดส่ง',
      items: [
        { name: 'รองเท้าผ้าใบ', quantity: 1, price: 1599 },
        { name: 'กระเป๋าใส่โทรศัพท์', quantity: 2, price: 299 }
      ],
      total: 2197,
      orderDate: '22 ธ.ค. 2024',
      trackingNumber: 'TH123456789',
      estimatedDelivery: '25 ธ.ค. 2024'
    },
    {
      orderNumber: 'LS003',
      customerName: 'นาย ประเสริฐ รุ่งเรือง',
      status: 'จัดส่งแล้ว',
      items: [
        { name: 'นาฬิกาข้อมือ', quantity: 1, price: 2599 }
      ],
      total: 2599,
      orderDate: '21 ธ.ค. 2024',
      trackingNumber: 'TH987654321',
      estimatedDelivery: '24 ธ.ค. 2024'
    }
  ];

  const handleSearch = () => {
    if (orderNumber) {
      const foundOrder = mockOrders.find(order => 
        order.orderNumber.toLowerCase().includes(orderNumber.toLowerCase())
      );
      setSearchResult(foundOrder || null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รอชำระเงิน':
        return <Clock className="h-4 w-4 text-yellow-500" />;
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
                placeholder="กรอกหมายเลขออเดอร์ เช่น LS001, LS002..."
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg" style={{ color: '#956ec3' }}>
                    ออเดอร์ #{searchResult.orderNumber}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">ลูกค้า: {searchResult.customerName}</p>
                </div>
                <Badge className={`${getStatusColor(searchResult.status)} border`}>
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
                      <p className="font-semibold" style={{ color: '#956ec3' }}>฿{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">วันที่สั่งซื้อ</p>
                    <p className="text-lg font-semibold" style={{ color: '#956ec3' }}>{searchResult.orderDate}</p>
                  </div>
                  {searchResult.trackingNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">หมายเลขติดตาม</p>
                      <p className="text-lg font-semibold" style={{ color: '#956ec3' }}>{searchResult.trackingNumber}</p>
                    </div>
                  )}
                  {searchResult.estimatedDelivery && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">กำหนดการจัดส่ง</p>
                      <p className="text-lg font-semibold" style={{ color: '#956ec3' }}>{searchResult.estimatedDelivery}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-purple-200 mt-4">
                  <span className="text-lg font-semibold text-gray-800">ยอดรวม</span>
                  <span className="text-xl font-bold" style={{ color: '#956ec3' }}>฿{searchResult.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: '#956ec3' }}>รายการออเดอร์ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>หมายเลขออเดอร์</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>วันที่สั่งซื้อ</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การติดตาม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium" style={{ color: '#956ec3' }}>
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell className="font-semibold">฿{order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.trackingNumber ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {order.trackingNumber}
                        </code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderStatus;
