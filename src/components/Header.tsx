
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";

interface HeaderProps {
  user?: any;
  onSignOut?: () => void;
}

const Header = ({ user, onSignOut }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email === 'admin@luckyshop.com' || user?.user_metadata?.role === 'admin';

  return (
    <header className="bg-gradient-to-r from-purple-200 to-purple-300 text-gray-800 shadow-lg sticky top-0 z-50">
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
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/') ? 'bg-purple-200 text-purple-800' : ''
                }`}
              >
                หน้าแรก
              </Link>
              <Link 
                to="/categories" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/categories') ? 'bg-purple-200 text-purple-800' : ''
                }`}
              >
                หมวดหมู่
              </Link>
              <Link 
                to="/order-status" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/order-status') ? 'bg-purple-200 text-purple-800' : ''
                }`}
              >
                เช็คสถานะสินค้า
              </Link>
              <Link 
                to="/qa" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/qa') ? 'bg-purple-200 text-purple-800' : ''
                }`}
              >
                Q&A
              </Link>
              <Link 
                to="/reviews" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/reviews') ? 'bg-purple-200 text-purple-800' : ''
                }`}
              >
                รีวิว
              </Link>
              {/* Show admin link only for admin users */}
              {user && isAdmin && (
                <Link 
                  to="/admin" 
                  className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                    isActive('/admin') ? 'bg-purple-200 text-purple-800' : ''
                  }`}
                >
                  แอดมิน
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                className="w-64 px-4 py-2 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-200"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Button variant="ghost" size="icon" className="text-gray-800 hover:bg-purple-200">
              <ShoppingCart className="h-6 w-6" />
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">สวัสดี, {user.email}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSignOut}
                  className="text-gray-800 hover:bg-purple-200"
                >
                  ออกจากระบบ
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="text-gray-800 hover:bg-purple-200">
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-800 hover:bg-purple-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-purple-300">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/') ? 'bg-purple-200 text-purple-800' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                หน้าแรก
              </Link>
              <Link 
                to="/categories" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/categories') ? 'bg-purple-200 text-purple-800' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                หมวดหมู่
              </Link>
              <Link 
                to="/order-status" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/order-status') ? 'bg-purple-200 text-purple-800' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                เช็คสถานะสินค้า
              </Link>
              <Link 
                to="/qa" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/qa') ? 'bg-purple-200 text-purple-800' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Q&A
              </Link>
              <Link 
                to="/reviews" 
                className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                  isActive('/reviews') ? 'bg-purple-200 text-purple-800' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                รีวิว
              </Link>
              {/* Show admin link only for admin users in mobile */}
              {user && isAdmin && (
                <Link 
                  to="/admin" 
                  className={`hover:text-purple-700 transition-colors px-3 py-2 rounded font-medium ${
                    isActive('/admin') ? 'bg-purple-200 text-purple-800' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  แอดมิน
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
