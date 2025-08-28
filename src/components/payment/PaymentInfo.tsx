import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentSlipUpload from "@/components/PaymentSlipUpload";

interface PaymentInfoProps {
  totalPrice: number;
  paymentSlipUrl: string;
  onSlipUploaded: (url: string) => void;
  onSubmitOrder: () => void;
  submitting: boolean;
  /** เบอร์โทร valid ไหม (ส่งมาจากหน้าพ่อที่เก็บฟอร์มลูกค้า) */
  phoneValid?: boolean;
}

const PaymentInfo = ({
  totalPrice,
  paymentSlipUrl,
  onSlipUploaded,
  onSubmitOrder,
  submitting,
  phoneValid = true, // default = true เพื่อไม่พังกับหน้าที่ไม่ได้ส่งค่าเข้ามา
}: PaymentInfoProps) => {
  const disableSubmit = !paymentSlipUrl || submitting || !phoneValid;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">ข้อมูลการชำระเงิน</h2>

        <div className="mb-6">
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-purple-800 mb-2">โอนเงินผ่าน QR Code</h3>
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">QR Code การชำระเงิน</span>
              </div>
              <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงิน</p>
              <p className="font-bold text-lg" style={{ color: "#956ec3" }}>
                ยอดชำระ: ฿{totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {!phoneValid && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
              กรุณากรอกเบอร์โทรให้ถูกต้องเป็นตัวเลข 10 หลัก ก่อนยืนยันการชำระเงิน
            </div>
          )}
        </div>

        <div className="space-y-4">
          <PaymentSlipUpload onSlipUploaded={onSlipUploaded} currentSlip={paymentSlipUrl} />

          <Button
            onClick={onSubmitOrder}
            disabled={disableSubmit}
            className="w-full text-white hover:opacity-90"
            style={{ backgroundColor: "#956ec3" }}
            size="lg"
          >
            {submitting ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันการชำระเงิน"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            หลังจากยืนยันการชำระเงิน เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 24 ชั่วโมง
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfo;
