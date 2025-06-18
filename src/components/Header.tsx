
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, Menu, X, Settings } from "lucide-react";

interface HeaderProps {
  user?: any;
  onSignOut?: () => void;
}

const Header = ({ user, onSignOut }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email === 'admin@luckyshop.com' || user?.user_metadata?.role === 'admin';

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  // Get display name - prefer username or full_name over email
  const getDisplayName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    return user?.email || '';
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
              {/* Show admin link only for admin users */}
              {user && isAdmin && (
                <Button
                  onClick={handleAdminClick}
                  variant="ghost"
                  className={`hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium text-white hover:bg-white hover:bg-opacity-20 ${
                    isActive('/admin') ? 'bg-white bg-opacity-20 text-white' : ''
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  ระบบหลังบ้าน
                </Button>
              )}
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
                <span className="text-sm font-medium text-white">สวัสดี, {getDisplayName()}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleProfileClick}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  title="จัดการโปรไฟล์"
                >
                  <User className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSignOut}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  ออกจากระบบ
                </Button>
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
              {/* Show admin link only for admin users in mobile */}
              {user && isAdmin && (
                <button
                  onClick={() => {
                    handleAdminClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  ระบบหลังบ้าน
                </button>
              )}
              {user && (
                <button
                  onClick={() => {
                    handleProfileClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left hover:text-gray-200 transition-colors px-3 py-2 rounded font-medium"
                >
                  จัดการโปรไฟล์
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
