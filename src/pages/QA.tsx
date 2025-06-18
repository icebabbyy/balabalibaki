
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Phone, Mail, Clock } from "lucide-react";

const QA = () => {
  const faqs = [
    {
      question: "จะสั่งซื้อสินค้าได้อย่างไร?",
      answer: "คุณสามารถสั่งซื้อผ่านเว็บไซต์ของเราหรือติดต่อผ่าน Facebook Page ของ Lucky Shop ได้โดยตรง"
    },
    {
      question: "รับชำระเงินด้วยวิธีไหนบ้าง?",
      answer: "เรารับชำระเงินผ่านการโอนเงินผ่านธนาคาร, PromptPay, และบัตรเครดิต"
    },
    {
      question: "ใช้เวลาในการจัดส่งนานแค่ไหน?",
      answer: "ระยะเวลาการจัดส่งขึ้นอยู่กับประเภทสินค้า โดยทั่วไปจะใช้เวลา 3-7 วันทำการสำหรับสินค้าที่มีในสต็อก"
    },
    {
      question: "สามารถเปลี่ยน/คืนสินค้าได้หรือไม่?",
      answer: "สามารถเปลี่ยน/คืนสินค้าได้ภายใน 7 วัน หากสินค้ามีปัญหาหรือไม่ตรงตามที่สั่ง"
    },
    {
      question: "จะติดตามพัสดุได้อย่างไร?",
      answer: "หลังจากจัดส่งสินค้าแล้ว เราจะส่งเลขติดตามพัสดุให้ผ่านทาง LINE หรือ Facebook"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">คำถามที่พบบ่อย (Q&A)</h1>
          <p className="text-gray-600">รวมคำถามและคำตอบที่ลูกค้าถามบ่อย</p>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2" style={{ color: '#956ec3' }}>
              <MessageCircle className="h-5 w-5" />
              <span>คำถามยอดนิยม</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: '#956ec3' }}>ติดต่อเรา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-2" style={{ color: '#956ec3' }} />
                <h3 className="font-semibold mb-1">โทรศัพท์</h3>
                <p className="text-gray-600">02-XXX-XXXX</p>
              </div>
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-2" style={{ color: '#956ec3' }} />
                <h3 className="font-semibold mb-1">อีเมล</h3>
                <p className="text-gray-600">info@luckyshop.com</p>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: '#956ec3' }} />
                <h3 className="font-semibold mb-1">เวลาทำการ</h3>
                <p className="text-gray-600">จันทร์-ศุกร์ 9:00-18:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QA;
