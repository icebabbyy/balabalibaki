
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartItemCount(totalItems);
      } catch {
        setCartItemCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Navigation items
  const navItems = [
    { label: "หน้าแรก", path: "/" },
    { label: "สินค้าทั้งหมด", path: "/categories" },
    { label: "วิธีการสั่งซื้อ", path: "/how-to-order" },
    { label: "การจัดส่ง", path: "/shipping" },
    { label: "คำถามที่พบบ่อย", path: "/qa" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0" onClick={closeMenu}>
            <h1 className="text-2xl font-bold text-purple-600">YourShop</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </form>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  ออกจากระบบ
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="p-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-around py-2">
                  
                  {user && (
                    <Link to="/wishlist" onClick={closeMenu}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        รายการโปรด
                      </Button>
                    </Link>
                  )}

                  <Link to="/cart" onClick={closeMenu}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
                      <ShoppingCart className="h-4 w-4" />
                      ตะกร้า
                      {cartItemCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                          {cartItemCount > 99 ? "99+" : cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  {user ? (
                    <div className="flex items-center gap-2">
                      <Link to="/profile" onClick={closeMenu}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          โปรไฟล์
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link to="/auth" onClick={closeMenu}>
                      <Button variant="outline" size="sm">
                        เข้าสู่ระบบ
                      </Button>
                    </Link>
                  )}
                </div>

                {user && (
                  <div className="px-3 py-2">
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                      ออกจากระบบ
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
