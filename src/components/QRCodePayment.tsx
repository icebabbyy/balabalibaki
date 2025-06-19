
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodePaymentProps {
  amount: number;
  orderId: number;
  onPaymentConfirmed?: () => void;
}

const QRCodePayment = ({ amount, orderId, onPaymentConfirmed }: QRCodePaymentProps) => {
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Bank account details (example)
  const bankDetails = {
    bank: 'ธนาคารกสิกรไทย',
    accountNumber: '123-4-56789-0',
    accountName: 'Lucky Shop',
  };

  useEffect(() => {
    generateQRCode();
  }, [amount, orderId]);

  const generateQRCode = async () => {
    try {
      // For now, we'll use a placeholder QR code
      // In production, you would integrate with a real QR code generation service
      const qrData = `amount=${amount}&ref=${orderId}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      
      setQrCodeUrl(qrUrl);
      setQrCodeGenerated(true);
      
      // Mark QR as generated in database (you would call this via an API)
      console.log('QR Code generated for order:', orderId);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง QR Code');
    }
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    toast.success('คัดลอกเลขบัญชีแล้ว!');
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-payment-${orderId}.png`;
      link.click();
      toast.success('ดาวน์โหลด QR Code แล้ว!');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle style={{ color: '#956ec3' }}>
          ชำระเงินผ่าน QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        {qrCodeGenerated && qrCodeUrl && (
          <div className="text-center space-y-2">
            <img 
              src={qrCodeUrl} 
              alt="QR Code Payment" 
              className="w-64 h-64 mx-auto border rounded-lg shadow-md"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              ดาวน์โหลด QR Code
            </Button>
          </div>
        )}

        {/* Amount */}
        <div className="text-center bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">จำนวนเงินที่ต้องชำระ</p>
          <p className="text-2xl font-bold" style={{ color: '#956ec3' }}>
            ฿{amount.toLocaleString()}
          </p>
        </div>

        {/* Bank Details */}
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800">ข้อมูลบัญชีธนาคาร</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">ธนาคาร:</span> {bankDetails.bank}</p>
            <div className="flex items-center gap-2">
              <span className="font-medium">เลขบัญชี:</span>
              <span className="font-mono">{bankDetails.accountNumber}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAccountNumber}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p><span className="font-medium">ชื่อบัญชี:</span> {bankDetails.accountName}</p>
          </div>
        </div>

        {/* Reference Number */}
        <div className="text-center bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">หมายเลขอ้างอิง</p>
          <p className="font-mono font-bold text-blue-600">#{orderId}</p>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">วิธีการชำระเงิน</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>สแกน QR Code ด้วยแอปธนาคารของคุณ</li>
            <li>ตรวจสอบจำนวนเงินให้ถูกต้อง</li>
            <li>โอนเงินและบันทึกสลิป</li>
            <li>อัปโหลดสลิปการโอนเงินด้านล่าง</li>
          </ol>
        </div>

        {/* Success Message */}
        {onPaymentConfirmed && (
          <div className="text-center">
            <Button
              onClick={onPaymentConfirmed}
              className="flex items-center gap-2"
              style={{ backgroundColor: '#956ec3' }}
            >
              <CheckCircle className="h-4 w-4" />
              ยืนยันการชำระเงินแล้ว
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodePayment;
