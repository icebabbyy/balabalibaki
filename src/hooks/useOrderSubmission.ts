
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useOrderSubmission = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitOrder = async (orderData: any, paymentSlipUrl: string) => {
    if (!orderData) {
      toast.error("ไม่พบข้อมูลคำสั่งซื้อ");
      return;
    }

    if (!paymentSlipUrl) {
      toast.error("กรุณาอัพโหลดสลิปการโอนเงิน");
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Submitting order:', orderData);
      
      // Prepare order items for database
      const orderItems = orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
        product_type: item.product_type || 'ETC',
        variant: item.variant || null
      }));

      // Create order in database
      const { data, error } = await supabase
        .from('orders')
        .insert({
          username: orderData.customerInfo.name,
          items: orderItems,
          total_selling_price: orderData.totalPrice,
          shipping_cost: orderData.shippingCost || 0,
          address: `${orderData.customerInfo.address}${orderData.customerInfo.note ? ` (หมายเหตุ: ${orderData.customerInfo.note})` : ''}`,
          status: 'รอตรวจสอบการชำระเงิน',
          order_date: new Date().toISOString(),
          payment_slip_url: paymentSlipUrl,
        })
        .select();

      if (error) {
        console.error('Error creating order:', error);
        toast.error(`เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: ${error.message}`);
        return;
      }

      console.log('Order created successfully:', data);

      // Clear cart and pending order
      localStorage.removeItem('cart');
      localStorage.removeItem('pendingOrder');
      
      toast.success("ส่งคำสั่งซื้อเรียบร้อยแล้ว รอการตรวจสอบจากเจ้าหน้าที่");
      
      // Redirect to order status page
      setTimeout(() => {
        window.location.href = '/order-status';
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmitOrder };
};
