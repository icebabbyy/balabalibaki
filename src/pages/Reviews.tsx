
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Star } from "lucide-react";

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const reviews = [
    {
      id: 1,
      customerName: "สมชาย ใจดี",
      rating: 5,
      comment: "สินค้าคุณภาพดีมาก จัดส่งรวดเร็ว แนะนำเลยครับ",
      productName: "เสื้อยืดคุณภาพพรีเมียม",
      date: "2024-01-15",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      customerName: "สมหญิง รักช้อป",
      rating: 4,
      comment: "ของดี ราคาเหมาะสม แต่การจัดส่งช้าไปหน่อย",
      productName: "กระเป๋าสะพายหรู",
      date: "2024-01-10",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      customerName: "วิชัย ช้อปเปอร์",
      rating: 5,
      comment: "ประทับใจมากครับ สินค้าตรงตามที่โฆษณา จะซื้ออีก",
      productName: "นาฬิกาแฟชั่น",
      date: "2024-01-08",
      image: "/placeholder.svg"
    }
  ];

  const filteredReviews = reviews.filter(review => 
    review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

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
            <h1 className="text-xl font-bold">รีวิวจากลูกค้า</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="ค้นหารีวิว..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="border-purple-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">
                      {review.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{review.customerName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-purple-300 text-purple-600">
                  ยืนยันการซื้อ
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <img
                    src={review.image}
                    alt={review.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 mb-2">{review.productName}</p>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบรีวิวที่คุณต้องการ</p>
            <p className="text-gray-400">ลองเปลี่ยนคำค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
