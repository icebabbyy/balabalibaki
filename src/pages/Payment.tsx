
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    } else {
      window.location.href = '/cart';
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB");
        return;
      }
      setPaymentSlip(file);
    }
  };

  const handleSubmitOrder = async () => {
    if (!paymentSlip) {
      toast.error("กรุณาอัพโหลดสลิปการโอนเงิน");
      return;
    }

    setUploading(true);
    
    try {
      // Upload payment slip to Supabase Storage (if storage is configured)
      // For now, we'll create the order without uploading
      
      const orderItems = orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku
      }));

      // Create order in database
      const { data, error } = await supabase
        .from('orders')
        .insert({
          username: orderData.customerInfo.name,
          items: orderItems,
          total_selling_price: orderData.totalPrice,
          address: orderData.customerInfo.address,
          status: 'รอตรวจสอบการชำระเงิน',
          order_date: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating order:', error);
        toast.error("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
        return;
      }

      // Clear cart and pending order
      localStorage.removeItem('cart');
      localStorage.removeItem('pendingOrder');
      
      toast.success("ส่งคำสั่งซื้อเรียบร้อยแล้ว รอการตรวจสอบจากเจ้าหน้าที่");
      
      // Redirect to order status page
      setTimeout(() => {
        window.location.href = '/order-status';
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");
    } finally {
      setUploading(false);
    }
  };

  if (!orderData) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={signOut} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">ชำระเงิน</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
              
              <div className="space-y-3 mb-4">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>รวมทั้งหมด:</span>
                  <span style={{ color: '#956ec3' }}>฿{orderData.totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-bold mb-2">ข้อมูลการจัดส่ง:</h3>
                <p><strong>ชื่อ:</strong> {orderData.customerInfo.name}</p>
                <p><strong>เบอร์โทร:</strong> {orderData.customerInfo.phone}</p>
                <p><strong>ที่อยู่:</strong> {orderData.customerInfo.address}</p>
                {orderData.customerInfo.note && (
                  <p><strong>หมายเหตุ:</strong> {orderData.customerInfo.note}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">ข้อมูลการชำระเงิน</h2>
              
              <div className="mb-6">
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-purple-800 mb-2">โอนเงินผ่าน QR Code</h3>
                  <div className="text-center">
                    <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">QR Code การชำระเงิน</span>
                    </div>
                    <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงิน</p>
                    <p className="font-bold text-lg" style={{ color: '#956ec3' }}>
                      ยอดชำระ: ฿{orderData.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อัพโหลดสลิปการโอนเงิน *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="payment-slip"
                    />
                    <label htmlFor="payment-slip" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {paymentSlip ? paymentSlip.name : "คลิกเพื่อเลือกไฟล์สลิป"}
                      </p>
                    </label>
                  </div>
                </div>
                
                <Button
                  onClick={handleSubmitOrder}
                  disabled={!paymentSlip || uploading}
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: '#956ec3' }}
                  size="lg"
                >
                  {uploading ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันการชำระเงิน"}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  หลังจากยืนยันการชำระเงิน เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 24 ชั่วโมง
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
