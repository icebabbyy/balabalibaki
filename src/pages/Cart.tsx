// src/pages/Cart.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useCart } from "@/hooks/useCart";
import type { ProductPublic } from "@/types/product";

type CartItem = ProductPublic & { quantity: number };

type CustomerInfo = {
  name: string;
  phone: string;
  address: string;
  note: string;
  email: string;
  wantsEmail: boolean;
};

const genOrderNumber = () => {
  const now = new Date(); // ถ้าอยากล็อกเป็นเวลาไทย: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  // ชุดอักขระอ่านง่าย (ตัด O/0, I/1 ออก)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }

  return `WLK-${yy}${mm}${dd}${rand}`;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeItem, totalPrice } = useCart();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    note: "",
    email: "",
    wantsEmail: true,
  });

  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Prefill จาก session (ชื่อ/ที่อยู่จาก profiles ถ้ามี, อีเมลจาก auth)
  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession();
      if (sessErr) console.warn("[auth.getSession] error:", sessErr);

      const initial: Partial<CustomerInfo> = {};

      if (session?.user) {
        setIsLoggedIn(true);
        if (session.user.email) initial.email = session.user.email;

        const { data, error } = await supabase
          .from("profiles")
          .select("id,username,phone,address")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!error && data) {
          setProfileId(data.id);
          initial.name = data.username || "";
          initial.phone = data.phone || "";
          initial.address = data.address || "";
        } else if (error) {
          console.warn("[profiles.prefill] error:", error);
        }
      } else {
        setIsLoggedIn(false);
      }

      setCustomerInfo((prev) => ({ ...prev, ...initial }));
    })();
  }, []);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("ตะกร้าว่าง");
      return;
    }
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.email) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (!validatePhone(customerInfo.phone)) {
      toast.error("เบอร์โทรต้องเป็นตัวเลข 10 หลัก");
      return;
    }
    if (!emailRegex.test(customerInfo.email)) {
      toast.error("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    setSubmitting(true);

    try {
      // เอา session/uid มาใช้ครั้งเดียว
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      // อัปเดตโปรไฟล์ถาวร (เฉพาะตอนล็อกอินและติ๊ก checkbox)
      if (updateProfile && profileId && userId) {
        const { error: upErr } = await supabase
          .from("profiles")
          .update({
            username: customerInfo.name,
            phone: customerInfo.phone,
            address: customerInfo.address,
          })
          .eq("id", profileId);
        if (upErr) throw upErr;
      }

      // เตรียม payload ใส่ลง orders
      const itemsPayload = cartItems.map((it: CartItem) => ({
        product_id: it.id,
        sku: it.sku ?? null,
        name: it.name,
        image: (it as any).image ?? (it as any).image_url ?? null,
        quantity: it.quantity,
        selling_price: it.selling_price,
        product_type: (it as any).product_type ?? null,
      }));

      const orderNumber = genOrderNumber();

      // ประกอบแถวที่จะ insert — ใส่ user_id เฉพาะตอนล็อกอิน
      const row: any = {
        order_number: orderNumber,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        customer_note: customerInfo.note || null,
        customer_email: customerInfo.email,
        subtotal: totalPrice,
        shipping_cost: 0,
        total_price: totalPrice,
        status: "pending_payment",
        items: itemsPayload,
        order_date: new Date().toISOString(),
      };
      if (userId) row.user_id = userId; // สำคัญ: guest จะไม่ส่ง user_id

      const { data: inserted, error: insErr } = await supabase
        .from("orders")
        .insert(row)
        .select("id")
        .single();

      if (insErr) {
        // แยกข้อความ error ให้เข้าใจง่ายขึ้น
        const code = (insErr as any).code;
        const details = (insErr as any).details || "";
        const hint = (insErr as any).hint || "";
        console.error("[orders.insert] error:", insErr);

        if (code === "42501") {
          // RLS บล็อก
          toast.error("สร้างออเดอร์ไม่สำเร็จ: ถูกบล็อกโดยนโยบายความปลอดภัย (RLS)");
        } else if ((insErr as any).status === 401) {
          toast.error("ไม่ผ่านการอนุญาต (401) — ตรวจค่า VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
        } else {
          toast.error(`สร้างออเดอร์ไม่สำเร็จ: ${details || insErr.message || "unknown error"}`);
        }
        return;
      }

      // เก็บข้อมูลสำหรับหน้าชำระเงิน
      const pendingOrder = {
        id: inserted!.id,
        items: cartItems.map((it) => ({ ...it })),
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          note: customerInfo.note,
          email: customerInfo.email,
          wantsEmail: customerInfo.wantsEmail,
        },
        totalPrice,
        shippingCost: 0,
      };
      localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

      navigate("/payment");
    } catch (e: any) {
      console.error("[handleCheckout] catch:", e);
      toast.error(e?.message || "สร้างออเดอร์ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-xl mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">ตะกร้าสินค้า</h1>
          <p className="mb-8">ยังไม่มีสินค้าในตะกร้า</p>
          <Link to="/categories">
            <Button style={{ backgroundColor: "#956ec3", color: "#fff" }}>
              เลือกซื้อสินค้า
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ตะกร้าสินค้า</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={(item as any).image ?? (item as any).image_url ?? ""}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        ฿{(item.selling_price * item.quantity).toLocaleString()}
                      </p>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeItem(item.id)}
                        className="mt-2"
                      >
                        <Trash2 className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t font-bold text-xl">
                  <span>รวมทั้งหมด</span>
                  <span>฿{totalPrice.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">ข้อมูลจัดส่ง</h2>

                <Input
                  placeholder="อีเมล (สำหรับแจ้งเตือนสถานะ/อัพเดต)"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value.trim() })
                  }
                />
                <div className="flex items-center gap-2 text-sm">
                  <input
                    id="wantsEmail"
                    type="checkbox"
                    checked={customerInfo.wantsEmail}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, wantsEmail: e.target.checked })
                    }
                  />
                  <label htmlFor="wantsEmail">รับอัพเดตสถานะ/แจ้งเตือนทางอีเมล</label>
                </div>

                <Input
                  placeholder="ชื่อ-นามสกุล"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                />
                <Input
                  placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                  value={customerInfo.phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setCustomerInfo({ ...customerInfo, phone: v });
                  }}
                />
                <Textarea
                  placeholder="ที่อยู่จัดส่ง"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                />
                <Textarea
                  placeholder="หมายเหตุเพิ่มเติม"
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                />

                {isLoggedIn && profileId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        id="updateProfile"
                        type="checkbox"
                        checked={updateProfile}
                        onChange={() => setUpdateProfile(!updateProfile)}
                      />
                      <label htmlFor="updateProfile" className="text-sm font-medium">
                        อัปเดตข้อมูลในโปรไฟล์ถาวร
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      {updateProfile
                        ? "ข้อมูลจะถูกบันทึกในโปรไฟล์สำหรับการสั่งซื้อครั้งต่อไป"
                        : "ใช้ข้อมูลเฉพาะครั้งนี้"}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleCheckout}
                  className="w-full py-3 text-lg"
                  style={{ backgroundColor: "#956ec3", color: "#fff" }}
                  disabled={submitting}
                >
                  {submitting ? "กำลังสร้างออเดอร์..." : "ดำเนินการชำระเงิน"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
