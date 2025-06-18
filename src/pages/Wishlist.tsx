
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Mock wishlist data for now
      setWishlistItems([
        {
          id: 1,
          name: "Nikke - Goddess of Victory Figure",
          price: "฿2,500",
          image: "/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png",
          category: "Nikke"
        },
        {
          id: 2,
          name: "Honkai: Star Rail - Kafka Figure",
          price: "฿3,200",
          image: "/lovable-uploads/3a94bca0-09e6-4f37-bfc1-d924f4dc55b1.png",
          category: "Honkai: Star Rail"
        }
      ]);
      setLoading(false);
    }
  }, [user]);

  const removeFromWishlist = (itemId) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId));
    toast.success('ลบออกจากรายการโปรดแล้ว');
  };

  const addToCart = (item) => {
    toast.success(`เพิ่ม ${item.name} ลงในตะกร้าแล้ว`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดรายการโปรด...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <span>รายการโปรด</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่มีสินค้าในรายการโปรด</h3>
                  <p className="text-gray-500">เพิ่มสินค้าที่คุณชอบลงในรายการโปรดเพื่อติดตามได้ง่าย</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="font-bold text-purple-600 mt-1">{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => addToCart(item)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          เพิ่มลงตะกร้า
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
