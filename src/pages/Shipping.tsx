import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, Info } from "lucide-react";
import { Link } from "react-router-dom";

const brandShip = "#956ec3";

export function Shipping() {
  const shippingOptions = [
    {
      name: "พร้อมส่ง",
      time: "1-3 วัน",
      desc:
        "ทางร้านใช้ขนส่งไปรษณีย์ไทย ส่งด่วน EMS เท่านั้น โดยปกติ กรุงเทพและปริมณฑล 1-3 วัน และต่างจังหวัด 3-5 วัน",
    },
    {
      name: "Pre-order",
      time: "8-20 วัน",
      desc:
        "สำหรับสินค้า สั่งนำเข้า/ไม่มีสต็อก และ พรีออเดอร์ ทางร้านดำเนินการ Repack ใหม่ทุกชิ้น ก่อนจัดส่งเสมอค่ะ",
    },
    {
      name: "Pre-sale",
      time: "90-200 วัน",
      desc:
        "Pre-Sale เปิดจองล่วงหน้า จะจัดส่งตามกำหนดส่งของรายการสินค้าหรือตามคิวโรงงาน แลกกับระยะเวลาที่รอนานสินค้ามักจะมีของแถมหรือราคาพิเศษค่ะ หากล่าช้ามากกว่าที่แจ้ง ทางร้านจะแจ้งเตือนให้ทราบผ่าน E-mail ค่ะ",
    },
    {
      name: "🌍✨ We ship worldwide! ✨🌍",
      time: "", // ไม่มี badge เวลา
      desc:
        "No matter where you are, I can send your favorite item right to your doorstep 💌\n\nIf you're interested, feel free to message me with the item you're looking for and your full address.\nI'll calculate the total price including international shipping for you 💖\n\nDon't worry—asking questions is totally okay! No pressure to buy. I'm always happy to help 😊",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ระยะเวลาและการจัดส่ง🚚</h1>
        </div>

        {/* 4 บล็อก */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {shippingOptions.map((o) => (
            <Card key={o.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" style={{ color: brandShip }} />
                    <span>{o.name}</span>
                  </CardTitle>
                  {o.time ? <Badge style={{ backgroundColor: brandShip }}>{o.time}</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className={`text-gray-700 ${o.name.includes("worldwide") ? "whitespace-pre-line" : ""} whitespace-pre-line`}>
                {o.desc}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: brandShip }} />
              เงื่อนไขการจัดส่ง/รวมออเดอร์ 📦
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• <b>กำหนดส่งหน้าเพจ ≠ วันถึงไทย</b> (เป็นกำหนดจากโรงงาน)</li>
              <li>• ถึงไทยโดยประมาณ <b>+7–20 วัน</b> หลังโรงงานจัดส่ง ➝ ร้านตรวจเช็ก/แพ็ก <b>1–3 วัน</b> ก่อนส่ง</li>
              <li>• พรีออเดอร์ออเดอร์เดียวกันได้เฉพาะ <b>เดือนวางขายเดียวกัน</b> และส่งเมื่อ <b>ทุกชิ้นถึงไทย</b>(ต้องการแยกส่ง ➝ คิดค่าส่งจริง)</li>
              <li>• หากคุณลูกค้ารีบใช้สินค้า ทางร้านแนะนำให้สั่ง Pre-order และ พร้อมส่ง แบบแยกบิลกันนะคะ </li>
              <li>• ค่าส่งเริ่มต้น <b>35 บาท</b> (ขึ้นกับน้ำหนัก/ปลายทาง)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" style={{ color: brandShip }} />
              ติดตามพัสดุและสถานะสินค้า
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            ตรวจสอบสถานะได้ที่{" "}
            <Link to="/order-status" className="underline" style={{ color: brandShip }}>
              Order Status
            </Link>{" "}
            หรือทักเพจเพื่อให้แอดมินช่วยตรวจสอบได้ค่ะ
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Shipping;
