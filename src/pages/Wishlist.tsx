import { use } from "react";
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
  const navigate = use();
  const [wishlistProducts, setWishlistProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistProducts();
  }, []);

  const fetchWishlistProducts = async () => {
    try {
      setLoading(true);
      const wishlistItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (wishlistItems.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('public_products')
        .select('*')
        .in('id', wishlistItems);

      if (error) {
        console.error('Error fetching wishlist products:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดรายการสินค้าที่ถูกใจ');
        return;
      }

      // Map the data to ProductPublic interface
      const mappedProducts: ProductPublic[] = (data || []).map(item => ({
        id: item.id || 0,
        name: item.name || '',
        selling_price: item.selling_price || 0,
        category: item.category || '',
        description: item.description || '',
        image: item.main_image_url || '',
        main_image_url: item.main_image_url || '',
        product_status: item.product_status || 'พรีออเดอร์',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        shipment_date: item.shipment_date || '',
        options: item.options || null,
        product_type: 'ETC', // Default since not in public_products
        created_at: '', // Default since not in public_products
        updated_at: '' // Default since not in public_products
      }));

      setWishlistProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดรายการสินค้าที่ถูกใจ');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId: number) => {
    const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updatedWishlist = currentWishlist.filter((id: number) => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    setWishlistProducts(prev => prev.filter(product => product.id !== productId));
    toast.success('ลบออกจากรายการสินค้าที่ถูกใจแล้ว');
  };

  const addToCart = (product: ProductPublic) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      image: product.image,
      quantity: 1,
      sku: product.sku,
      variant: null,
      product_type: product.product_type || 'ETC'
    };

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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดรายการสินค้าที่ถูกใจ...</p>
          </div>
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
            <Button onClick={() => navigate('/categories')}>
              เลือกซื้อสินค้า
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  
                  <h3 
                    className="font-semibold mb-2 cursor-pointer hover:text-purple-600 line-clamp-2"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <p className="text-xl font-bold text-purple-600 mb-3">
                    ฿{product.selling_price.toLocaleString()}
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      ดูรายละเอียด
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => addToCart(product)}
                    >
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
