
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data - in real app, fetch based on id
  const product = {
    id: parseInt(id) || 1,
    name: "Kuromi Limited Edition Figure",
    price: 2500,
    originalPrice: 3000,
    discount: 17,
    rating: 4.8,
    reviews: 124,
    stock: 15,
    description: "ฟิกเกอร์ Kuromi ขนาดจิ๋ว คุณภาพพรีเมียม ลิมิเต็ดเอดิชั่น ไม่ควรพลาด! ผลิตจากวัสดุคุณภาพสูง รายละเอียดสวยงาม เหมาะสำหรับคอลเลกเตอร์และแฟน Sanrio",
    images: [
      "/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png",
      "/lovable-uploads/487f8c60-99c5-451d-a44f-f637d86b3b11.png"
    ],
    category: "Figures",
    brand: "Sanrio",
    tags: ["Limited Edition", "Kuromi", "Figure", "Collectible"]
  };

  const handleAddToCart = () => {
    toast({
      title: "เพิ่มลงตะกร้าแล้ว",
      description: `${product.name} จำนวน ${quantity} ชิ้น`,
    });
  };

  const handleBuyNow = () => {
    // Navigate to payment page with product info
    window.location.href = `/payment?product=${product.id}&quantity=${quantity}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-purple-600">หน้าแรก</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-purple-600">หมวดหมู่</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-gray-600 ml-2">({product.reviews} รีวิว)</span>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold" style={{ color: '#956ec3' }}>
                  ฿{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ฿{product.originalPrice.toLocaleString()}
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      -{product.discount}%
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-gray-600">คงเหลือ {product.stock} ชิ้น</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">รายละเอียดสินค้า</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold mb-2">แท็ก</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">จำนวน:</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="flex-1"
                      style={{ borderColor: '#956ec3', color: '#956ec3' }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      เพิ่มลงตะกร้า
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1"
                      style={{ backgroundColor: '#956ec3' }}
                    >
                      ซื้อเลย
                    </Button>
                  </div>

                  <Button variant="ghost" className="w-full text-gray-600">
                    <Heart className="h-4 w-4 mr-2" />
                    เพิ่มลงรายการโปรด
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link to="/categories">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปหมวดหมู่
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
