
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Heart, Search, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, getDisplayName } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    updateCartCount();
    
    // Listen for cart updates
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const updateCartCount = () => {
    try {
      const cart = localStorage.getItem('cart');
      const cartItems = cart ? JSON.parse(cart) : [];
      const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error updating cart count:', error);
      setCartCount(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Check if user is admin
  const isAdmin = user?.email === 'wishyouluckyshop@gmail.com' || profile?.role === 'admin';

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold" style={{ color: '#956ec3' }}>
              Lucky Shop
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
                  style={{ backgroundColor: '#956ec3' }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/categories">
              <Button variant="ghost" className="text-gray-700 hover:text-purple-600">
                สินค้า
              </Button>
            </Link>
            
            <Link to="/how-to-order">
              <Button variant="ghost" className="text-gray-700 hover:text-purple-600">
                วิธีสั่งซื้อ
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                    style={{ backgroundColor: '#956ec3' }}
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {loading ? (
              <Button variant="ghost" size="icon" disabled>
                <User className="h-5 w-5" />
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden lg:inline">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {getDisplayName()}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      โปรไฟล์
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      รายการโปรด
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/order-history" className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      ประวัติการสั่งซื้อ
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          ระบบแอดมิน
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button style={{ backgroundColor: '#956ec3' }}>
                  เข้าสู่ระบบ
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
                  style={{ backgroundColor: '#956ec3' }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2 px-2">
              <Link 
                to="/categories" 
                className="block py-2 text-gray-700 hover:text-purple-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                สินค้า
              </Link>
              <Link 
                to="/how-to-order" 
                className="block py-2 text-gray-700 hover:text-purple-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                วิธีสั่งซื้อ
              </Link>
              
              <Link 
                to="/cart" 
                className="flex items-center py-2 text-gray-700 hover:text-purple-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                ตะกร้า
                {cartCount > 0 && (
                  <Badge 
                    className="ml-2"
                    style={{ backgroundColor: '#956ec3' }}
                  >
                    {cartCount}
                  </Badge>
                )}
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="py-2 text-sm font-medium text-gray-900">
                      {getDisplayName()}
                    </div>
                    <div className="py-1 text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block py-2 text-gray-700 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    โปรไฟล์
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="block py-2 text-gray-700 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    รายการโปรด
                  </Link>
                  <Link 
                    to="/order-history" 
                    className="block py-2 text-gray-700 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ประวัติการสั่งซื้อ
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="block py-2 text-gray-700 hover:text-purple-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ระบบแอดมิน
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-2 text-gray-700 hover:text-purple-600"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: '#956ec3' }}
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
