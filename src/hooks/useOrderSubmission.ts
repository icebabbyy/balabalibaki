// src/hooks/useOrderSubmission.ts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

// ✨ 1. ทำให้ Hook รับ "user" เข้ามาได้
export const useOrderSubmission = (user: User | null) => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmitOrder = async (orderData: any, paymentSlipUrl: string) => {
    setSubmitting(true);
    
    // สร้าง object สำหรับบันทึกลง orders
    const orderToSubmit = {
      user_id: user?.id, // ถ้ามี user ให้ใส่ user_id, ถ้าไม่ก็เป็น null
      customer_details: orderData.customerInfo,
      items: orderData.items,
      total_price: orderData.totalPrice,
      shipping_cost: orderData.shippingCost,
      payment_slip_url: paymentSlipUrl,
      status: 'รอตรวจสอบ', // สถานะเริ่มต้น
      // ... field อื่นๆ ของออเดอร์
    };

    try {
      // เรียกใช้ RPC function 'create_order' ใน Supabase
      const { data, error } = await supabase.rpc('create_order', { order_data: orderToSubmit });

      if (error) {
        throw error;
      }
      
      toast.success('ส่งข้อมูลการชำระเงินสำเร็จ!');
      
      // ล้างตะกร้าสินค้าหลังจากสั่งซื้อสำเร็จ
      localStorage.removeItem('cart');
      localStorage.removeItem('orderData');

      // ✨ 2. ย้าย Logic การนำทางมาไว้ที่นี่
      if (user) {
        // ถ้าเป็น User ที่ล็อกอิน, ไปที่หน้าประวัติการสั่งซื้อ
        navigate('/order-history');
      } else {
        // ถ้าเป็น Guest, ไปที่หน้าเช็คสถานะ
        // อาจจะส่ง ID ของออเดอร์ที่เพิ่งสร้างไปด้วยก็ได้
        const newOrderId = data; // สมมติว่า RPC return id กลับมา
        navigate(`/order-status?order_id=${newOrderId}`);
      }
      
      return true; // คืนค่าว่าสำเร็จ

    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล', { description: error.message });
      return false; // คืนค่าว่าล้มเหลว
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmitOrder };
};
