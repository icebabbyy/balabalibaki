
import { Card, CardContent } from "@/components/ui/card";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

interface OrderData {
  items: OrderItem[];
  totalPrice: number;
  customerInfo: CustomerInfo;
}

interface OrderSummaryProps {
  orderData: OrderData;
}

const OrderSummary = ({ orderData }: OrderSummaryProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
        
        <div className="space-y-3 mb-4">
          {orderData.items.map((item) => (
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
  );
};

export default OrderSummary;
