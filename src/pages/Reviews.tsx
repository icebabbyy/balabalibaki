
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ThumbsUp } from "lucide-react";

const Reviews = () => {
  const reviews = [
    {
      id: 1,
      customer: "น้องแนท",
      product: "Kuromi Limited Edition",
      rating: 5,
      comment: "สินค้าน่ารักมากค่ะ คุณภาพดี บรรจุภัณฑ์ก็เรียบร้อย แนะนำเลย!",
      date: "2024-01-15",
      images: ["/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png"]
    },
    {
      id: 2,
      customer: "คุณสมใจ",
      product: "Gwen Statue Collection",
      rating: 5,
      comment: "ได้ของแล้ว ชอบมากค่ะ รายละเอียดสวยงาม มาครบตามที่สั่ง ขอบคุณร้าน Lucky Shop ค่ะ",
      date: "2024-01-12",
      images: []
    },
    {
      id: 3,
      customer: "น้องมิ้น",
      product: "Sanrio Mystery Box",
      rating: 4,
      comment: "กล่องสุ่มสนุกดี ได้ตัวที่ชอบ แต่อยากให้มีตัวเลือกมากกว่านี้",
      date: "2024-01-10",
      images: []
    }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">รีวิวจากลูกค้า</h1>
          <p className="text-gray-600">ความคิดเห็นและรีวิวจากลูกค้าจริง</p>
        </div>

        {/* Summary */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex justify-center items-center space-x-1 mb-2">
                  {renderStars(5)}
                </div>
                <h3 className="text-2xl font-bold" style={{ color: '#956ec3' }}>4.8/5</h3>
                <p className="text-gray-600">คะแนนเฉลี่ย</p>
              </div>
              <div>
                <Heart className="h-8 w-8 mx-auto mb-2" style={{ color: '#956ec3' }} />
                <h3 className="text-2xl font-bold" style={{ color: '#956ec3' }}>127</h3>
                <p className="text-gray-600">รีวิวทั้งหมด</p>
              </div>
              <div>
                <ThumbsUp className="h-8 w-8 mx-auto mb-2" style={{ color: '#956ec3' }} />
                <h3 className="text-2xl font-bold" style={{ color: '#956ec3' }}>98%</h3>
                <p className="text-gray-600">ความพึงพอใจ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.customer}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <Badge variant="secondary">{review.product}</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{review.comment}</p>
                
                {review.images.length > 0 && (
                  <div className="flex space-x-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`รีวิวภาพที่ ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-8" style={{ borderColor: '#956ec3' }}>
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#956ec3' }}>
              แชร์ประสบการณ์ของคุณ
            </h3>
            <p className="text-gray-600 mb-4">
              เราอยากฟังความคิดเห็นจากคุณ มาแชร์รีวิวสินค้าที่ซื้อกับเรากัน
            </p>
            <p className="text-sm text-gray-500">
              ส่งรีวิวผ่าน Facebook Page หรือ LINE ของเรา
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reviews;
