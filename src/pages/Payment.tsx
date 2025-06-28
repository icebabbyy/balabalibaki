import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✨ 1. นำเข้า useNavigate
import { supabase } from "@/integrations/supabase/client"; // ✨ 1. นำเข้า supabase client
import Header from "@/components/Header";
import OrderSummary from "@/components/payment/OrderSummary";
import PaymentInfo from "@/components/payment/PaymentInfo";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderSubmission } from "@/hooks/useOrderSubmission";
import { calculateShipping } from "@/utils/shippingCalculator";
import { User } from "@supabase/supabase-js"; // ✨ 1. นำเข้า type User

const Payment = () => {
  const { orderData } = useOrderData();
  const { submitting, handleSubmitOrder } = useOrderSubmission();
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>("");
  const navigate = useNavigate(); // ✨ 2. สร้าง instance ของ navigate

  // ✨ 3. สร้าง state เพื่อเก็บข้อมูล user ที่ล็อกอิน
  const [user, setUser] = useState<User | null>(null);

  // ✨ 4. ใช้ useEffect เพื่อเช็คสถานะล็อกอินเมื่อเปิดหน้านี้
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUserSession();
  }, []);


  if (!orderData) {
    return (
      // ... (ส่วน Loading เหมือนเดิม) ...
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  const shippingCost = calculateShipping(orderData.items);
  const totalWithShipping = orderData.totalPrice + shippingCost;

  // ✨ 5. แก้ไขฟังก์ชัน onSubmitOrder ให้ฉลาดขึ้น
  const onSubmitOrder = async () => {
    const updatedOrderData = {
      ...orderData,
      shippingCost,
      totalPrice: totalWithShipping
    };

    // เราจะรอให้การ submit สำเร็จก่อน แล้วค่อย navigate
    // สมมติว่า handleSubmitOrder จะ return true เมื่อสำเร็จ
    const success = await handleSubmitOrder(updatedOrderData, paymentSlipUrl);

    if (success) {
      // หลังจากจ่ายเงินสำเร็จแล้ว ให้เช็คว่ามี user ล็อกอินอยู่หรือไม่
      if (user) {
        // ถ้ามี user (ล็อกอินอยู่) ให้ไปที่หน้าประวัติการสั่งซื้อ
        navigate('/order-history'); 
        console.log('User detected, navigating to order history.');
      } else {
        // ถ้าไม่มี user (เป็น guest) ให้ไปที่หน้าเช็คสถานะเหมือนเดิม
        // เราอาจจะส่ง orderId ไปกับ state เพื่อให้หน้า status แสดงข้อมูลได้ทันที
        const orderId = orderData.id; // สมมติว่ามี order id
        navigate(`/order-status?order_id=${orderId}`); 
        console.log('Guest detected, navigating to order status.');
      }
    }
    // ถ้าไม่ success, hook useOrderSubmission ควรจะแสดง toast error เอง
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">ชำระเงิน</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrderSummary orderData={{...orderData, shippingCost, totalPrice: totalWithShipping}} />
          
          <PaymentInfo
            totalPrice={totalWithShipping}
            paymentSlipUrl={paymentSlipUrl}
            onSlipUploaded={setPaymentSlipUrl}
            onSubmitOrder={onSubmitOrder}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;
