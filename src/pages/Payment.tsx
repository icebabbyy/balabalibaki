
import { useState } from "react";
import Header from "@/components/Header";
import OrderSummary from "@/components/payment/OrderSummary";
import PaymentInfo from "@/components/payment/PaymentInfo";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderSubmission } from "@/hooks/useOrderSubmission";
import { calculateShipping } from "@/utils/shippingCalculator";

const Payment = () => {
  const { orderData } = useOrderData();
  const { submitting, handleSubmitOrder } = useOrderSubmission();
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>("");

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate shipping cost
  const shippingCost = calculateShipping(orderData.items);
  const totalWithShipping = orderData.totalPrice + shippingCost;

  const onSubmitOrder = () => {
    // Update order data with shipping cost before submission
    const updatedOrderData = {
      ...orderData,
      shippingCost,
      totalPrice: totalWithShipping
    };
    handleSubmitOrder(updatedOrderData, paymentSlipUrl);
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
