// src/pages/ProductDetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product"; // ✨ สมมติว่า type ของคุณอยู่ที่นี่
import { User } from "@supabase/supabase-js";

// Imports for UI
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, CreditCard, Heart, Tag, Package, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import RichTextEditor from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ✨ นำเข้า Tabs

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  // --- ส่วนของ Logic และ State (เหมือนเดิมทุกประการ) ---
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);
  
  const variantImage = images.find(img => img.variant_id === selectedVariant?.id)?.image_url;
  
  useEffect(() => {
    // ... โค้ด fetchAllData ของคุณเหมือนเดิม ...
  }, [slug]);

  const checkUserAndWishlist = async (productId: number) => { /* ...โค้ดเดิม... */ };
  const fetchProductImages = async (productId: number) => { /* ...โค้ดเดิม... */ };
  const fetchProductTags = async (productId: number) => { /* ...โค้ดเดิม... */ };
  const checkWishlistStatus = async (userId: string, productId: number) => { /* ...โค้ดเดิม... */ };
  const toggleWishlist = async () => { /* ...โค้ดเดิม... */ };
  const handleTagClick = (tagName: string) => navigate(`/products/tag/${encodeURIComponent(tagName)}`);
  const addToCart = () => { /* ...โค้ดเดิม... */ };
  const buyNow = () => { /* ...โค้ดเดิม... */ };
  const getStatusColor = (status: string) => { /* ...โค้ดเดิม... */ };


  // --- ส่วนของ Render Logic (เหมือนเดิม) ---
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
  }
  if (!product) {
    return <div className="flex justify-center items-center min-h-screen">ไม่พบสินค้า</div>;
  }

  // --- ✨✨✨ ส่วนของ UI ที่แก้ไขใหม่ทั้งหมด ✨✨✨ ---
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

          {/* ✨ 1. สร้าง Layout หลักแบบ 2 คอลัมน์สำหรับจอใหญ่ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* --- คอลัมน์ซ้าย: รูปภาพสินค้า --- */}
            <ProductImageGallery 
              mainImage={product.image} 
              additionalImages={images.map(img => img.image_url)} 
              productName={product.name} 
              variantImage={variantImage}
            />

            {/* --- คอลัมน์ขวา: ข้อมูลสินค้า --- */}
            <div className="flex flex-col space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <Button variant="ghost" size="icon" onClick={toggleWishlist} disabled={isWishlistLoading} className="text-gray-400 hover:text-red-500 rounded-full">
                    <Heart className={`h-7 w-7 transition-all duration-200 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500 fill-transparent'}`} />
                  </Button>
                </div>
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="cursor-pointer" onClick={() => handleTagClick(tag.name)}>
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-4xl font-bold text-purple-600">
                ฿{product.selling_price?.toLocaleString()}
              </div>
              
              {product.options && (
                <ProductVariantSelector
                  options={product.options}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                  // onVariantImageChange ไม่ต้องส่งแล้ว เพราะเราจัดการในหน้านี้
                />
              )}
              
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
                <Button onClick={addToCart} variant="outline" className="w-full py-3 text-lg" disabled={product.product_status === 'สินค้าหมด'}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  เพิ่มลงตะกร้า
                </Button>
              </div>

            </div>
          </div>
          
          {/* ✨ 2. ย้าย Description มาไว้ตรงกลาง และใช้ Tabs */}
          <div className="mt-12">
            <div className="border border-purple-200 rounded-lg p-1 bg-white">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-purple-50">
                  <TabsTrigger value="description">DESCRIPTION</TabsTrigger>
                  <TabsTrigger value="return">RETURN POLICY</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-6 text-sm text-gray-800 prose max-w-none">
                  <RichTextEditor value={product.description} isEditing={false} onChange={()=>{}} />
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
