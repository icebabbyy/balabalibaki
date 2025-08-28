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

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeItem, totalPrice, clearCart } = useCart();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsLoggedIn(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id,username,phone,address")
          .eq("id", session.user.id)
          .single();

        if (!error && data) {
          setProfileId(data.id);
          setCustomerInfo({
            name: data.username || "",
            phone: data.phone || "",
            address: data.address || "",
            note: "",
          });
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    loadUserProfile();
  }, []);

  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("ตะกร้าว่าง");
      return;
    }
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (!validatePhone(customerInfo.phone)) {
      toast.error("เบอร์โทรต้องเป็นตัวเลข 10 หลัก");
      return;
    }

    setSubmitting(true);

    try {
      // อัปเดตโปรไฟล์ (ถ้าเลือก)
      if (updateProfile && profileId) {
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
        id: it.id,
        sku: it.sku,
        name: it.name,
        image: it.image,
        quantity: it.quantity,
        selling_price: it.selling_price,
        product_type: it.product_type,
      }));

      const { data: inserted, error: insErr } = await supabase
        .from("orders")
        .insert({
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          customer_note: customerInfo.note || null,
          subtotal: totalPrice,
          shipping_cost: 0,
          total_price: totalPrice,
          status: "pending_payment",
          items: itemsPayload,          // jsonb
          order_date: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

      // เก็บข้อมูลสำหรับหน้าชำระเงิน
      const pendingOrder = {
        id: inserted.id,
        items: itemsPayload,
        customerInfo,
        totalPrice,
        shippingCost: 0,
      };
      localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

      // เคลียร์ตะกร้าแล้วพาไปชำระเงิน
      clearCart();
      navigate("/payment");
    } catch (e: any) {
      console.error("Insert order error:", e);
      toast.error("สร้างออเดอร์ไม่สำเร็จ");
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
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Button size="icon" variant="outline" onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}><Minus /></Button>
                          <span>{item.quantity}</span>
                          <Button size="icon" variant="outline" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus /></Button>
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
                      {updateProfile ? "ข้อมูลจะถูกบันทึกในโปรไฟล์สำหรับการสั่งซื้อครั้งต่อไป" : "ใช้ข้อมูลเฉพาะครั้งนี้"}
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
