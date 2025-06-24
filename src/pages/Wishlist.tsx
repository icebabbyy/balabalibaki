// src/pages/Wishlist.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProductPublic } from "@/types/product";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistProducts, setWishlistProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeWishlist = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        toast.error("กรุณาเข้าสู่ระบบเพื่อดูรายการโปรด");
        setLoading(false);
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      await fetchWishlistProducts(session.user.id);
      setLoading(false);
    };

    initializeWishlist();
  }, [navigate]);

  const fetchWishlistProducts = async (userId: string) => {
    try {
      // 1. ดึง ID สินค้าทั้งหมดจาก wishlist ของ user คนนี้
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('wishlist_items')
        .select('products(*)') // ใช้ Join เพื่อดึงข้อมูลสินค้ามาพร้อมกันเลย
        .eq('user_id', userId);

      if (wishlistError) throw wishlistError;

      // 2. จัดรูปแบบข้อมูลให้ตรงกับ ProductPublic
      const mappedProducts: ProductPublic[] = (wishlistItems || []).map(item => {
        const product = item.products;
        return {
          id: product.id || 0,
          name: product.name || '',
          selling_price: product.selling_price || 0,
          category: product.category || '',
          description: product.description || '',
          image: product.image || '',
          product_status: product.product_status || 'พรีออเดอร์',
          sku: product.sku || '',
          quantity: product.quantity || 0,
          shipment_date: product.shipment_date || '',
          options: product.options || null,
          product_type: product.product_type || 'ETC',
          created_at: product.created_at || '',
          updated_at: product.updated_at || '',
          product_images: product.product_images || []
        };
      });
      
      setWishlistProducts(mappedProducts);

    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดรายการโปรด');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }
    
    try {
      // สั่งลบแถวที่ตรงกับ user_id และ product_id
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .match({ user_id: user.id, product_id: productId });
      
      if (error) throw error;
      
      // อัปเดตหน้าเว็บทันทีโดยไม่ต้องโหลดใหม่
      setWishlistProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('ลบออกจากรายการโปรดแล้ว');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const addToCart = (product: ProductPublic) => {
    // ฟังก์ชันนี้ทำงานกับ localStorage เหมือนเดิม ถูกต้องแล้ว
    const cartItem = { id: product.id, name: product.name, price: product.selling_price, image: product.image, quantity: 1, sku: product.sku, variant: null, product_type: product.product_type || 'ETC' };
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id);
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลดรายการโปรด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">รายการสินค้าที่ถูกใจ</h1>
        
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">ยังไม่มีสินค้าที่ถูกใจ</p>
            <Button onClick={() => navigate('/categories')}>เลือกซื้อสินค้า</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-48 object-cover rounded-lg cursor-pointer" onClick={() => navigate(`/product/${product.id}`)} />
                    <Button variant="outline" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full" onClick={() => removeFromWishlist(product.id)}>
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <h3 className="font-semibold mb-2 cursor-pointer hover:text-purple-600 line-clamp-2" onClick={() => navigate(`/product/${product.id}`)}>
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold text-purple-600 mb-3">
                    ฿{product.selling_price.toLocaleString()}
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => navigate(`/product/${product.id}`)}>ดูรายละเอียด</Button>
                    <Button variant="outline" className="w-full" onClick={() => addToCart(product)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      เพิ่มลงตะกร้า
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
