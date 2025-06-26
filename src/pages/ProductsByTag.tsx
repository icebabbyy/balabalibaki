// src/pages/ProductsByTag.tsx (เวอร์ชันแก้ไขแล้ว)

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProductsByTag = () => {
  const { tagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tagName) {
      fetchProductsByTag(tagName);
    }
  }, [tagName]);

  const fetchProductsByTag = async (tag: string) => {
    setLoading(true);
    try {
      // ใช้ View 'public_products' ที่เราอัปเกรดไว้
      const { data, error } = await supabase
        .from('public_products')
        .select('*')
        .filter('tags', 'cs', `{"${tag}"}`);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products by tag:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  // แก้ไขให้ใช้ navigate
  const handleProductClick = (product: ProductPublic) => {
    const slug = product.slug || product.id.toString();
    navigate(`/product/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              สินค้าแท็ก: <span className="text-purple-600">#{tagName}</span>
            </h1>
            <p className="text-gray-600">
              พบสินค้า {products.length} รายการ
            </p>
          </div>

          {products.length > 0 ? (
            <ProductGrid 
              products={products}
              // แก้ไขการส่ง props ให้ถูกต้อง
              onProductClick={(productId) => {
                  const product = products.find(p => p.id === productId);
                  if (product) handleProductClick(product);
              }}
            />
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p>ไม่พบสินค้าที่มีแท็กนี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsByTag;
