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
        .contains("tags", [tag]);

      if (error) {
        console.error("Error fetching products by tag:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
        return;
      }

      const transformedProducts: ProductPublic[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        selling_price: item.selling_price,
        category: item.category,
        description: item.description,
        image: item.image,
        product_status: item.product_status,
        sku: item.sku,
        quantity: item.quantity,
        shipment_date: item.shipment_date,
        options: item.options,
        product_type: item.product_type,
        created_at: item.created_at,
        updated_at: item.updated_at,
        slug: item.slug,
        tags: item.tags || [],
        product_images: item.images_list || [],
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product?.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate(`/product/${productId}`);
    }
  };

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
