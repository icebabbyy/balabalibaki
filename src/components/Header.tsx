
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Heart, Package, LogOut, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
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
    <header className="text-white shadow-lg sticky top-0 z-50" style={{ backgroundColor: '#a375c9' }}>
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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-white text-gray-900 placeholder-gray-500"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-purple-700"
                style={{ backgroundColor: '#a375c9' }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="flex items-center space-x-4">
            {user && (
              <>
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-purple-700 hover:text-white"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white">
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>จัดการโปรไฟล์</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                        <Heart className="mr-2 h-4 w-4" />
                        <span>รายการโปรด</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/order-history')}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>ประวัติการสั่งซื้อ</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>ออกจากระบบ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
