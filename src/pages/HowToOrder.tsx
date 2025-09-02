// =============================
// src/pages/HowToOrder.tsx
// =============================
import type { ElementType, ReactNode } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  ListChecks,
  CreditCard,
  Truck,
  Mail,
  Info,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const brand = "#956ec3";
const MEMO_IMG = "/images/memo-examples.png"; // ถ้ามีภาพรวมเก็บไว้ในโปรเจกต์ ใช้แสดงใน Dialog ได้

type Step = { icon: ElementType; title: string; desc: string };

/** ------------------ ข้อความ 6 ขั้นตอน (คงข้อความเดิม) ------------------ */
const steps: Step[] = [
  {
    icon: ShoppingBag,
    title: "เลือกสินค้า",
    desc: "ในเพจ: ส่งรูปสินค้า + จำนวน ทางอินบ็อกซ์\nบนเว็บ: เพิ่มลงตะกร้า",
  },
  {
    icon: ListChecks,
    title: "2) ตรวจสอบรายการ",
    desc: "ตรวจ จำนวน/ราคารวม กรอกชื่อ–ที่อยู่–เบอร์โทร และดำเนินการชำระเงิน",
  },
  {
    icon: CreditCard,
    title: "3) ชำระเงิน",
    desc: "ชำระได้ตามช่องทางที่ร้านแจ้ง \nหรือชำระผ่านหน้าเว็บ",
  },
  {
    icon: Mail,
    title: "4) ยืนยันออเดอร์ & อีเมลยืนยัน",
    desc: "ระบบ/แอดมินส่งอีเมลคอนเฟิร์มให้เสมอ (หาไม่เจอให้เช็ก Junk/Spam)",
  },
  {
    icon: ListChecks,
    title: "5) รอการแพ็ก & จัดส่ง",
    desc: "พร้อมส่ง 3–7 วันทำการ \nพรีออเดอร์ 2–4 สัปดาห์ (หลังของถึงไทย)",
  },
  {
    icon: Truck,
    title: "6) รับสินค้า",
    desc: "Enjoy your item! 🎉\nถ่ายวิดีโอแกะกล่องเก็บไว้ 7 วัน",
  },
];

/** ------------------ Badge รูปหัวใจ (ไม่มีพื้นขาว) ------------------ */
function HeartBadge({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto h-[112px] w-[112px]">
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {/* หัวใจแบบเส้นขอบ (outline) */}
        <path
          d="
            M60 104
            C 60 104, 16 78, 16 46
            C 16 31, 28 22, 40 22
            C 49 22, 55 27, 60 33
            C 65 27, 71 22, 80 22
            C 92 22, 104 31, 104 46
            C 104 78, 60 104, 60 104 Z
          "
          fill="none"
          stroke={brand}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* ไอคอนตรงกลาง (ไม่มีพื้นหลัง) */}
      <div className="absolute inset-0 grid place-items-center" style={{ color: brand }}>
        {children}
      </div>
    </div>
  );
}

/** ------------------ ชิ้นส่วน Step ที่ใช้ heart badge + หมายเลข + ข้อความ ------------------ */
function StepItem({
  icon: Icon,
  title,
  desc,
  index,
}: Step & { index: number }) {
  return (
    <div className="text-center">
      <div className="relative inline-block">
        <HeartBadge>
          <Icon className="h-6 w-6" />
        </HeartBadge>

        {/* หมายเลขขั้นตอน (ปุ่มกลมใต้หัวใจเล็กน้อย) */}
        <div className="absolute left-1/2 top-[100%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-7 w-7 rounded-full text-white text-xs font-bold grid place-items-center shadow-sm"
            style={{ backgroundColor: brand }}
          >
            {index + 1}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold leading-tight">{title}</h4>
        <p className="mt-2 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function HowToOrder() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            วิธีการสั่งซื้อ (How to Order) ✨
          </h1>
          <p className="text-gray-600">
            เลือกสั่งได้ทั้ง <b>เว็บไซต์</b> และ <b>แชทเพจ</b> — ทุกออเดอร์มี
            <b> อีเมลยืนยัน</b> เสมอค่ะ 💌
          </p>
        </div>

        {/* ขั้นตอน: 6 ช่อง (3x2) หัวใจไม่มีพื้น */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: brand }}>
              <ShoppingBag className="h-5 w-5" />
              ขั้นตอนการสั่งซื้อ (เว็บ/เพจ) 🛒
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((s, i) => (
                <StepItem key={s.title} {...s} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลสำคัญก่อนชำระเงินและสั่งสินค้า */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" style={{ color: brand }} />
              ข้อมูลสำคัญก่อนชำระเงินและสั่งสินค้า 📌
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li>
                • <b>อัปเดตสถานะสินค้าทางอีเมลและบนเว็บเท่านั้น</b> โปรดแจ้งอีเมลที่ใช้งานได้จริงและเช็ก Inbox/Spam
              </li>
              <li>
                • ช่องทางชำระเงิน: โอนธนาคาร / PromptPay / <b>Truemoney Wallet</b> / บัตรเครดิต (<b>+3%</b>)
              </li>
              <li>
                • ขอความร่วมมือ พิมพ์ <b>memo “Wishyoulucky”</b> ทุกครั้ง (กันการแอบอ้าง) — หากลืมใส่ให้โอนเพิ่ม
                <b> 1 บาท</b> พร้อมข้อความ
              </li>
              <li className="text-center leading-relaxed">
                <b>
                  เพื่อความปลอดภัย โปรดโอนเฉพาะบัญชีที่ร้านแจ้งในช่องทางทางการเท่านั้น
                  ทางร้านขอไม่รับผิดชอบกรณีถูกมิจฉาชีพหลอกให้โอน หรือชวนซื้อสินค้าที่ไม่เกี่ยวข้องกับร้าน
                </b>
                — โปรดตรวจสอบให้ดีก่อนโอนทุกครั้งนะคะ
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* ตัวอย่างการใส่ memo (Canva + ปุ่มดูเต็มจอ) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" style={{ color: brand }} />
              ตัวอย่างการใส่ memo ก่อนยืนยันการโอน
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* ฝัง Canva แบบ 16:9 responsive */}
            <div
              className="relative w-full overflow-hidden rounded-xl shadow-sm"
              style={{ paddingTop: "56.25%" }}
            >
              <iframe
                loading="lazy"
                className="absolute inset-0 h-full w-full border-0"
                // ใส่ลิงก์ Canva ของร้านได้ตามจริง
                src="https://www.canva.com/design/DAGxwRge-sk/f_3vn3Xd3Y-hJEZD2F9vxw/view?embed"
                title="ตัวอย่างการใส่ memo"
                allow="fullscreen"
                allowFullScreen
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                *ตัวอย่างเท่านั้น — ต้องพิมพ์ในแอปธนาคารจริง ห้ามตัดต่อ/แปะค่ะ หากไม่มั่นใจสอบถามได้เลยค่ะ
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    aria-label="ดูภาพตัวอย่างแบบเต็มจอ"
                  >
                    <Maximize2 className="h-4 w-4" />
                    ดูเต็มจอ
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>ตัวอย่างการใส่ memo</DialogTitle>
                  </DialogHeader>
                  <img
                    src={MEMO_IMG}
                    alt="ตัวอย่างการพิมพ์ memo Wishyoulucky"
                    className="h-auto w-full object-contain"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
