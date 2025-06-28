// src/pages/ProductDetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductPublic } from "@/types/product";
import { User } from "@supabase/supabase-js";

// UI Components
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector"; // ✨ 1. Import คอมโพเนนต์ใหม่
// ... (imports อื่นๆ เหมือนเดิม)

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

  // ✨ 2. สร้าง State ใหม่สำหรับเก็บรูปภาพที่กำลังจะแสดง
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('public_products').select('*').eq('slug', slug).single();
        if (error) throw error;
        
        const productData = data as ProductPublic;
        setProduct(productData);
        // ✨ 3. ตั้งค่ารูปภาพเริ่มต้นเมื่อโหลดข้อมูลเสร็จ
        setActiveImageUrl(productData.image); 

        // ... (ส่วน check user และ wishlist เหมือนเดิม)
      } catch (error) {
        console.error("Error fetching product detail:", error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [slug, navigate]);

  // ✨ 4. สร้างฟังก์ชันสำหรับจัดการเมื่อมีการเลือก Variant
  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    
    // หานิยามรูปภาพที่ตรงกับ variant ที่เลือก
    const newImage = product?.product_images?.find(
      img => img.variant_name === variant.name // หรือจะเทียบด้วย variant_id ก็ได้
    )?.image_url;

    // ถ้าเจอรูปของ variant, ให้อัปเดต activeImageUrl
    // ถ้าไม่เจอ หรือกดยกเลิก, ให้กลับไปใช้รูปหลัก
    setActiveImageUrl(newImage || product?.image || '/placeholder.svg');
  };
  
  // ... (ฟังก์ชันอื่นๆ toggleWishlist, handleTagClick, etc. เหมือนเดิม)

  if (loading) return <div>กำลังโหลด...</div>;
  if (!product) return <div>ไม่พบสินค้า</div>;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* ... (Breadcrumb, ปุ่มย้อนกลับ) ... */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* --- คอลัมน์ซ้าย: รูปภาพสินค้า --- */}
            <ProductImageGallery 
              mainImage={activeImageUrl || product.image} // ✨ ใช้ activeImageUrl
              additionalImages={product.product_images?.map(img => img.image_url) || []}
              productName={product.name}
            />

            {/* --- คอลัมน์ขวา: ข้อมูลสินค้า --- */}
            <div className="flex flex-col space-y-6">
              {/* ... (h1, a, price เหมือนเดิม) ... */}
              
              {/* ✨ 5. ส่วนแสดงผลตัวเลือกสินค้า (จะแสดงก็ต่อเมื่อมี options) */}
              {product.options && product.options.length > 0 && (
                <ProductVariantSelector
                  options={product.options}
                  selectedVariant={selectedVariant}
                  onVariantChange={handleVariantChange}
                />
              )}
              
              {/* ... (Quantity, Action Buttons, Description Tabs เหมือนเดิม) ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
