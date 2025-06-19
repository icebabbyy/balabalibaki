
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Package, CheckCircle, Clock, AlertCircle, Truck, MessageCircle, DollarSign } from "lucide-react";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OrderTrackingDialog from "@/components/OrderTrackingDialog";

const OrderManagement = () => {
  const { orders, loading, updateOrderStatus } = useOrderManagement();
  const [editingOrder, setEditingOrder] = useState(null);
  const [replyDialog, setReplyDialog] = useState(null);
  const [editAmountDialog, setEditAmountDialog] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [editedAmounts, setEditedAmounts] = useState({
    total_selling_price: 0,
    shipping_cost: 0,
    deposit: 0,
    discount: 0
  });

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

  const handleReplyToCustomer = (order) => {
    setReplyDialog(order);
    setReplyMessage('');
  };

  const sendReplyToCustomer = async () => {
    if (!replyDialog || !replyMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          admin_notes: replyMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', replyDialog.id);

      if (error) {
        toast.error('เกิดข้อผิดพลาดในการส่งข้อความ');
        return;
      }

      toast.success('ส่งข้อความถึงลูกค้าแล้ว');
      setReplyDialog(null);
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อความ');
    }
  };

  const handleEditAmount = (order) => {
    setEditAmountDialog(order);
    setEditedAmounts({
      total_selling_price: order.total_selling_price || 0,
      shipping_cost: order.shipping_cost || 0,
      deposit: order.deposit || 0,
      discount: order.discount || 0
    });
  };

  const saveEditedAmounts = async () => {
    if (!editAmountDialog) return;

    try {
      const profit = editedAmounts.total_selling_price - editedAmounts.deposit - editedAmounts.discount;
      
      const { error } = await supabase
        .from('orders')
        .update({
          total_selling_price: editedAmounts.total_selling_price,
          shipping_cost: editedAmounts.shipping_cost,
          deposit: editedAmounts.deposit,
          discount: editedAmounts.discount,
          profit: profit,
          updated_at: new Date().toISOString()
        })
        .eq('id', editAmountDialog.id);

      if (error) {
        toast.error('เกิดข้อผิดพลาดในการอัปเดตยอดเงิน');
        return;
      }

      toast.success('อัปเดตยอดเงินเรียบร้อยแล้ว');
      setEditAmountDialog(null);
      window.location.reload();
    } catch (error) {
      console.error('Error updating amounts:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตยอดเงิน');
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
          {orders.filter(o => o.status === 'รอชำระเงิน').length} รายการรอพิจารณา
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
                        {order.items && order.items[0] ? order.items[0].productName : 'ไม่ระบุสินค้า'}
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

                  {/* Tracking & Notes Section */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
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
                        <span className="text-gray-600">หมายเหตุแอดมิน:</span>
                        <p className="font-medium">
                          {order.admin_notes || <span className="text-gray-400">ไม่มีหมายเหตุ</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
                      <span className="text-gray-600">วันที่สร้าง:</span>
                      <p>{order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReplyToCustomer(order)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    ตอบกลับลูกค้า
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAmount(order)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    แก้ไขยอด
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingOrder(order)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข Tracking
                  </Button>

                  {order.status === 'รอชำระเงิน' && (
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

      {/* Reply to Customer Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ตอบกลับลูกค้า - ออเดอร์ #{replyDialog?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply-message">ข้อความถึงลูกค้า</Label>
              <Textarea
                id="reply-message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="พิมพ์ข้อความที่ต้องการส่งถึงลูกค้า..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setReplyDialog(null)}>
                ยกเลิก
              </Button>
              <Button onClick={sendReplyToCustomer} disabled={!replyMessage.trim()}>
                ส่งข้อความ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Amount Dialog */}
      <Dialog open={!!editAmountDialog} onOpenChange={() => setEditAmountDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขยอดเงิน - ออเดอร์ #{editAmountDialog?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total-price">ราคารวม (บาท)</Label>
                <Input
                  id="total-price"
                  type="number"
                  value={editedAmounts.total_selling_price}
                  onChange={(e) => setEditedAmounts(prev => ({ ...prev, total_selling_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="shipping-cost">ค่าส่ง (บาท)</Label>
                <Input
                  id="shipping-cost"
                  type="number"
                  value={editedAmounts.shipping_cost}
                  onChange={(e) => setEditedAmounts(prev => ({ ...prev, shipping_cost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="deposit">มัดจำ (บาท)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={editedAmounts.deposit}
                  onChange={(e) => setEditedAmounts(prev => ({ ...prev, deposit: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="discount">ส่วนลด (บาท)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={editedAmounts.discount}
                  onChange={(e) => setEditedAmounts(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                ยอดคงเหลือ: ฿{(editedAmounts.total_selling_price - editedAmounts.deposit - editedAmounts.discount).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditAmountDialog(null)}>
                ยกเลิก
              </Button>
              <Button onClick={saveEditedAmounts}>
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Tracking Dialog */}
      <OrderTrackingDialog
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
      />
    </div>
  );
};

export default OrderManagement;
