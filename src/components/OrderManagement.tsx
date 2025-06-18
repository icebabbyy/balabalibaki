
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Edit, Check, X, Calculator } from "lucide-react";

const OrderManagement = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: "ORD-001",
      customer: "น้องแนท",
      product: "Kuromi Limited Edition",
      quantity: 1,
      originalPrice: 1500,
      discount: 0,
      shippingCost: 0,
      totalPrice: 1500,
      status: "รอการอนุมัติ",
      paymentStatus: "รอชำระเงิน",
      notes: ""
    },
    {
      id: 2,
      orderNumber: "ORD-002", 
      customer: "คุณสมใจ",
      product: "Gwen Statue Collection",
      quantity: 2,
      originalPrice: 3000,
      discount: 300,
      shippingCost: 100,
      totalPrice: 2800,
      status: "รอการอนุมัติ",
      paymentStatus: "รอชำระเงิน",
      notes: "ขอส่วนลด 10%"
    }
  ]);

  const [editingOrder, setEditingOrder] = useState(null);
  const [shippingRates] = useState({
    "กรุงเทพ": 50,
    "ปริมณฑล": 80,
    "ต่างจังหวัด": 120
  });

  const handleEditOrder = (order) => {
    setEditingOrder({...order});
  };

  const calculateShipping = (province) => {
    return shippingRates[province] || 100;
  };

  const updateOrderPrice = (field, value) => {
    if (!editingOrder) return;
    
    const updated = { ...editingOrder, [field]: parseFloat(value) || 0 };
    
    // คำนวณราคาใหม่
    const subtotal = updated.originalPrice - updated.discount;
    updated.totalPrice = subtotal + updated.shippingCost;
    
    setEditingOrder(updated);
  };

  const saveOrder = () => {
    setOrders(orders.map(order => 
      order.id === editingOrder.id ? editingOrder : order
    ));
    setEditingOrder(null);
  };

  const approveOrder = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: "อนุมัติแล้ว", paymentStatus: "รอการโอนเงิน" }
        : order
    ));
  };

  const rejectOrder = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: "ปฏิเสธ", paymentStatus: "ยกเลิก" }
        : order
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอการอนุมัติ':
        return 'bg-yellow-100 text-yellow-800';
      case 'อนุมัติแล้ว':
        return 'bg-green-100 text-green-800';
      case 'ปฏิเสธ':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#956ec3' }}>จัดการออเดอร์</h2>
        <Badge variant="secondary" className="px-3 py-1">
          {orders.filter(o => o.status === 'รอการอนุมัติ').length} รายการรอพิจารณา
        </Badge>
      </div>

      {/* Shipping Rate Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">อัตราค่าจัดส่ง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(shippingRates).map(([province, rate]) => (
              <div key={province} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{province}</p>
                <p className="text-lg font-bold" style={{ color: '#956ec3' }}>฿{rate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ลูกค้า:</span>
                      <p className="font-medium">{order.customer}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">สินค้า:</span>
                      <p className="font-medium">{order.product}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">จำนวน:</span>
                      <p className="font-medium">{order.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ราคารวม:</span>
                      <p className="font-bold text-lg" style={{ color: '#956ec3' }}>
                        ฿{order.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">ราคาเดิม:</span>
                        <p>฿{order.originalPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">ส่วนลด:</span>
                        <p className="text-red-600">-฿{order.discount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">ค่าจัดส่ง:</span>
                        <p>฿{order.shippingCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">ยอดสุทธิ:</span>
                        <p className="font-bold">฿{order.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">หมายเหตุ:</span>
                      <p className="text-sm italic">{order.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        แก้ไข
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>แก้ไขออเดอร์ #{order.orderNumber}</DialogTitle>
                      </DialogHeader>
                      {editingOrder && (
                        <div className="space-y-4">
                          <div>
                            <Label>ราคาเดิม</Label>
                            <Input
                              type="number"
                              value={editingOrder.originalPrice}
                              onChange={(e) => updateOrderPrice('originalPrice', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>ส่วนลด</Label>
                            <Input
                              type="number"
                              value={editingOrder.discount}
                              onChange={(e) => updateOrderPrice('discount', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>ค่าจัดส่ง</Label>
                            <Select 
                              value={editingOrder.shippingCost.toString()}
                              onValueChange={(value) => updateOrderPrice('shippingCost', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(shippingRates).map(([province, rate]) => (
                                  <SelectItem key={province} value={rate.toString()}>
                                    {province} - ฿{rate}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>หมายเหตุ</Label>
                            <Textarea
                              value={editingOrder.notes}
                              onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                            />
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Calculator className="h-4 w-4" />
                              <span className="font-medium">ราคารวม: ฿{editingOrder.totalPrice.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={saveOrder} className="flex-1">
                              บันทึก
                            </Button>
                            <Button variant="outline" onClick={() => setEditingOrder(null)}>
                              ยกเลิก
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {order.status === 'รอการอนุมัติ' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => approveOrder(order.id)}
                        style={{ backgroundColor: '#956ec3' }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        อนุมัติ
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => rejectOrder(order.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        ปฏิเสธ
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
