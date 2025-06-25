// src/pages/ProductDetail.tsx (หรือ path ที่คุณใช้)

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // เพิ่ม Link
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// เพิ่ม Heart และ Tag icon เข้ามาใน import
import { ArrowLeft, ShoppingCart, Package, Calendar, Truck, CreditCard, Clock, Heart, Tag as TagIcon } from "lucide-react"; 
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import RichTextEditor from "@/components/RichTextEditor";

const ProductDetail = () => {
  const { slug } = useParams(); // เปลี่ยนจาก id เป็น slug เพื่อความสวยงามของ URL
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (slug) {
        // แก้ไข: เปลี่ยนไปใช้ fetchProductBySlug
        const fetchedProduct = await fetchProductBySlug(slug);
        if (fetchedProduct) {
          await fetchProductImages(fetchedProduct.id);
          if (currentUser) {
            await checkWishlistStatus(currentUser.id, fetchedProduct.id);
          }
        }
      }
      setIsWishlistLoading(false);
    };

    checkUserAndFetchData();
  }, [slug]);

  const fetchProductBySlug = async (productSlug: string) => {
    try {
      setLoading(true);
      // --- แก้ไข #1: ดึงข้อมูล tags มาพร้อมกับ product ---
      const { data, error } = await supabase
        .from('products')
        .select('*, tags(name, slug)') // บอกให้ดึงข้อมูลจากตาราง tags ที่มีความสัมพันธ์กันมาด้วย
        .eq('slug', productSlug)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        toast.error('ไม่พบสินค้าที่ต้องการ');
        navigate('/');
        return null;
      }
      setProduct(data);
      return data; // คืนค่า product ที่ fetch ได้
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productId: number) => { /* ...โค้ดเดิม ไม่แก้ไข... */ };
  const checkWishlistStatus = async (userId: string, productId: number) => { /* ...โค้ดเดิม ไม่แก้ไข... */ };
  const toggleWishlist = async () => { /* ...โค้ดเดิม ไม่แก้ไข... */ };
  const addToCart = () => { /* ...โค้ดเดิม ไม่แก้ไข... */ };
  const buyNow = () => { /* ...โค้ดเดิม ไม่แก้ไข... */ };
  const getStatusColor = (status: string) => { /* ...โค้ดเดิม ไม่แก้ไข... */ };

  if (loading) { /* ... Loading UI ไม่แก้ไข ... */ }
  if (!product) { /* ... Not Found UI ไม่แก้ไข ... */ }

  const additionalImageUrls = images.map(img => img.image_url).filter(url => url !== product.image);

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
            <ProductImageGallery mainImage={product.image} additionalImages={additionalImageUrls} productName={product.name} variantImage={variantImage} />
            
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 pr-4">{product.name}</h1>
                  <Button variant="ghost" size="icon" onClick={toggleWishlist} disabled={isWishlistLoading} className="text-gray-400 hover:text-red-500 rounded-full flex-shrink-0">
                    <Heart className={`h-7 w-7 transition-all duration-200 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500 fill-transparent'}`} />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">หมวดหมู่:</span>
                    <span className="font-medium text-purple-600 hover:underline cursor-pointer" onClick={() => navigate(`/category/${product.category}`)}>{product.category}</span>
                  </div>

                  {/* --- แก้ไข #2: เพิ่มส่วนแสดงผล Tags --- */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex items-start space-x-2 text-sm">
                      <TagIcon className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600 mt-0.5">Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag: any) => (
                          <Link to={`/tags/${tag.slug}`} key={tag.slug}>
                            <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100">
                              {tag.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2"><Package className="h-4 w-4 text-green-500" /><span className="text-sm font-medium text-gray-700">สถานะสินค้า:</span></div>
                      <Badge className={`${getStatusColor(product.product_status)} font-medium`}>{product.product_status}</Badge>
                    </div>
                    {product.shipment_date && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-blue-500" /><span className="text-sm font-medium text-gray-700">กำหนดส่ง:</span></div>
                        <span className="text-sm text-blue-600 font-medium">{new Date(product.shipment_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}

                    {/* --- แก้ไข #3: ย้าย SKU เข้ามาในกล่อง และปรับหน้าตา --- */}
                    <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-2"><TagIcon className="h-4 w-4 text-gray-500" /><span className="text-sm font-medium text-gray-700">SKU:</span></div>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                    </div>

                  </div>
                </div>
              </div>

              <div className="text-4xl font-bold text-purple-600">
                ฿{product.selling_price?.toLocaleString()}
              </div>

              {product.options && product.options.length > 0 && (
                <ProductVariantSelector options={product.options} selectedVariant={selectedVariant} onVariantChange={setSelectedVariant} onVariantImageChange={setVariantImage} productImages={images} />
              )}

              {/* ... ส่วนเลือกจำนวน และปุ่มซื้อ (ไม่แก้ไข) ... */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">จำนวน</label>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}> - </Button>
                  <span className="px-4 py-2 border rounded text-center min-w-[60px]">{quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}> + </Button>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <Button onClick={buyNow} className="w-full py-3 text-lg" style={{ backgroundColor: '#956ec3' }} disabled={product.product_status === 'สินค้าหมด'}>
                  <CreditCard className="h-5 w-5 mr-2" />
                  {product.product_status === 'สินค้าหมด' ? 'สินค้าหมด' : 'ซื้อเดี๋ยวนี้'}
                </Button>
                <Button onClick={addToCart} variant="outline" className="w-full py-3 text-lg border-purple-600 text-purple-600 hover:bg-purple-50" disabled={product.product_status === 'สินค้าหมด'}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  เพิ่มลงตะกร้า
                </Button>
              </div>

              {/* ... ส่วนรายละเอียดสินค้า (ไม่แก้ไข) ... */}
              {product.description && (
                <Card><CardHeader><CardTitle>รายละเอียดสินค้า</CardTitle></CardHeader><CardContent><RichTextEditor value={product.description} isEditing={false} /></CardContent></Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
