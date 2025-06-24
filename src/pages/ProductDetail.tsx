import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// เพิ่ม Heart icon เข้ามาใน import
import { ArrowLeft, ShoppingCart, Package, Calendar, Truck, CreditCard, Clock, Heart } from "lucide-react"; 
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import RichTextEditor from "@/components/RichTextEditor";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // --- State ใหม่สำหรับ Wishlist ---
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);


  useEffect(() => {
    // เปลี่ยนชื่อฟังก์ชันเพื่อให้สื่อความหมายมากขึ้น
    const checkUserAndFetchData = async () => {
      // ดึงข้อมูล User ที่ login อยู่
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (id) {
        const productId = parseInt(id, 10);
        if (!isNaN(productId)) {
          // ใช้ await เพื่อให้แน่ใจว่าโหลดข้อมูลสินค้าเสร็จก่อน
          await fetchProduct(productId);
          await fetchProductImages(productId);
          
          // หลังจากดึงข้อมูลสินค้าแล้ว ให้เช็คสถานะ Wishlist ถ้ามี user login อยู่
          if (currentUser) {
            await checkWishlistStatus(currentUser.id, productId);
          }
        }
      }
      // เมื่อทุกอย่างเสร็จสิ้น ให้หยุดการ loading ของปุ่ม wishlist
      setIsWishlistLoading(false);
    };

    checkUserAndFetchData();
  }, [id]);

  // --- ฟังก์ชันสำหรับเช็คสถานะ Wishlist ---
  const checkWishlistStatus = async (userId: string, productId: number) => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = a row was not found
        throw error;
      }
      
      setIsInWishlist(!!data); // ถ้ามี data (ไม่เป็น null) แปลว่าอยู่ใน Wishlist แล้ว
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  // --- ฟังก์ชันสำหรับ เพิ่ม/ลบ Wishlist ---
  const toggleWishlist = async () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อใช้งาน Wishlist");
      navigate('/login');
      return;
    }
    if (!product) return;

    setIsWishlistLoading(true);

    try {
      if (isInWishlist) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        const { error } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setIsInWishlist(false);
        toast.success("ลบออกจากรายการโปรดแล้ว");
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้าไป
        const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setIsInWishlist(true);
        toast.success("เพิ่มในรายการโปรดแล้ว");
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const fetchProduct = async (productId: number) => {
    // ไม่มีการแก้ไขฟังก์ชันนี้
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) {
        console.error('Error fetching product:', error);
        toast.error('ไม่พบสินค้าที่ต้องการ');
        navigate('/');
        return;
      }
      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productId: number) => {
    // ไม่มีการแก้ไขฟังก์ชันนี้
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('order', { ascending: true });
      if (error) {
        console.error('Error fetching product images:', error);
        return;
      }
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const addToCart = () => {
    // ไม่มีการแก้ไขฟังก์ชันนี้
    if (!product) return;
    if (product.options && !selectedVariant) {
      toast.error('กรุณาเลือกตัวเลือกสินค้า');
      return;
    }
    const cartItem = {
      id: product.id, name: product.name, price: product.selling_price,
      image: variantImage || product.image, quantity: quantity, sku: product.sku,
      variant: selectedVariant || null, product_type: product.product_type || 'ETC'
    };
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === cartItem.id && item.variant === cartItem.variant
    );
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  const buyNow = () => {
    // ไม่มีการแก้ไขฟังก์ชันนี้
    if (!product) return;
    if (product.options && !selectedVariant) {
      toast.error('กรุณาเลือกตัวเลือกสินค้า');
      return;
    }
    const cartItem = {
      id: product.id, name: product.name, price: product.selling_price,
      image: variantImage || product.image, quantity: quantity, sku: product.sku,
      variant: selectedVariant || null, product_type: product.product_type || 'ETC'
    };
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === cartItem.id && item.variant === cartItem.variant
    );
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    navigate('/cart');
  };

  const getStatusColor = (status: string) => {
    // ไม่มีการแก้ไขฟังก์ชันนี้
    switch (status) {
      case 'พรีออเดอร์': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'พร้อมส่ง': return 'bg-green-100 text-green-800 border-green-200';
      case 'สินค้าหมด': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    // ไม่มีการแก้ไขส่วนนี้
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูลสินค้า...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    // ไม่มีการแก้ไขส่วนนี้
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">ไม่พบสินค้า</h2>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับหน้าแรก
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const additionalImageUrls = images
  .map(img => img.image_url)
  .filter(url => url !== product.image);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ProductBreadcrumb category={product.category} productName={product.name} />
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="max-w-[700px]">
              <ProductImageGallery mainImage={product.image} additionalImages={additionalImageUrls} productName={product.name} variantImage={variantImage} />
            </div>

            <div className="space-y-6">
              <div>
                {/* --- ส่วนที่แก้ไข: เพิ่มปุ่มหัวใจ --- */}
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleWishlist}
                    disabled={isWishlistLoading}
                    className="text-gray-400 hover:text-red-500 rounded-full"
                  >
                    <Heart 
                      className={`h-7 w-7 transition-all duration-200 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500 fill-transparent'}`} 
                    />
                  </Button>
                </div>
                {/* --- จบส่วนที่แก้ไข --- */}
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">หมวดหมู่:</span>
                    <span className="font-medium text-purple-600">{product.category}</span>
                  </div>
                  <div className="bg-white rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {product.product_status === 'พรีออเดอร์' ? (
                            <Clock className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Package className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">สถานะสินค้า:</span>
                        </div>
                        <Badge className={`${getStatusColor(product.product_status)} font-medium`}>
                          {product.product_status}
                        </Badge>
                      </div>
                    </div>
                    {product.shipment_date && (
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">กำหนดส่ง:</span>
                        <span className="text-sm text-blue-600 font-medium">
                          {new Date(product.shipment_date).toLocaleDateString('th-TH', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                  </div>
                </div>
              </div>

              <div className="text-3xl font-bold text-purple-600">
                ฿{product.selling_price?.toLocaleString()}
              </div>

              {product.options && (
                <ProductVariantSelector
                  options={product.options}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                  onVariantImageChange={setVariantImage}
                  productImages={images}
                />
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  จำนวน
                </label>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}> - </Button>
                  <span className="px-4 py-2 border rounded text-center min-w-[60px]">{quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}> + </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={buyNow} className="w-full py-3 text-lg" style={{ backgroundColor: '#956ec3' }} disabled={product.product_status === 'สินค้าหมด'}>
                  <CreditCard className="h-5 w-5 mr-2" />
                  {product.product_status === 'สินค้าหมด' ? 'สินค้าหมด' : 'ซื้อเดี๋ยวนี้'}
                </Button>
                <Button onClick={addToCart} variant="outline" className="w-full py-3 text-lg border-purple-600 text-purple-600 hover:bg-purple-50" disabled={product.product_status === 'สินค้าหมด'}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  เพิ่มลงตะกร้า
                </Button>
              </div>

              {product.shipping_fee && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">ค่าจัดส่ง</p>
                        <p className="text-sm text-gray-600">{product.shipping_fee}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {product.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>รายละเอียดสินค้า</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      value={product.description}
                      onChange={() => {}}
                      onSave={() => {}}
                      onCancel={() => {}}
                      isEditing={false}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
