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

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  variant?: string | null;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "", note: "" });
  const [updateProfile, setUpdateProfile] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = supabase.auth.user();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id,name,phone,address")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setProfileId(data.id);
          setCustomerInfo({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            note: ""
          });
        }
      }
    };
    loadUserProfile();
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = () => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const arr = JSON.parse(saved).filter((i: any) => i?.id && i?.price && i.quantity > 0);
        setCartItems(arr);
      }
    } catch {
      setCartItems([]);
      localStorage.removeItem("cart");
    }
  };

  const updateStorage = (items: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) return removeItem(id);
    const arr = cartItems.map(i => i.id === id ? { ...i, quantity: qty } : i);
    setCartItems(arr);
    updateStorage(arr);
    toast.success("อัพเดตจำนวนแล้ว");
  };

  const removeItem = (id: number) => {
    const arr = cartItems.filter(i => i.id !== id);
    setCartItems(arr);
    updateStorage(arr);
    toast.success("ลบสินค้าแล้ว");
  };

  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      return toast.error("กรุณากรอกข้อมูลให้ครบ");
    }
    if (cartItems.length === 0) return toast.error("ตะกร้าว่าง");

    // อัปเดตโปรไฟล์ถ้าเลือก
    if (updateProfile && profileId) {
      await supabase
        .from("profiles")
        .update({
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address
        })
        .eq("id", profileId);
    }

    const orderData = {
      items: cartItems,
      customerInfo,
      totalPrice,
      orderDate: new Date().toISOString()
    };
    localStorage.setItem("pendingOrder", JSON.stringify(orderData));
    navigate("/payment");
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
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded" />
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Button size="icon" onClick={() => updateQty(item.id, item.quantity - 1)}><Minus /></Button>
                          <span>{item.quantity}</span>
                          <Button size="icon" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus /></Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">฿{(item.price * item.quantity).toLocaleString()}</p>
                      <Button size="icon" variant="outline" onClick={() => removeItem(item.id)}>
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
                  placeholder="เบอร์โทรศัพท์"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
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

                {profileId && (
                  <div className="flex items-center space-x-2">
                    <input 
                      id="updateProfile" 
                      type="checkbox" 
                      checked={updateProfile} 
                      onChange={() => setUpdateProfile(!updateProfile)} 
                    />
                    <label htmlFor="updateProfile">อัปเดตที่อยู่ในโปรไฟล์</label>
                  </div>
                )}

                <Button onClick={handleCheckout} className="w-full py-3 text-lg" style={{ backgroundColor: "#956ec3", color: "#fff" }}>
                  ดำเนินการชำระเงิน
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
