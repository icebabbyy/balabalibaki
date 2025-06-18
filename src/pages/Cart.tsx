import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: ""
  });

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (id: number) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("ตะกร้าสินค้าว่างเปล่า");
      return;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // Save order info and redirect to payment
    const orderData = {
      items: cartItems,
      customerInfo,
      totalPrice: getTotalPrice(),
      orderDate: new Date().toISOString()
    };
    
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    window.location.href = '/payment';
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">ตะกร้าสินค้า</h1>
            <p className="text-gray-600 mb-8">ตะกร้าสินค้าของคุณว่างเปล่า</p>
            <Link to="/categories">
              <Button 
                style={{ backgroundColor: '#956ec3' }}
                className="text-white hover:opacity-90"
              >
                เลือกซื้อสินค้า
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">ตะกร้าสินค้า</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">รายการสินค้า</h2>
                
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b py-4 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <p className="text-lg font-bold" style={{ color: '#956ec3' }}>
                          ฿{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>รวมทั้งหมด:</span>
                    <span style={{ color: '#956ec3' }}>฿{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Customer Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">ข้อมูลการจัดส่ง</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ-นามสกุล *
                    </label>
                    <Input
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="กรุณากรอกชื่อ-นามสกุล"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ *
                    </label>
                    <Input
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="กรุณากรอกเบอร์โทรศัพท์"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่อยู่จัดส่ง *
                    </label>
                    <Textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder="กรุณากรอกที่อยู่จัดส่ง"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมายเหตุ
                    </label>
                    <Textarea
                      value={customerInfo.note}
                      onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                      placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                      rows={2}
                    />
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    className="w-full text-white hover:opacity-90"
                    style={{ backgroundColor: '#956ec3' }}
                    size="lg"
                  >
                    ดำเนินการชำระเงิน
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
