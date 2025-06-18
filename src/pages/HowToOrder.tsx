
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, CreditCard, Truck } from "lucide-react";

const HowToOrder = () => {
  const { user, signOut } = useAuth();

  const steps = [
    {
      icon: Package,
      title: "1. เลือกสินค้า",
      description: "เลือกสินค้าที่ต้องการจากหมวดหมู่ต่างๆ และเพิ่มลงในตะกร้า"
    },
    {
      icon: CheckCircle,
      title: "2. ตรวจสอบรายการ",
      description: "ตรวจสอบรายการสินค้าในตะกร้า จำนวน และราคารวม"
    },
    {
      icon: CreditCard,
      title: "3. ชำระเงิน",
      description: "ชำระเงินผ่านการโอนเงิน และอัพโหลดหลักฐานการโอน"
    },
    {
      icon: Truck,
      title: "4. รอรับสินค้า",
      description: "รอรับสินค้าตามที่อยู่ที่ระบุไว้ ใช้เวลา 3-7 วันทำการ"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={signOut} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">วิธีการสั่งซื้อ</h1>
          <p className="text-gray-600">ขั้นตอนการสั่งซื้อสินค้าจาก Lucky Shop</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <step.icon className="h-8 w-8" style={{ color: '#956ec3' }} />
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ข้อมูลสำคัญ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• สินค้าพรีออเดอร์จะใช้เวลา 2-4 สัปดาห์</li>
              <li>• สินค้าพร้อมส่งจะจัดส่งภายใน 3-7 วันทำการ</li>
              <li>• ค่าจัดส่งเริ่มต้น 50 บาท (ขึ้นอยู่กับน้ำหนักและปลายทาง)</li>
              <li>• รองรับการชำระเงินผ่านการโอนเงินเท่านั้น</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HowToOrder;
