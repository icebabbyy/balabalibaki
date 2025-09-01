// src/pages/Warranty.tsx
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, XCircle, AlertCircle, Camera, Wrench, PackageOpen } from "lucide-react";

const brand = "#956ec3";

export default function Warranty() {
  const covered = [
    "ได้รับสินค้าผิดรุ่น/สี/ไซซ์ (ความผิดจากร้าน)",
    "เสียหายหนัก: ฟิกเกอร์หัก แตกละเอียด บิดเบี้ยว ไม่เป็นรูปทรง",
    "รายการที่ได้รับไม่ตรงออเดอร์",
  ];

  const notCovered = [
    "ลูกค้าแจ้งรุ่น/สี/ไซซ์ผิดเอง หลังยืนยันออเดอร์",
    "ตำหนิเล็กน้อยจากโรงงาน (สีเพี้ยนเล็กน้อย งานไม่เนี้ยบเล็ก ๆ) แต่ตัวงานสมบูรณ์",
    "ความล่าช้าจากต่างประเทศ/คิวโรงงาน",
    "เฉพาะกล่องสุ่ม สินค้า แตกหักภายในกล่องปิดผนึก ที่ไม่สามารถตรวจสอบได้ล่วงหน้า",
    "กล่องบุบ / Giftbox / แพ็กเกจสินค้า ทุกชนิดไม่รับประกัน — ร้านรับประกันเฉพาะตัวสินค้าเท่านั้น",
    "เนื่องจากสินค้าจัดส่งจากต่างประเทศมายังประเทศไทย ซึ่ง อยู่นอกเหนือการควบคุมของทางร้าน จึงไม่สามารถรับเคลมหรือเปลี่ยนคืนในกรณีเหล่านี้ได้ ทางร้านต้องขออภัยไว้ล่วงหน้า และขอขอบคุณสำหรับความเข้าใจค่ะ",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ประกันสินค้า 🛡️</h1>
          <p className="text-gray-600">💡เพื่อความปลอดภัยสูงสุด โดยเฉพาะ STATUE ขนาดใหญ่ แนะนำให้ลูกค้า ถ่ายวิดีโอเปิดกล่อง ตั้งแต่เริ่มจนจบ</p>
        </div>

      {/* คุ้มครอง & วิธีใช้สิทธิ์ (แจ้งภายใน 7 วัน) */}
<Card className="mb-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ShieldCheck className="h-5 w-5" style={{ color: brand }} />
      คุ้มครอง & วิธีใช้สิทธิ์ (แจ้งภายใน 7 วัน)
    </CardTitle>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2 text-gray-700 text-sm">
      {covered.map((t) => (
        <li key={t} className="flex gap-2">
          <span>•</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>

    <div className="border-t pt-4 mt-4 text-sm text-gray-700 space-y-2">
      <p className="font-semibold">ขั้นตอนการใช้สิทธิ์</p>
      <p>1) แจ้งเลขออเดอร์ + อาการปัญหา ภายใน <b>7 วัน</b> นับจากวันรับพัสดุ</p>
      <p>2) แนบ <b>วิดีโอแกะกล่องแบบต่อเนื่อง</b> (เห็นกล่องพัสดุ → ตัวสินค้าอย่างชัดเจน)</p>
      <p>3) ติดต่อโรงงานและรอโรงงานตรวจสอบ <b>7–25 วันทำการ</b></p>
      <p>
        4) แนวทางแก้ไข: <b>ซ่อม / เปลี่ยน</b>
        <Wrench className="h-4 w-4 inline-block ml-1" />
      </p>
      <p className="text-xs text-gray-500">
        ทริค: ถ่ายวิดีโอตั้งแต่เริ่มแกะ และเก็บกล่อง/กันกระแทกไว้ก่อน จะตรวจสอบได้ไวมากค่ะ ✨
      </p>
    </div>
  </CardContent>
</Card>


        {/* ไม่อยู่ในประกัน */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              ไม่อยู่ในประกัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700 text-sm">
              {notCovered.map((t) => (
                <li key={t} className="flex gap-2">
                  <span>•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* เงื่อนไข/กรณีพิเศษ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" style={{ color: brand }} />
              เงื่อนไข/กรณีพิเศษ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 text-sm space-y-2">
            <p>
              • <b>Limited Edition</b>: หาใหม่ไม่ได้ → ร้าน <b>ซ่อมฟรี</b> (เฉพาะตัวงานปั้น/ฟิกเกอร์) หรือพิจารณาทางเลือกอื่นเป็นเคส ๆ
            </p>
            <p>
              • ความเสียหายจาก <b>ขนส่งภายในไทย</b>: สามารถชดเชยค่าเสียหายและเคลมกับบริษัทขนส่งได้ — <b>คืนเงิน/สั่งใหม่</b> ให้หลังได้รับเงินเคลม
            </p>
            <p> • ชิ้นส่วนไม่ครบ: ร้านช่วยประสานขออะไหล่จากสโตร์ (หากปลายทางไม่รับเคส อาจทำต่อไม่ได้)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
