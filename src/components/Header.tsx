
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Heart, Package, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Update cart count from localStorage
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const cartItems = JSON.parse(cart);
        const totalCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(totalCount);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();

    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('ออกจากระบบเรียบร้อยแล้ว');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  // Get display name - show username only, fallback to email username part
  const getDisplayName = () => {
    if (profile?.username && profile.username.trim() !== '') {
      return profile.username;
    }
    return user?.email?.split('@')[0] || 'ผู้ใช้';
  };

  return (
    <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="text-2xl font-bold cursor-pointer hover:text-purple-200 transition-colors"
            onClick={() => navigate('/')}
          >
            LuckyShop
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button
              onClick={() => navigate('/')}
              className="hover:text-purple-200 transition-colors"
            >
              หน้าแรก
            </button>
            <button
              onClick={() => navigate('/categories')}
              className="hover:text-purple-200 transition-colors"
            >
              หมวดหมู่สินค้า
            </button>
            <button
              onClick={() => navigate('/qa')}
              className="hover:text-purple-200 transition-colors"
            >
              Q&A
            </button>
            <button
              onClick={() => navigate('/order-status')}
              className="hover:text-purple-200 transition-colors"
            >
              เช็คสถานะ
            </button>
            <button
              onClick={() => navigate('/reviews')}
              className="hover:text-purple-200 transition-colors"
            >
              รีวิว
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/wishlist')}
                  className="text-white hover:bg-purple-700 hover:text-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/order-history')}
                  className="text-white hover:bg-purple-700 hover:text-white"
                >
                  <Package className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/cart')}
                  className="text-white hover:bg-purple-700 hover:text-white relative"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 flex items-center justify-center text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm">สวัสดี, {getDisplayName()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="text-white hover:bg-purple-700 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-white hover:bg-purple-700 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  {profile?.role === 'admin' && (
                    <Button
                      onClick={() => navigate('/admin')}
                      variant="secondary"
                      size="sm"
                      className="ml-2"
                    >
                      Admin
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {!user && (
              <Button
                onClick={() => navigate('/auth')}
                variant="secondary"
                size="sm"
              >
                เข้าสู่ระบบ
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
