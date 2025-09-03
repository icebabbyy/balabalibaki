import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    note?: string;
    email?: string;
    wantsEmail?: boolean;
  };
  totalPrice: number;
  shippingCost?: number;
};

type OrderForMail = {
  id: number;
  order_number: string;
  total_price: number | null;
  deposit: number | null;
  customer_email: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_note: string | null;
};

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState<PendingOrder | null>(null);
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipImageUrl, setSlipImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("kshop");

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

  /** base URL สำหรับ Netlify Functions
   * - ถ้ารันบน netlify.app / wishyoulucky.page -> เรียก relative path ได้เลย
   * - ถ้ารัน dev domain อื่น ๆ -> ยิงไปโปรดักชันของ netlify
   */
  const getFnBase = () => {
    const h = window.location.hostname;
    if (h.endsWith("netlify.app") || h.endsWith("wishyoulucky.page")) return "";
    return "https://wishyoulucky.netlify.app";
  };

  /** endpoint สำหรับส่งเมล (อนุญาต override ผ่าน env) */
  const EMAIL_ENDPOINT =
    (import.meta as any).env?.VITE_EMAIL_ENDPOINT ||
    `${getFnBase()}/.netlify/functions/send-order-received`;

  /** รวมยอดสินค้า (subtotal) จาก items ฝั่งหน้าเว็บ */
  const calcItemsSubtotal = (items: PendingOrder["items"]) =>
    items.reduce((sum, it) => sum + Number(it.selling_price || 0) * Number(it.quantity || 0), 0);

  /** ส่งอีเมลสรุปคำสั่งซื้อผ่าน Netlify Function */
  const sendOrderMail = async (
    ord: OrderForMail,
    items: PendingOrder["items"],
    method: PaymentMethod,
    shippingFee: number
  ) => {
    try {
      const paidAmount =
        typeof ord.deposit === "number" && ord.deposit > 0 && ord.total_price
          ? Math.min(ord.deposit, Number(ord.total_price))
          : Number(ord.total_price ?? 0);

      const subtotal = calcItemsSubtotal(items);
      const tax = 0; // ถ้ายังไม่มีภาษี ใส่ 0 ไปก่อน
      const toEmail =
        ord.customer_email ||
        orderData?.customerInfo.email ||
        ""; // เผื่อในคำสั่งซื้อไม่บันทึกอีเมล ให้ fallback จาก pendingOrder

      if (!toEmail) return; // ไม่มีอีเมล ไม่ต้องส่ง

      const resp = await fetch(EMAIL_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          // กันกดย้ำแล้วส่งซ้ำ
          "X-Idempotency-Key": String(ord.order_number || ord.id),
        },
        body: JSON.stringify({
          to: toEmail,
          order_id: ord.id,
          order_number: ord.order_number,
          subtotal,
          shipping_fee: shippingFee,
          tax,
          total_price: Number(ord.total_price ?? subtotal + shippingFee + tax),
          deposit: ord.deposit,
          paid_amount: paidAmount,
          payment_method: method,
          shipping_title: method === "kshop" ? "K SHOP QR" : "TrueMoney Wallet",
          customer: {
            name: ord.customer_name,
            phone: ord.customer_phone,
            address: ord.customer_address,
            note: ord.customer_note,
          },
          items: items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.selling_price,
            sku: (it as any).sku ?? null,
            image:
              (it as any).image ??
              (it as any).image_url ??
              (Array.isArray((it as any).images) ? (it as any).images[0]?.url : null) ??
              null,
          })),
        }),
      });

      if (!resp.ok) {
        const t = await resp.text().catch(() => "");
        console.warn("[send-order-received] non-200:", t || resp.status);
      }
    } catch (err) {
      console.warn("[send-order-received] failed:", err);
    }
  };

  const handleConfirmSlipUpload = async () => {
    if (!orderData) return toast.error("ไม่พบข้อมูลออเดอร์");
    if (!slipImage) return toast.error("กรุณาอัปโหลดสลิปก่อน");

    setIsProcessing(true);
    try {
      // 1) อัปโหลดสลิปไปที่ Storage
      const ext = slipImage.name.split(".").pop() || "jpg";
      const fileName = `order-${orderData.id}-${Date.now()}.${ext}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(filePath, slipImage, {
          contentType: slipImage.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

      const { data: urlData } = supabase.storage.from("payment-slips").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // 2) อัปเดต order + ดึงฟิลด์ที่ต้องใช้สำหรับอีเมล
      const { data: updated, error: updateError } = await supabase
        .from("orders")
        .update({
          payment_slip_url: publicUrl,
          payment_method: selectedMethod,
          status: "รอตรวจสอบ",
        })
        .eq("id", orderData.id)
        .select(
          "id, order_number, total_price, deposit, customer_email, customer_name, customer_phone, customer_address, customer_note"
        )
        .single<OrderForMail>();

      if (updateError || !updated) {
        throw new Error("บันทึกข้อมูลชำระเงินไม่สำเร็จ");
      }

      // 3) ส่งอีเมล (ถ้ามีอีเมล)
      const emailTo = updated.customer_email || orderData.customerInfo.email || "";
      if (emailTo) {
        await sendOrderMail(
          { ...updated, customer_email: emailTo },
          orderData.items,
          selectedMethod,
          orderData.shippingCost ?? 0
        );
      }

      // 4) เคลียร์ + เด้งไปหน้าขอบคุณ
      clearCart();
      localStorage.removeItem("pendingOrder");
      toast.success("ส่งสลิปเรียบร้อยแล้ว");

      const qOrder = encodeURIComponent(updated.order_number || "");
      const qEmail = encodeURIComponent(emailTo);
      navigate(`/thank-you?order=${qOrder}&email=${qEmail}`);
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

        <h1 className="text-3xl font-bold text-center mb-8">เลือกช่องทางการชำระเงิน</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <OrderSummary
            orderData={{
              items: orderData.items,
              customerInfo: orderData.customerInfo,
              totalPrice: orderData.totalPrice,
              shippingCost: orderData.shippingCost ?? 0,
            }}
          />

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
                <p className="font-semibold mb-2">1. สแกน QR Code เพื่อชำระเงิน</p>
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
                <label htmlFor="slipUpload" className="cursor-pointer flex flex-col items-center">
                  {slipImageUrl ? (
                    <img
                      src={slipImageUrl}
                      alt="ตัวอย่างสลิป"
                      className="max-h-64 rounded-md object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="font-medium text-purple-600">คลิกเพื่ออัปโหลด</span>
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
