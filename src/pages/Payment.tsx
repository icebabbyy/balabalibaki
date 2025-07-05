import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import OrderSummary from '@/components/payment/OrderSummary';
import jsQR from 'jsqr'; // Library สำหรับอ่าน QR Code

const Payment = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipImageUrl, setSlipImageUrl] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // โหลดข้อมูลออเดอร์ที่รอชำระเงินจาก localStorage
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder));
    } else {
      // ถ้าไม่เจอ ให้กลับไปหน้าแรก
      toast.error("ไม่พบข้อมูลออเดอร์ที่จะชำระเงิน");
      navigate('/');
    }
  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQrData(null); // รีเซ็ตข้อมูล QR เก่าทุกครั้งที่เลือกรูปใหม่
      setSlipImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSlipImageUrl(imageUrl);
        // เมื่อรูปโหลดเสร็จ ให้ทำการสแกน QR Code
        scanQrCode(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanQrCode = (imageUrl: string) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !context) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
      const imageData = context.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        setQrData(code.data);
        toast.success("สแกน QR Code สำเร็จ!");
      } else {
        setQrData(null);
        toast.error("ไม่พบ QR Code ในรูปภาพนี้ กรุณาลองใหม่อีกครั้ง");
      }
    };
    img.src = imageUrl;
  };
  
  const handleConfirmPayment = async () => {
    if (!qrData) {
      return toast.error("ไม่สามารถยืนยันได้เนื่องจากไม่พบข้อมูล QR Code");
    }
    if (!orderData) {
        return toast.error("ไม่พบข้อมูลออเดอร์");
    }

    setIsVerifying(true);

    try {
        // แยกข้อมูลจาก QR Code (ตัวอย่างสำหรับ KBank)
        const transRef = qrData.substring(0, 15);
        const sendingBank = "004"; // รหัสธนาคารกสิกรไทย

        // เรียกใช้ Supabase Function ที่เราสร้างไว้
        const { data: verificationResult, error } = await supabase.functions.invoke('verify-slip', {
            body: { qrData, sendingBank, transRef },
        });

        if (error) throw error;

        // ตรวจสอบผลลัพธ์จาก KBank
        if (verificationResult.data?.state === 'SUCCESS') {
            const amountFromSlip = parseFloat(verificationResult.data.amount);
            if(amountFromSlip === orderData.totalPrice) {
                toast.success("ตรวจสอบสลิปสำเร็จ! ยอดชำระถูกต้อง");
                
                // *** ส่วนสำคัญ: สร้างออเดอร์จริงในฐานข้อมูล ***
                const { error: createOrderError } = await supabase.functions.invoke('create_order', {
                    body: orderData
                });

                if (createOrderError) throw createOrderError;

                toast.success("สร้างออเดอร์ของคุณเรียบร้อยแล้ว!");
                localStorage.removeItem('pendingOrder');
                navigate('/order-history');

            } else {
                toast.error(`ยอดชำระไม่ถูกต้อง! ยอดในสลิป: ${amountFromSlip} ยอดที่ต้องชำระ: ${orderData.totalPrice}`);
            }
        } else {
            toast.error(`การตรวจสอบสลิปไม่สำเร็จ: ${verificationResult.data?.state || 'ไม่ทราบสาเหตุ'}`);
        }

    } catch (error: any) {
        console.error("Verification error:", error);
        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
        setIsVerifying(false);
    }
  };


  if (!orderData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Canvas นี้จำเป็นสำหรับการอ่าน QR Code แต่จะถูกซ่อนไว้ */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">ยืนยันการชำระเงิน</h1>
        <p className="text-center text-gray-500 mb-8">กรุณาอัปโหลดสลิปการโอนเงินเพื่อตรวจสอบ</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side: Order Summary */}
          <OrderSummary orderData={orderData} />

          {/* Right Side: Slip Upload & Verification */}
          <Card>
            <CardHeader>
              <CardTitle>อัปโหลดสลิป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="slipUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="slipUpload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {slipImageUrl ? (
                    <img src={slipImageUrl} alt="ตัวอย่างสลิป" className="max-h-64 rounded-md object-contain" />
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="font-medium text-purple-600">คลิกเพื่ออัปโหลด</span>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                    </>
                  )}
                </label>
              </div>

              {qrData && (
                 <div className="p-3 bg-green-50 text-green-800 rounded-md flex items-center gap-3">
                    <CheckCircle className="h-5 w-5"/>
                    <p className="text-sm font-medium">สแกน QR Code สำเร็จ</p>
                 </div>
              )}
              
              <Button 
                onClick={handleConfirmPayment}
                className="w-full text-lg py-6" 
                disabled={!slipImage || !qrData || isVerifying}
              >
                {isVerifying ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                )}
                {isVerifying ? 'กำลังตรวจสอบ...' : 'ยืนยันการชำระเงิน'}
              </Button>
              <p className="text-xs text-center text-gray-500">
                หลังจากยืนยันการชำระเงิน เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 24 ชั่วโมง
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
// Note: The code above is a React component for a payment page that allows users to upload a slip image, scans the QR code from the image, and verifies the payment using Supabase Functions. It includes error handling and user feedback through toast notifications. The component also uses a canvas to read the QR code from the uploaded image.
// The `jsQR` library is used to decode the QR code from the image data.