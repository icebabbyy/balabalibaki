
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WishlistProduct {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  image: string;
  sku: string;
  status: string;
}

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

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
        const wishlistIds = data.wishlist ? data.wishlist.split(',').filter((id: string) => id.trim()) : [];
        await fetchWishlistProducts(wishlistIds);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistProducts = async (productIds: string[]) => {
    if (productIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    try {
      // Convert string IDs to numbers for the query
      const numericIds = productIds.map(id => parseInt(id)).filter(id => !isNaN(id));
      
      const { data: products } = await supabase
        .from('public_products')
        .select('*')
        .in('id', numericIds);

      if (products) {
        setWishlistItems(products);
      }
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      setWishlistItems([]);
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    try {
      // Get current wishlist
      const currentWishlist = profile?.wishlist ? profile.wishlist.split(',').filter((id: string) => id.trim()) : [];
      // Remove the item
      const updatedWishlist = currentWishlist.filter((id: string) => id !== itemId.toString());
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({ wishlist: updatedWishlist.join(',') })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setWishlistItems(items => items.filter(item => item.id !== itemId));
      setProfile((prev: any) => ({ ...prev, wishlist: updatedWishlist.join(',') }));
      
      toast.success('ลบออกจากรายการโปรดแล้ว');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  const addToCart = (item: WishlistProduct) => {
    try {
      const cart = localStorage.getItem('cart');
      let cartItems = cart ? JSON.parse(cart) : [];
      
      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex((cartItem: any) => cartItem.id === item.id);
      
      if (existingItemIndex > -1) {
        // Item exists, increase quantity
        cartItems[existingItemIndex].quantity += 1;
      } else {
        // New item, add to cart
        cartItems.push({
          id: item.id,
          name: item.name,
          price: item.selling_price,
          quantity: 1,
          image: item.image,
          sku: item.sku
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      toast.success(`เพิ่ม ${item.name} ลงในตะกร้าแล้ว`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
    }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="font-bold text-purple-600 text-lg">฿{item.selling_price?.toLocaleString()}</p>
                        <div className="flex items-center justify-between pt-2">
                          <Button
                            onClick={() => addToCart(item)}
                            className="bg-purple-600 hover:bg-purple-700 flex-1 mr-2"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            เพิ่มลงตะกร้า
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
