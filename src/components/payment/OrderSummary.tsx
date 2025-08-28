import { Card, CardContent } from "@/components/ui/card";
import { ProductPublic } from "@/types/product";

// --- 1) types ให้มี phone ---
interface OrderSummaryProps {
  orderData: {
    items: Array<ProductPublic & { quantity: number }>;
    customerInfo: {
      name: string;
      address: string;
      phone: string;   // ⬅️ เพิ่มเบอร์โทร
      note?: string;
    };
    totalPrice: number;
    shippingCost?: number;
  };
}

// เช็คเบอร์: ตัวเลข 10 หลักเท่านั้น
const isValidPhone = (phone: string) => /^\d{10}$/.test((phone || "").trim());

const OrderSummary = ({ orderData }: OrderSummaryProps) => {
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + item.selling_price * item.quantity,
    0
  );
  const shippingCost = orderData.shippingCost || 0;
  const phoneValid = isValidPhone(orderData.customerInfo.phone);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>

        {/* Customer Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">ข้อมูลลูกค้า</h3>
          <p className="text-sm text-gray-600">ชื่อ: {orderData.customerInfo.name}</p>
          <p className="text-sm text-gray-600">ที่อยู่: {orderData.customerInfo.address}</p>
          <p className={`text-sm ${phoneValid ? "text-gray-600" : "text-red-600"}`}>
            เบอร์โทร: {orderData.customerInfo.phone}
            {!phoneValid && (
              <span className="ml-2 font-medium">
                (กรุณากรอกเป็นตัวเลข 10 หลัก)
              </span>
            )}
          </p>
          {orderData.customerInfo.note && (
            <p className="text-sm text-gray-600">หมายเหตุ: {orderData.customerInfo.note}</p>
          )}
        </div>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {orderData.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  ประเภท: {item.product_type || "ETC"}
                </p>
                <p className="text-sm text-gray-600">
                  จำนวน: {item.quantity} × ฿{item.selling_price.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
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
          <div
            className="flex justify-between text-lg font-bold border-t pt-2"
            style={{ color: "#956ec3" }}
          >
            <span>ยอดรวมทั้งสิ้น:</span>
            <span>฿{orderData.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
