
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, Menu, X, Settings, Package, Heart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Fetch user profile to get username
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
        .select('username, role')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if user is admin - consistent with Auth.tsx and Admin.tsx
  const isAdmin = user?.email === 'wishyouluckyshop@gmail.com' || profile?.role === 'admin';

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  // Get display name - show username only, fallback to email username part
  const getDisplayName = () => {
    if (profile?.username) {
      return profile.username;
    }
    return user?.email?.split('@')[0] || 'ผู้ใช้';
  };

  return (
    <header 
      className="text-white shadow-lg sticky top-0 z-50"
      style={{ background: 'linear-gradient(to right, #956ec3, #a576c9)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/ecaac6f9-54fc-484a-b4fa-bfb1cd61c348.png" 
                alt="Lucky Shop Logo" 
                className="h-12 w-auto"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
              >
                หน้าแรก
              </Link>
              <Link 
                to="/categories" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/categories') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
              >
                หมวดหมู่
              </Link>
              <Link 
                to="/order-status" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/order-status') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
              >
                เช็คสถานะสินค้า
              </Link>
              <Link 
                to="/qa" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/qa') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
              >
                Q&A
              </Link>
              <Link 
                to="/reviews" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/reviews') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
              >
                รีวิว
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                className="w-64 px-4 py-2 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 border border-white border-opacity-30"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:bg-opacity-20">
                <ShoppingCart className="h-6 w-6" />
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">{getDisplayName()}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      <User className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleProfileClick}>
                      <User className="h-4 w-4 mr-2" />
                      ข้อมูลโปรไฟล์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/order-history')}>
                      <Package className="h-4 w-4 mr-2" />
                      ประวัติการสั่งซื้อ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="h-4 w-4 mr-2" />
                      รายการโปรด
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Settings className="h-4 w-4 mr-2" />
                          ระบบหลังบ้าน
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleProfileClick}
                className="text-white hover:bg-white hover:bg-opacity-20"
                title="เข้าสู่ระบบ"
              >
                <User className="h-6 w-6" />
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-white border-opacity-30">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                หน้าแรก
              </Link>
              <Link 
                to="/categories" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/categories') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                หมวดหมู่
              </Link>
              <Link 
                to="/order-status" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/order-status') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                เช็คสถานะสินค้า
              </Link>
              <Link 
                to="/qa" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/qa') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Q&A
              </Link>
              <Link 
                to="/reviews" 
                className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/reviews') ? 'bg-white bg-opacity-20 text-white' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                รีวิว
              </Link>
              {user && (
                <>
                  <button
                    onClick={() => {
                      handleProfileClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium"
                  >
                    ข้อมูลโปรไฟล์
                  </button>
                  <button
                    onClick={() => {
                      navigate('/order-history');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium"
                  >
                    ประวัติการสั่งซื้อ
                  </button>
                  <button
                    onClick={() => {
                      navigate('/wishlist');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium"
                  >
                    รายการโปรด
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      ระบบหลังบ้าน
                    </button>
                  )}
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
