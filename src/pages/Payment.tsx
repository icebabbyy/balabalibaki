
import { useState } from "react";
import Header from "@/components/Header";
import OrderSummary from "@/components/payment/OrderSummary";
import PaymentInfo from "@/components/payment/PaymentInfo";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderSubmission } from "@/hooks/useOrderSubmission";

const Payment = () => {
  const { orderData } = useOrderData();
  const { submitting, handleSubmitOrder } = useOrderSubmission();
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>("");

  const onSubmitOrder = () => {
    handleSubmitOrder(orderData, paymentSlipUrl);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">ชำระเงิน</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrderSummary orderData={orderData} />
          
          <PaymentInfo
            totalPrice={orderData.totalPrice}
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
