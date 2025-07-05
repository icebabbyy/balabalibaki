import { Card, CardContent } from "@/components/ui/card";
import { ProductPublic } from "@/types/product"; // Import ProductPublic for better type safety

// --- 1. แก้ไข Interface ให้ตรงกับข้อมูลจริง ---
interface OrderSummaryProps {
  orderData: {
    items: Array<ProductPublic & { quantity: number }>; // ใช้ Type ที่ถูกต้อง
    customerInfo: {
      name: string;
      address: string;
      note?: string;
    };
    totalPrice: number;
    shippingCost?: number;
  };
}

const OrderSummary = ({ orderData }: OrderSummaryProps) => {
  // 2. คำนวณ subtotal โดยใช้ 'selling_price'
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  const shippingCost = orderData.shippingCost || 0;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
        
        {/* Customer Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">ข้อมูลลูกค้า</h3>
          <p className="text-sm text-gray-600">ชื่อ: {orderData.customerInfo.name}</p>
          <p className="text-sm text-gray-600">ที่อยู่: {orderData.customerInfo.address}</p>
          {orderData.customerInfo.note && (
            <p className="text-sm text-gray-600">หมายเหตุ: {orderData.customerInfo.note}</p>
          )}
        </div>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {orderData.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <img 
                src={item.image || '/placeholder.svg'} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  ประเภท: {item.product_type || 'ETC'}
                </p>
                <p className="text-sm text-gray-600">
                  {/* 3. แก้ไขจาก item.price เป็น item.selling_price */}
                  จำนวน: {item.quantity} × ฿{item.selling_price.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {/* 4. แก้ไขจาก item.price เป็น item.selling_price */}
                  ฿{(item.selling_price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>ราคาสินค้า:</span>
            <span>฿{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>ค่าจัดส่ง:</span>
            <span>฿{shippingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2" style={{ color: '#956ec3' }}>
            <span>ยอดรวมทั้งสิ้น:</span>
            <span>฿{orderData.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
// This component displays the order summary including customer information, items ordered, and total price.
// It uses the ProductPublic type for better type safety and ensures that the data structure matches the