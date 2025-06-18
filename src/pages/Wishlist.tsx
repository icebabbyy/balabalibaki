
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('wishlist')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfile(data);
        // Parse wishlist from string (comma-separated IDs) to array
        const wishlistIds = data.wishlist ? data.wishlist.split(',').filter(id => id.trim()) : [];
        await fetchWishlistProducts(wishlistIds);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistProducts = async (productIds) => {
    if (productIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      setWishlistItems(products || []);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      setWishlistItems([]);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      // Get current wishlist
      const currentWishlist = profile?.wishlist ? profile.wishlist.split(',').filter(id => id.trim()) : [];
      // Remove the item
      const updatedWishlist = currentWishlist.filter(id => id !== itemId.toString());
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({ wishlist: updatedWishlist.join(',') })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setWishlistItems(items => items.filter(item => item.id !== itemId));
      setProfile(prev => ({ ...prev, wishlist: updatedWishlist.join(',') }));
      
      toast.success('ลบออกจากรายการโปรดแล้ว');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
    }
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
                        <p className="font-bold text-purple-600 mt-1">฿{item.selling_price?.toLocaleString()}</p>
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
