import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Truck, CreditCard, Info, ShieldCheck, PackageCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const brandQA = "#956ec3";

const items = [
  {
    q: "รวมพรีออเดอร์กับพร้อมส่งได้ไหม?",
    a: (
      <>
        สั่งพร้อมกันได้ แต่ส่งรวมกันไม่ได้ค่ะ ต้องแยกบิลนะคะ 🧾 พรีออเดอร์รวมกันได้เฉพาะ <b>เดือนวางขายเดียวกัน</b> และจะจัดส่งเมื่อ <b>ทุกชิ้นพร้อม</b> เท่านั้น
        หากอยากได้ของที่พร้อมก่อน แนะนำสั่งแยกบิล (ค่าส่งคิดตามจริง)
      </>
    ),
    icon: PackageCheck,
  },
  {
    q: "ค่าส่งเท่าไหร่ / ส่งฟรีเมื่อไหร่?",
    a: (
      <>
        ค่าส่งเริ่มต้น <b>35บาท</b> (ขึ้นกับน้ำหนักและปลายทาง) — อาจมีโปรส่งฟรีตามช่วงแคมเปญ หรือ ตามสินค้านั้น ๆ ค่ะ
      </>
    ),
    icon: Truck,
  },
  {
    q: "ยกเลิกออเดอร์ได้ไหม?",
    a: (
      <>
        โดยหลัก <b>งดยกเลิก/งดคืน/งดเปลี่ยน</b> หากเป็นเหตุส่วนตัวของลูกค้า ยกเว้นกรณีพิเศษ เช่น
        <ul className="list-disc pl-6 mt-2">
          <li>ตรวจพบ <b>เสียหายหนัก</b> และหาอะไหล่ไม่ได้</li>
          <li>ซัพพลายเออร์ <b>ของหมดจริง</b> หรือเลื่อนเกินปกติ</li>
          <li>ผู้ผลิต <b>ยกเลิกการวางจำหน่าย</b></li>
          <li>หากยกเลิกและมีการวางมัดจำหรือผ่อนไว้ ทางร้านจะริบทันที ไม่สามารถคืนเงินได้</li>
        </ul>
        *ผู้ผลิตเลื่อนกำหนดอย่างเดียว ไม่ใช่เหตุยกเลิกนะคะ และหลังจัดส่งแล้ว <b>ไม่รับยกเลิก</b> / ปฏิเสธรับพัสดุอาจมีการเรียกเก็บค่าส่งไป–กลับและวัสดุแพ็กค่ะ
      </>
    ),
    icon: Info,
  },
  {
    q: "ต้องมีวิดีโอแกะกล่องไหม? มีวิดีโอแพ็กของจากร้านหรือเปล่า?",
    a: (
      <>
        แนะนำให้ถ่าย <b>วิดีโอแกะกล่องแบบต่อเนื่องภายใน 7 วัน</b> เพื่อใช้เป็นหลักฐานการประกันสินค้า
        ร้าน <b>ไม่มีบริการวิดีโอขณะบรรจุ</b> รายชิ้นค่ะ
      </>
    ),
    icon: ShieldCheck,
  },
  {
    q: "ของจริงต่างจากภาพหน้าเว็บ ขอคืนได้ไหม?",
    a: (
      <>
        ภาพบนเว็บเป็นภาพตัวอย่าง สี/รายละเอียดอาจต่างเล็กน้อย และขนาดอาจคลาดเคลื่อน ~±3% จึงไม่ใช่เหตุคืน/คืนเงินค่ะ
      </>
    ),
    icon: Info,
  },
  {
    q: "ทำไมราคาบางรุ่นดีกว่าที่อื่น?",
    a: (
      <>
        เรารับของจากซัพพลายเออร์ต่างประเทศโดยตรง และโฟกัสความคุ้มค่า + บริการ มากกว่าการบวกกำไรสูงค่ะ
      </>
    ),
    icon: CreditCard,
  },
  {
    q: "ต่างประเทศเริ่มขายแล้ว ทำไมที่นี่พรีออเดอร์?",
    a: (
      <>
        ผู้ผลิตมักขายก่อน แล้วสินค้าจึงไหลไปยังโฮลเซล/ดีลเลอร์ ทำให้ปลายทางไทย <b>ช้ากว่าโรงงานนิดหน่อย</b> เป็นปกติค่ะ
      </>
    ),
    icon: Info,
  },
];

export default function QA() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">คำถามที่พบบ่อย (Q&A) 💭</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2" style={{ color: brandQA }}>
              <MessageCircle className="h-5 w-5" /> คำถามยอดนิยม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {items.map(({ q, a, icon: Icon }, i) => (
                <AccordionItem key={q} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: brandQA }} />
                      <span>{q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 text-sm">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        
<Card className="mb-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" style={{ color: brandQA }} />
              ข้อควรทราบเกี่ยวกับพรีออเดอร์ & สินค้าพร้อมส่ง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• <b>อัปเดตสถานะสินค้าทางอีเมลและบนเว็บเท่านั้น</b> โปรดแจ้งอีเมลที่ใช้งานได้จริงและเช็ก Inbox/Spam</li>
              <li>• <b>ของแถม</b> จัดส่งพร้อมสินค้าหลักเท่านั้น (แยกส่งได้ คิดค่าส่งตามจริง)</li>
              <li>• <b>กำหนดส่งหน้าเพจ ≠ วันถึงไทย</b> ปกติถึงไทย <b>+7–20 วัน</b> หลังโรงงานส่ง → ร้านตรวจเช็ก/แพ็ก <b>1–3 วัน</b></li>
              <li>• <b>ทางร้านพรีออเดอร์และจำหน่าย ลิขสิทธิ์แท้ ของแท้ 100%</b> หากพบปลอม ยินดีคืนเงินเต็มจำนวน</li>
              <li>• <b>สินค้าพร้อมส่ง</b> ผ่อนได้สูงสุด <b>60 วัน</b> และฝากของได้สูงสุด <b>60 วัน</b></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
