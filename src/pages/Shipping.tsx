import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, MapPin } from "lucide-react";

const Shipping = () => {
  const { user, signOut } = useAuth();

  const shippingOptions = [
    {
      name: "จัดส่งปกติ",
      price: "50-120 บาท",
      time: "3-7 วันทำการ",
      description: "จัดส่งผ่านไปรษณีย์ไทย หรือ Kerry Express"
    },
    {
      name: "จัดส่งด่วน",
      price: "150-250 บาท", 
      time: "1-2 วันทำการ",
      description: "จัดส่งผ่าน Flash Express หรือ J&T Express"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">การจัดส่ง</h1>
          <p className="text-gray-600">ข้อมูลและเงื่อนไขการจัดส่งสินค้า</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {shippingOptions.map((option, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" style={{ color: '#956ec3' }} />
                    <span>{option.name}</span>
                  </CardTitle>
                  <Badge style={{ backgroundColor: '#956ec3' }}>{option.price}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{option.time}</span>
                  </div>
                  <p className="text-gray-600">{option.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" style={{ color: '#956ec3' }} />
                <span>เงื่อนไขการจัดส่ง</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• ค่าจัดส่งคำนวณตามน้ำหนักและปลายทาง</li>
                <li>• สินค้าที่สั่งซื้อมากกว่า 2,000 บาท ฟรีค่าจัดส่ง</li>
                <li>• จัดส่งทั่วประเทศไทย ยกเว้นพื้นที่ห่างไกล</li>
                <li>• ไม่รับผิดชอบความเสียหายจากการขนส่ง (สามารถซื้อประกันเพิ่มได้)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" style={{ color: '#956ec3' }} />
                <span>พื้นที่จัดส่ง</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">พื้นที่จัดส่งปกติ</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• กรุงเทพมหานคร และปริมณฑล</li>
                    <li>• เขตพื้นที่จัดส่งหลักทั่วประเทศ</li>
                    <li>• อำเภอเมืองในแต่ละจังหวัด</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">พื้นที่จัดส่งพิเศษ</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• เกาะต่างๆ (ค่าส่งเพิ่มเติม)</li>
                    <li>• พื้นที่ห่างไกล (ใช้เวลานานขึ้น)</li>
                    <li>• พื้นที่เสี่ยง (อาจมีค่าใช้จ่ายเพิ่ม)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
