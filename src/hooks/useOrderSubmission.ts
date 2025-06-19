
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useOrderSubmission = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitOrder = async (orderData: any, paymentSlipUrl: string) => {
    console.log('handleSubmitOrder called with:', { orderData, paymentSlipUrl });
    
    if (!orderData) {
      console.error('No order data provided');
      toast.error("ไม่พบข้อมูลคำสั่งซื้อ");
      return;
    }

    if (!paymentSlipUrl || paymentSlipUrl.trim() === '') {
      console.error('No payment slip URL provided');
      toast.error("กรุณาอัพโหลดสลิปการโอนเงิน");
      return;
    }

    if (!orderData.items || orderData.items.length === 0) {
      console.error('No items in order');
      toast.error("ไม่พบสินค้าในคำสั่งซื้อ");
      return;
    }

    if (!orderData.customerInfo || !orderData.customerInfo.name || !orderData.customerInfo.phone || !orderData.customerInfo.address) {
      console.error('Incomplete customer info');
      toast.error("ข้อมูลลูกค้าไม่ครบถ้วน");
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Submitting order to database:', orderData);
      
      // Prepare order items for database
      const orderItems = orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku || '',
        image: item.image || ''
      }));

      console.log('Prepared order items:', orderItems);

      // Create order in database
      const orderPayload = {
        username: orderData.customerInfo.name,
        items: orderItems,
        total_selling_price: orderData.totalPrice,
        address: `${orderData.customerInfo.address}${orderData.customerInfo.note ? ` (หมายเหตุ: ${orderData.customerInfo.note})` : ''}`,
        status: 'รอตรวจสอบการชำระเงิน',
        order_date: new Date().toISOString(),
        payment_slip_url: paymentSlipUrl,
      };

      console.log('Order payload:', orderPayload);

      const { data, error } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select();

      if (error) {
        console.error('Supabase error creating order:', error);
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
      toast.error("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmitOrder };
};
