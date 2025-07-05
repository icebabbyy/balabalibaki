import React, { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ShoppingCart, User, Heart, Package, LogOut, Search, FileQuestion, Truck, Undo2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type for Category data
interface Category {
  id: number;
  name: string;
  image?: string;
}

// Component for each item in the Category mega menu
const CategoryListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { image?: string }
>(({ className, title, image, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "flex items-center space-x-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100",
            className
          )}
          {...props}
        >
          {image && <img src={image} alt={title || ''} className="h-10 w-10 object-cover rounded-md flex-shrink-0" />}
          <div className="text-sm font-medium leading-tight text-gray-900">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
CategoryListItem.displayName = "CategoryListItem";

// Component for each item in the Help dropdown
const HelpListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { icon: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    ref={ref}
                    className={cn(
                        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100',
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center gap-3">
                        {/* Use the correct theme color for the icon */}
                        <div style={{ color: '#a475c9' }}>{icon}</div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{title}</div>
                            <p className="text-sm text-gray-500">{children}</p>
                        </div>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    );
});
HelpListItem.displayName = 'HelpListItem';

const Header = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, image')
        .order('homepage_order', { ascending: true })
        .limit(11); 
      
      if (error) {
        console.error("Error fetching categories for menu:", error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, role, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('ออกจากระบบเรียบร้อยแล้ว');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDisplayName = () => {
    if (profile?.username) return profile.username;
    if (profile?.full_name) return profile.full_name;
    return user?.email?.split('@')[0] || 'ผู้ใช้';
  };

  const navLinkStyles = "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-white hover:bg-white/20 focus:bg-white/20 focus:outline-none";
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(navLinkStyles, isActive && "bg-white/20");

  const navTriggerClass = cn(navLinkStyles, "data-[state=open]:bg-white/20");

  return (
    <header className="text-white shadow-lg sticky top-0 z-50" style={{ backgroundColor: '#a475c9' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold hover:text-purple-200 transition-colors shrink-0">
              LuckyShop
            </Link>
            
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavLink to="/" className={navLinkClass}>
                    หน้าแรก
                  </NavLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={navTriggerClass}>
                    หมวดหมู่สินค้า
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories.map((category) => (
                        <CategoryListItem
                          key={category.id}
                          title={category.name}
                          href={`/categories?category=${encodeURIComponent(category.name)}`}
                          image={category.image}
                        />
                      ))}
                       <li className="col-span-1 md:col-span-2">
                         <NavigationMenuLink asChild>
                           <Link
                            to="/categories"
                            className="flex h-full w-full select-none flex-col items-center justify-center rounded-md p-4 text-white no-underline outline-none transition-transform hover:scale-105 focus:shadow-md"
                            style={{ backgroundColor: '#a475c9' }}
                           >
                             <div className="text-base font-bold">
                               ดูหมวดหมู่ทั้งหมด <ArrowRight className="inline-block h-4 w-4" />
                             </div>
                           </Link>
                         </NavigationMenuLink>
                       </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavLink to="/reviews" className={navLinkClass}>
                      รีวิว
                  </NavLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={navTriggerClass}>
                    FAQ/Help
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                     <ul className="grid w-[300px] gap-3 p-4">
                        <HelpListItem to="/qa" title="คำถามที่พบบ่อย" icon={<FileQuestion size={20}/>}>
                          ตอบทุกข้อสงสัยเกี่ยวกับการสั่งซื้อ
                        </HelpListItem>
                        <HelpListItem to="/how-to-order" title="วิธีการสั่งซื้อ" icon={<ShoppingCart size={20}/>}>
                          ขั้นตอนการสั่งซื้อง่ายๆ
                        </HelpListItem>
                        <HelpListItem to="/shipping" title="การจัดส่ง" icon={<Truck size={20}/>}>
                          รายละเอียดและค่าบริการจัดส่ง
                        </HelpListItem>
                        <HelpListItem to="/returns" title="การคืนสินค้า" icon={<Undo2 size={20}/>}>
                          นโยบายการคืนสินค้าและเงื่อนไข
                        </HelpListItem>
                     </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                 <NavigationMenuItem>
                    <NavLink to="/order-status" className={navLinkClass}>
                        เช็คสถานะ
                    </NavLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all rounded-full px-4"
                />
                <Button type="submit" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full text-white hover:bg-purple-700" style={{ backgroundColor: '#a475c9' }}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cart')}
              className="text-white hover:bg-white/20 relative rounded-full"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 px-1.5 h-5 flex items-center justify-center text-xs rounded-full"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white z-50">
                   <DropdownMenuItem disabled>
                    <span className="font-semibold truncate text-gray-800">สวัสดี, {getDisplayName()}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>แผงควบคุม</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} size="sm" className="hidden md:inline-flex text-white hover:bg-purple-700" style={{ backgroundColor: '#a475c9' }}>
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
