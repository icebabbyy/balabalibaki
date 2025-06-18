
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const Returns = () => {
  const { user, signOut } = useAuth();

  const returnConditions = [
    {
      icon: CheckCircle,
      title: "สินค้าที่สามารถคืนได้",
      items: [
        "สินค้าชำรุดจากการผลิต",
        "สินค้าไม่ตรงตามที่สั่ง",
        "สินค้าหายไประหว่างการจัดส่ง"
      ],
      color: "text-green-600"
    },
    {
      icon: XCircle,
      title: "สินค้าที่ไม่สามารถคืนได้",
      items: [
        "สินค้าที่เปิดแพ็คเกจแล้ว (ยกเว้นกรณีชำรุด)",
        "สินค้าลิมิเต็ดเอดิชั่น",
        "สินค้าที่สั่งพิเศษ (Custom Order)"
      ],
      color: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={signOut} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">การคืนสินค้า</h1>
          <p className="text-gray-600">นโยบายและเงื่อนไขการคืนสินค้า</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" style={{ color: '#956ec3' }} />
              <span>ขั้นตอนการคืนสินค้า</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Badge className="mt-1" style={{ backgroundColor: '#956ec3' }}>1</Badge>
                <div>
                  <h4 className="font-semibold">แจ้งปัญหา</h4>
                  <p className="text-gray-600 text-sm">แจ้งปัญหาภายใน 7 วัน หลังจากได้รับสินค้า</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1" style={{ backgroundColor: '#956ec3' }}>2</Badge>
                <div>
                  <h4 className="font-semibold">ส่งหลักฐาน</h4>
                  <p className="text-gray-600 text-sm">ถ่ายรูปสินค้าที่มีปัญหา และหลักฐานการซื้อ</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1" style={{ backgroundColor: '#956ec3' }}>3</Badge>
                <div>
                  <h4 className="font-semibold">รอการตรวจสอบ</h4>
                  <p className="text-gray-600 text-sm">ทีมงานจะตรวจสอบและติดต่อกลับภายใน 2-3 วันทำการ</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1" style={{ backgroundColor: '#956ec3' }}>4</Badge>
                <div>
                  <h4 className="font-semibold">ส่งคืนสินค้า</h4>
                  <p className="text-gray-600 text-sm">หากได้รับการอนุมัติ ให้ส่งสินค้ากลับมาตามที่อยู่ที่แจ้ง</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {returnConditions.map((condition, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${condition.color}`}>
                  <condition.icon className="h-5 w-5" />
                  <span>{condition.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {condition.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" style={{ color: '#956ec3' }} />
              <span>ข้อกำหนดสำคัญ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• ระยะเวลาการคืนสินค้า: 7 วัน นับจากวันที่ได้รับสินค้า</li>
              <li>• ค่าจัดส่งในการคืนสินค้า: ลูกค้าเป็นผู้รับผิดชอบ (ยกเว้นกรณีสินค้าชำรุดจากร้าน)</li>
              <li>• การคืนเงิน: ใช้เวลา 3-7 วันทำการ หลังจากได้รับสินค้าคืน</li>
              <li>• สินค้าต้องอยู่ในสภาพเดิม พร้อมกล่องและอุปกรณ์ครบถ้วน</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Returns;
