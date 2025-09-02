import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";


function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ThankYou() {
  const q = useQuery();
  const order = q.get("order") || "";   // order_number (optional)
  const email = q.get("email") || "";   // customer_email (optional)

  const mascot =
    import.meta.env.VITE_THANKYOU_MASCOT_URL ||
    "https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/product-images/temp/IMG_8776.PNG"; // เปลี่ยนเป็นรูปมาสคอตของร้านได้เลย

  const orderStatusLink =
    order && email
      ? `/order-status?order=${encodeURIComponent(order)}&email=${encodeURIComponent(email)}`
      : "/order-status";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <img
                src={mascot}
                alt="Wishyoulucky Mascot"
                className="w-40 h-40 rounded-xl object-cover shadow-sm"
              />

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl md:text-2xl font-bold">
                  🌷Thank you for shopping with Wishyoulucky&apos;s!✨
                </h1>
              </div>

              <p className="text-lg">
                💖 คำสั่งซื้อของคุณถูกบันทึกเรียบร้อยแล้วค่ะ
                <br />
                📩 กรุณาตรวจสอบรายละเอียดในอีเมลของคุณ
              </p>

              {order && (
                <p className="text-sm text-gray-500">
                  หมายเลขคำสั่งซื้อของคุณ: <span className="font-semibold">#{order}</span>
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Link to={orderStatusLink}>
                  <Button style={{ backgroundColor: "#956ec3", color: "#fff" }}>
                    ดูสถานะออเดอร์
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button variant="outline">เลือกซื้อสินค้าเพิ่ม</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
