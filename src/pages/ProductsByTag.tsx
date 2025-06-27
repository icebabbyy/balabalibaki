import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";
import { toast } from "sonner";

const ProductsByTag = () => {
  const { tagName } = useParams<{ tagName: string }>();
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (tagName) {
      fetchProductsByTag(tagName);
    }
  }, [tagName]);

  const fetchProductsByTag = async (tag: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .contains("tags", [tag]); // การ query ข้อมูลถูกต้องแล้ว

      if (error) {
        console.error("Error fetching products by tag:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
        return;
      }

      // ✨🎯 จุดที่แก้ไขสำคัญอยู่ตรงนี้ครับ ✨🎯
      const transformedProducts: ProductPublic[] = (data || []).map((item: any) => ({
        ...item, // 1. ใช้ Spread Operator เพื่อลดความซ้ำซ้อนและป้องกัน field ตกหล่น

        // 2. แก้ไขการแปลงข้อมูล product_images
        //    - เปลี่ยนจาก `item.images_list` เป็น `item.product_images`
        //    - เพิ่มการป้องกันค่า null/undefined ให้แต่ละ property ของรูปภาพ
        product_images: Array.isArray(item.product_images)
          ? item.product_images.map((img: any) => ({
              id: img.id || 0, 
              image_url: String(img.image_url || ''),
              order: img.order || 0,
            }))
          : [], // ถ้าไม่มีข้อมูล ให้เป็น array ว่าง

        // 3. การแปลง tags ยังคงเดิม เพราะทำถูกต้องอยู่แล้ว
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน handleProductClick ไม่มีการเปลี่ยนแปลง
  const handleProductClick = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product?.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate(`/product/${productId}`);
    }
  };

  // ส่วน JSX สำหรับ Loading ไม่มีการเปลี่ยนแปลง
  if (loading) {
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

  // ส่วน JSX สำหรับแสดงผล ไม่มีการเปลี่ยนแปลง
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              สินค้าแท็ก: {tagName}
            </h1>
            <p className="text-gray-600">พบสินค้า {products.length} รายการ</p>
          </div>
          <ProductGrid products={products} onProductClick={handleProductClick} />
        </div>
      </div>
    </div>
  );
};

export default ProductsByTag;
