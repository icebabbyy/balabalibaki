import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Package, Calendar, CreditCard, Clock, Heart, Tag } from "lucide-react";
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import RichTextEditor from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!slug) return;
      setLoading(true);

      try {
        // 1. Fetch product data by slug
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        if (productData) {
          // 2. Fetch related data in parallel after getting product ID
          const productId = productData.id;
          await Promise.all([
            fetchProductImages(productId),
            fetchProductTags(productId),
            checkUserAndWishlist(productId)
          ]);
        }
      } catch (error) {
        console.error("Failed to load product page data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [slug]);

  const checkUserAndWishlist = async (productId: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    if (currentUser) {
      await checkWishlistStatus(currentUser.id, productId);
    }
    setIsWishlistLoading(false);
  };
  
  const fetchProductImages = async (productId: number) => {
    const { data, error } = await supabase.from('product_images').select('*').eq('product_id', productId).order('order', { ascending: true });
    if (error) console.error('Error fetching images:', error);
    else setImages(data || []);
  };

  const fetchProductTags = async (productId: number) => {
    const { data, error } = await supabase.from('product_tags').select('tags(id, name)').eq('product_id', productId);
    if (error) console.error('Error fetching tags:', error);
    else {
      const processedTags = data?.map(item => item.tags).filter(Boolean) || [];
      setTags(processedTags);
    }
  };

  const checkWishlistStatus = async (userId: string, productId: number) => {
    const { data, error } = await supabase.from('wishlist_items').select('id').eq('user_id', userId).eq('product_id', productId).maybeSingle();
    if (error && error.code !== 'PGRST116') console.error('Error checking wishlist:', error);
    else setIsInWishlist(!!data);
  };
  
  // --- Other Functions (Wishlist, Cart, etc.) ---
  const toggleWishlist = async () => { /* ...โค้ดเดิม... */ };
  const handleTagClick = (tagName: string) => navigate(`/products?tag=${encodeURIComponent(tagName)}`);
  const addToCart = () => { /* ...โค้ดเดิม... */ };
  const buyNow = () => { /* ...โค้dเดิม... */ };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'พรีออเดอร์': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'พร้อมส่ง': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  // --- Render Logic ---
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-screen">ไม่พบสินค้า</div>;
  }

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
            {/* Left Column: Image Gallery */}
            <ProductImageGallery 
              mainImage={variantImage || product.image} 
              additionalImages={images.map(img => img.image_url)} 
              productName={product.name} 
            />

            {/* Right Column: Product Info & Actions */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <Button variant="ghost" size="icon" onClick={toggleWishlist} disabled={isWishlistLoading} className="text-gray-400 hover:text-red-500 rounded-full">
                    <Heart className={`h-7 w-7 transition-all duration-200 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500 fill-transparent'}`} />
                  </Button>
                </div>
                
                {/* --- ส่วนข้อมูลสินค้าที่จัดเรียงใหม่แล้ว --- */}
                <div className="border bg-white rounded-lg p-4 space-y-3 mb-6">
                  {/* 1. SKU */}
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">SKU:</span>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-mono text-sm">{product.sku}</Badge>
                  </div>

                  {/* 2. สถานะสินค้า */}
                  <div className="flex items-center space-x-2 pt-3 border-t">
                    {product.product_status === 'พรีออเดอร์' ? <Clock className="h-4 w-4 text-orange-500" /> : <Package className="h-4 w-4 text-green-500" />}
                    <span className="text-sm font-medium text-gray-700">สถานะสินค้า:</span>
                    <Badge className={`${getStatusColor(product.product_status)} font-medium`}>{product.product_status}</Badge>
                  </div>

                  {/* 3. กำหนดส่ง */}
                  {product.shipment_date && (
                    <div className="flex items-center space-x-2 pt-3 border-t">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">กำหนดส่ง:</span>
                      <span className="text-sm text-blue-600 font-medium">
                        {new Date(product.shipment_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* 4. Tags */}
                  {tags && tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Tags:</span>
                      {tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800" onClick={() => handleTagClick(tag.name)}>
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-4xl font-bold text-purple-600 mb-6">
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
                
                {/* Quantity and Action Buttons */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">จำนวน</label>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                    <span className="px-4 py-2 border rounded text-center min-w-[60px]">{quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>+</Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button onClick={buyNow} className="w-full py-3 text-lg" style={{ backgroundColor: '#956ec3' }} disabled={product.product_status === 'สินค้าหมด'}>
                    <CreditCard className="h-5 w-5 mr-2" />
                    {product.product_status === 'สินค้าหมด' ? 'สินค้าหมด' : 'ซื้อเดี๋ยวนี้'}
                  </Button>
                  <Button onClick={addToCart} variant="outline" className="w-full py-3 text-lg border-purple-600 text-purple-600 hover:bg-purple-50" disabled={product.product_status === 'สินค้าหมด'}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    เพิ่มลงตะกร้า
                  </Button>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <Card className="mt-8">
                  <CardHeader><CardTitle>รายละเอียดสินค้า</CardTitle></CardHeader>
                  <CardContent>
                    <RichTextEditor value={product.description} isEditing={false} onChange={()=>{}} onSave={()=>{}} onCancel={()=>{}} />
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
