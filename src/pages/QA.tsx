
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search } from "lucide-react";

const QA = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      question: "วิธีการสั่งซื้อสินค้าอย่างไร?",
      answer: "คุณสามารถเลือกสินค้าที่ต้องการ กดเพิ่มลงตะกร้า แล้วทำการชำระเงินได้เลย"
    },
    {
      question: "ระยะเวลาการจัดส่งใช้เวลานานแค่ไหน?",
      answer: "การจัดส่งใช้เวลา 3-7 วันทำการ ขึ้นอยู่กับตำแหน่งที่อยู่ของคุณ"
    },
    {
      question: "สามารถเปลี่ยน/คืนสินค้าได้หรือไม่?",
      answer: "สามารถเปลี่ยนหรือคืนสินค้าได้ภายใน 7 วัน หากสินค้ายังอยู่ในสภาพเดิม"
    },
    {
      question: "มีการรับประกันสินค้าหรือไม่?",
      answer: "สินค้าทุกชิ้นมีการรับประกัน 30 วัน สำหรับความเสียหายจากการผลิต"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">คำถามที่พบบ่อย (Q&A)</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="ค้นหาคำถาม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {filteredFaqs.map((faq, index) => (
            <Card key={index} className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ask Question Form */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-xl text-purple-800">ไม่พบคำตอบที่ต้องการ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คำถามของคุณ</label>
              <Input placeholder="พิมพ์คำถามที่นี่..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
              <Textarea placeholder="อธิบายรายละเอียดเพิ่มเติม..." rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              <Input type="email" placeholder="your@email.com" />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              ส่งคำถาม
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QA;
