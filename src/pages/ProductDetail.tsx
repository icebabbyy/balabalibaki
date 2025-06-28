import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, CreditCard, Heart, Tag } from "lucide-react";
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import RichTextEditor from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductPublic } from "@/types/product"; // นำเข้า Type ของคุณ
import { useCart } from "@/hooks/useCart";
import { User } from "@supabase/supabase-js";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // ✨ FIX: แก้ไข useEffect ให้ดึงข้อมูลจาก `public_products` ในครั้งเดียว
  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // ดึงข้อมูลทั้งหมดที่จำเป็นจาก View ที่เราสร้างไว้
        const { data, error } = await supabase
          .from('public_products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        
        setProduct(data as ProductPublic);

        // ตรวจสอบ Wishlist หลังจากได้ข้อมูลสินค้าแล้ว
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        if (currentUser && data) {
          checkWishlistStatus(currentUser.id, data.id);
        }

      } catch (error) {
        console.error("Error fetching product detail:", error);
        toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
        navigate('/404'); // หากไม่พบสินค้า ให้ไปที่หน้า 404
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug, navigate]);

  const checkWishlistStatus = async (userId: string, productId: number) => { /* ...โค้ดเดิม... */ };
  const toggleWishlist = async () => { /* ...โค้ดเดิม... */ };
  const handleTagClick = (tagName: string) => navigate(`/products/tag/${encodeURIComponent(tagName)}`);
  const buyNow = () => { /* ...โค้ดเดิม... */ };


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-screen">ไม่พบสินค้า</div>;
  }
  
  // เมื่อมี variant ถูกเลือก, ให้หารูปของ variant นั้น
  const variantImage = selectedVariant 
    ? product.product_images?.find(img => img.variant_id === selectedVariant.id)?.image_url 
    : null;

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
              mainImage={product.image}
              // ✨ ส่งข้อมูลรูปภาพที่มาจาก product โดยตรง
              additionalImages={product.product_images?.map(img => img.image_url) || []}
              variantImage={variantImage}
              productName={product.name}
            />

            {/* Right Column: Product Info */}
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {/* ✨ แสดง Tags ที่มาจาก product โดยตรง */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => handleTagClick(tag)}>
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-4xl font-bold text-purple-600">
                ฿{product.selling_price?.toLocaleString()}
              </div>
              
              {/* ... ส่วนอื่นๆ เช่น Variant Selector, Quantity, Buttons ... */}

            </div>
          </div>
          
          {/* Description Tabs */}
          <div className="mt-12">
             {/* ... โค้ด Tabs ที่เคยทำไว้ ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
