import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product";
import { User } from "@supabase/supabase-js";

// UI Components
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import { ArrowLeft, ShoppingCart, CreditCard, Heart, Tag, Package, Clock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- State Management ---
  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // ใช้ View 'public_products' เพื่อดึงข้อมูลทั้งหมดในครั้งเดียว
        const { data, error } = await supabase
          .from('public_products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        
        const productData = data as ProductPublic;
        setProduct(productData);

        // หลังจากได้ข้อมูลสินค้าแล้ว ค่อยเช็คสถานะ user และ wishlist
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        if (currentUser && productData) {
          await checkWishlistStatus(currentUser.id, productData.id);
        } else {
          setIsWishlistLoading(false);
        }

      } catch (error) {
        console.error("Error fetching product detail:", error);
        navigate('/404'); // หากไม่พบสินค้า ให้ไปที่หน้า 404
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [slug, navigate]);

  // --- Wishlist Functions ---
  const checkWishlistStatus = async (userId: string, productId: number) => {
    setIsWishlistLoading(true);
    try {
      const { data, error } = await supabase.from('wishlist_items').select('id').eq('user_id', userId).eq('product_id', productId).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user || !product) {
      toast.info("กรุณาล็อกอินเพื่อใช้ฟังก์ชัน Wishlist");
      if (!user) navigate('/auth');
      return;
    }
    setIsWishlistLoading(true);
    try {
      if (isInWishlist) {
        await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
        setIsInWishlist(false);
        toast.success(`ลบ "${product.name}" ออกจาก Wishlist แล้ว`);
      } else {
        await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        setIsInWishlist(true);
        toast.success(`เพิ่ม "${product.name}" เข้าสู่ Wishlist แล้ว`);
      }
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", { description: error.message });
    } finally {
      setIsWishlistLoading(false);
    }
  };
  
  // --- Other Functions ---
  const handleTagClick = (tagName: string) => navigate(`/products/tag/${encodeURIComponent(tagName)}`);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant);
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleVariantChange = (variant: any) => {
    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null);
    } else {
      setSelectedVariant(variant);
    }
  };

  // --- Render Logic ---
  if (loading) return <div className="flex justify-center items-center h-screen">กำลังโหลด...</div>;
  if (!product) return <div className="flex justify-center items-center h-screen">ไม่พบสินค้า</div>;

  const variantImage = selectedVariant ? product.product_images?.find(img => img.variant_name === selectedVariant.name)?.image_url : null;

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ProductImageGallery 
              mainImage={variantImage || product.image}
              additionalImages={product.product_images?.map(img => img.image_url) || []}
              productName={product.name}
            />

            <div className="flex flex-col space-y-6">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <Button variant="ghost" size="icon" onClick={toggleWishlist} disabled={isWishlistLoading}>
                  <Heart className={`h-7 w-7 transition-all ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
              
              <div className="border bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3"><Package className="h-4 w-4 text-purple-600" /><span className="text-sm">SKU:</span> <Badge variant="secondary">{product.sku}</Badge></div>
                <div className="flex items-center space-x-3 pt-3 border-t"><Clock className="h-4 w-4 text-orange-500" /><span className="text-sm">สถานะ:</span> <Badge className="bg-orange-100 text-orange-800">{product.product_status}</Badge></div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                    <Tag className="h-4 w-4 text-gray-500 mr-1" />
                    {product.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => handleTagClick(tag)}>#{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-4xl font-bold text-purple-600">฿{product.selling_price?.toLocaleString()}</p>
              
              {product.options && product.options.length > 0 && (
                <ProductVariantSelector
                  options={product.options}
                  selectedVariant={selectedVariant}
                  onVariantChange={handleVariantChange}
                />
              )}

              <div className="flex items-center space-x-3 pt-2">
                <label className="text-sm font-medium">จำนวน:</label>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="font-semibold px-4">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button onClick={handleBuyNow} size="lg" style={{backgroundColor: '#956ec3'}}><CreditCard className="mr-2 h-5 w-5" /> ซื้อเดี๋ยวนี้</Button>
                <Button onClick={handleAddToCart} size="lg" variant="outline"><ShoppingCart className="mr-2 h-5 w-5" /> เพิ่มลงตะกร้า</Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <div className="border-2 border-purple-200 rounded-lg bg-white">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-t-md">
                  <TabsTrigger value="description">DESCRIPTION</TabsTrigger>
                  <TabsTrigger value="return">RETURN POLICY</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-6 text-sm text-gray-800 prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                </TabsContent>
                <TabsContent value="return" className="p-6 text-sm text-gray-800">
                  <p>นโยบายการคืนสินค้า...</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
