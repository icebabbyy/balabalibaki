
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, CheckCircle, Clock, AlertCircle, Truck, MessageSquare, DollarSign } from "lucide-react";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import OrderTrackingDialog from "@/components/OrderTrackingDialog";
import OrderEditDialog from "@/components/OrderEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OrderManagement = () => {
  const { orders, loading, updateOrderStatus, refetch } = useOrderManagement();
  const [editingOrder, setEditingOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบออเดอร์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        toast.error('เกิดข้อผิดพลาดในการลบออเดอร์');
        return;
      }

      toast.success('ลบออเดอร์เรียบร้อยแล้ว');
      refetch(); // Refresh the orders list
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('เกิดข้อผิดพลาดในการลบออเดอร์');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอชำระเงิน':
        return 'bg-yellow-100 text-yellow-800';
      case 'ชำระเงินแล้ว':
        return 'bg-purple-100 text-purple-800';
      case 'กำลังจัดส่ง':
        return 'bg-blue-100 text-blue-800';
      case 'จัดส่งแล้ว':
        return 'bg-green-100 text-green-800';
      case 'ยกเลิก':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รอชำระเงิน':
        return <Clock className="h-4 w-4" />;
      case 'ชำระเงินแล้ว':
        return <CheckCircle className="h-4 w-4" />;
      case 'กำลังจัดส่ง':
        return <Truck className="h-4 w-4" />;
      case 'จัดส่งแล้ว':
        return <CheckCircle className="h-4 w-4" />;
      case 'ยกเลิก':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: '#956ec3' }}>จัดการออเดอร์</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#956ec3' }}>จัดการออเดอร์</h2>
        <Badge variant="secondary" className="px-3 py-1">
          {orders.filter(o => o.status === 'รอตรวจสอบการชำระเงิน').length} รายการรอพิจารณา
        </Badge>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">#{order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">ลูกค้า:</span>
                      <p className="font-medium">{order.username || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">สินค้า:</span>
                      <p className="font-medium">
                        {order.items && order.items[0] ? order.items[0].name : 'ไม่ระบุสินค้า'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">จำนวน:</span>
                      <p className="font-medium">
                        {order.items && order.items[0] ? order.items[0].quantity : 'ไม่ระบุ'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">ราคารวม:</span>
                      <p className="font-bold text-lg" style={{ color: '#956ec3' }}>
                        ฿{order.total_selling_price?.toLocaleString() || 'ไม่ระบุ'}
                      </p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">มัดจำ:</span>
                        <p>฿{order.deposit?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">ค่าส่ง:</span>
                        <p>฿{order.shipping_cost?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">ส่วนลด:</span>
                        <p>฿{order.discount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">กำไร:</span>
                        <p className="font-medium text-green-600">
                          ฿{order.profit?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">หมายเลขติดตาม:</span>
                      <p className="font-medium">
                        {order.tracking_number ? (
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                            {order.tracking_number}
                          </span>
                        ) : (
                          <span className="text-gray-400">ยังไม่ได้ระบุ</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">วันที่สร้าง:</span>
                      <p>{order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</p>
                    </div>
                  </div>

                  {order.admin_notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">{order.admin_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingOrder(order)}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    แก้ไขยอด
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTrackingOrder(order)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Tracking
                  </Button>

                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    ลบออเดอร์
                  </Button>

                  {order.status === 'รอตรวจสอบการชำระเงิน' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'ชำระเงินแล้ว')}
                      style={{ backgroundColor: '#956ec3' }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      ยืนยันชำระ
                    </Button>
                  )}

                  {order.status === 'ชำระเงินแล้ว' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'กำลังจัดส่ง')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      เริ่มจัดส่ง
                    </Button>
                  )}

                  {order.status === 'กำลังจัดส่ง' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'จัดส่งแล้ว')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      จัดส่งเสร็จ
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีออเดอร์</h3>
              <p className="text-gray-500">เมื่อมีออเดอร์เข้ามา จะแสดงที่นี่</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Edit Dialog */}
      <OrderEditDialog
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onUpdate={refetch}
      />

      {/* Order Tracking Dialog */}
      <OrderTrackingDialog
        order={trackingOrder}
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />
    </div>
  );
};

export default OrderManagement;
