import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  CheckCircle,
  Loader2,
  CreditCard,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OrderSummary from "@/components/payment/OrderSummary";
import type { ProductPublic } from "@/types/product";
import { useCart } from "@/hooks/useCart";

type PaymentMethod = "kshop" | "truemoney";

type PendingOrder = {
  id: number;
  items: Array<ProductPublic & { quantity: number }>;
  customerInfo: { name: string; phone: string; address: string; note?: string };
  totalPrice: number;
  shippingCost?: number;
};

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState<PendingOrder | null>(null);
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipImageUrl, setSlipImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("kshop");

  // โหลดออเดอร์ที่เพิ่งสร้างมาจาก localStorage
  useEffect(() => {
    const raw = localStorage.getItem("pendingOrder");
    if (!raw) {
      toast.error("ไม่พบข้อมูลออเดอร์ที่จะชำระเงิน");
      navigate("/cart");
      return;
    }
    try {
      const parsed: PendingOrder = JSON.parse(raw);
      if (!parsed?.id) throw new Error("pendingOrder ไม่มี id");
      setOrderData(parsed);
    } catch {
      toast.error("รูปแบบข้อมูลออเดอร์ไม่ถูกต้อง");
      navigate("/cart");
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setSlipImage(file);
    setSlipImageUrl(URL.createObjectURL(file));
  };

  const handleConfirmSlipUpload = async () => {
    if (!orderData) return toast.error("ไม่พบข้อมูลออเดอร์");
    if (!slipImage) return toast.error("กรุณาอัปโหลดสลิปก่อน");

    setIsProcessing(true);
    try {
      // 1) อัปโหลดสลิปขึ้น bucket
      const ext = slipImage.name.split(".").pop() || "jpg";
      const fileName = `order-${orderData.id}-${Date.now()}.${ext}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(filePath, slipImage, {
          contentType: slipImage.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        throw new Error("อัปโหลดสลิปไม่สำเร็จ");
      }

      const { data: urlData } = supabase.storage
        .from("payment-slips")
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // 2) UPDATE orders (เฉพาะฟิลด์ที่เกี่ยวกับการชำระเงิน)
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_slip_url: publicUrl,
          payment_method: selectedMethod,
          status: "รอตรวจสอบ",
        })
        .eq("id", orderData.id);

      if (updateError) {
        console.error(updateError);
        // ถ้าเจอ 401/42501 ส่วนใหญ่เป็น RLS block → ให้ดู SQL policy ด้านบน
        throw new Error(
          "บันทึกข้อมูลชำระเงินไม่สำเร็จ (ตรวจสิทธิ์ RLS หรือฟิลด์ที่อนุญาต)"
        );
      }

      // 3) เคลียร์ตะกร้า + ล้าง pendingOrder แล้วพาไปหน้า history
      clearCart();
      localStorage.removeItem("pendingOrder");
      toast.success("ส่งสลิปเรียบร้อยแล้ว");
      navigate("/order-history");
    } catch (e: any) {
      toast.error(e?.message || "เกิดข้อผิดพลาดระหว่างยืนยันการชำระเงิน");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate("/cart")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปตะกร้า
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">
          เลือกช่องทางการชำระเงิน
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* สรุปออเดอร์ */}
          <OrderSummary
            orderData={{
              items: orderData.items,
              customerInfo: orderData.customerInfo,
              totalPrice: orderData.totalPrice,
              shippingCost: orderData.shippingCost ?? 0,
            }}
          />

          {/* ช่องทางการชำระเงิน */}
          <Card>
            <CardHeader>
              <CardTitle>ช่องทางการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>ข้อควรระวัง:</strong> กรุณาพิมพ์ "Wishyoulucky"
                  ลงในช่องบันทึก ก่อนกดโอนเงินทุกครั้ง เพื่อป้องกันมิจฉาชีพ
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={selectedMethod === "kshop" ? "default" : "outline"}
                  onClick={() => setSelectedMethod("kshop")}
                  className="py-6"
                >
                  <CreditCard className="mr-2 h-5 w-5" /> QR Code (K SHOP)
                </Button>
                <Button
                  variant={selectedMethod === "truemoney" ? "default" : "outline"}
                  onClick={() => setSelectedMethod("truemoney")}
                  className="py-6"
                >
                  <DollarSign className="mr-2 h-5 w-5" /> TrueMoney Wallet
                </Button>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="font-semibold mb-2">
                  1. สแกน QR Code เพื่อชำระเงิน
                </p>
                <div className="w-full max-w-[280px] mx-auto">
                  {selectedMethod === "kshop" ? (
                    <img
                      src="https://tfwmvpvxilosiyewqjtk.supabase.co/storage/v1/object/public/public-assets/kbank.jpg"
                      alt="Kbank QR Code"
                      className="w-full h-auto object-contain border rounded-lg p-2 bg-white"
                    />
                  ) : (
                    <img
                      src="https://tfwmvpvxilosiyewqjtk.supabase.co/storage/v1/object/public/public-assets/true.jpg"
                      alt="TrueMoney QR Code"
                      className="w-full h-auto object-contain border rounded-lg p-2 bg-white"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <p className="font-semibold mb-4 -mt-2">2. อัปโหลดสลิปที่นี่</p>
                <input
                  type="file"
                  id="slipUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="slipUpload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {slipImageUrl ? (
                    <img
                      src={slipImageUrl}
                      alt="ตัวอย่างสลิป"
                      className="max-h-64 rounded-md object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="font-medium text-purple-600">
                        คลิกเพื่ออัปโหลด
                      </span>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                    </>
                  )}
                </label>
              </div>

              <Button
                onClick={handleConfirmSlipUpload}
                className="w-full text-lg py-6"
                disabled={!slipImage || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-5 w-5" />
                )}
                {isProcessing ? "กำลังส่งข้อมูล..." : "ยืนยันการชำระเงิน"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
