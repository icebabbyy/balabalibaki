
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CategoryFilters from "@/components/categories/CategoryFilters";
import ProductGrid from "@/components/categories/ProductGrid";
import { useCategoryFiltering } from "@/hooks/useCategoryFiltering";
import { toast } from "sonner";
import { ProductPublic } from "@/types/product";

interface Category {
  id: number;
  name: string;
  image: string;
  display_on_homepage: boolean;
  homepage_order: number;
}

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    handleCategoryChange,
    clearCategorySelection
    // ตรวจสอบให้แน่ใจว่าคุณนำค่าทั้งหมดที่จำเป็นออกมาจาก hook เหมือนเดิม
  } = useCategoryFiltering(safeProductsForFiltering); // ส่งอาร์เรย์ที่ปลอดภัยแล้วเข้าไปใน hook

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Handle category filtering from URL parameters
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (categoryParam) {
      handleCategoryChange(categoryParam, true);
    }

    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams, handleCategoryChange, setSearchTerm]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('homepage_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // First get the products data
      const { data: productsData, error: productsError } = await supabase
        .from('public_products_with_main_image')
        .select('*')
        .order('id', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      // Get additional images for each product
      const productsWithImages = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: imageData } = await supabase
            .from('product_images')
            .select('id, image_url, order')
            .eq('product_id', product.id)
            .order('order', { ascending: true });

          return {
            id: product.id || 0,
            name: product.product_name || '',
            selling_price: product.selling_price || 0,
            category: product.category || '',
            description: product.description || '',
            image: product.main_image_url || product.image || '',
            main_image_url: product.main_image_url || product.image || '',
            product_status: product.product_status || 'พรีออเดอร์',
            sku: product.product_sku || '',
            quantity: product.quantity || 0,
            shipment_date: product.shipment_date || '',
            options: product.all_images || null,
            product_type: product.product_type || 'ETC',
            created_at: product.created_at || '',
            updated_at: product.updated_at || '',
            product_images: imageData || []
          };
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดสินค้า...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">สินค้าทั้งหมด</h1>
        
        <CategoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          onClearSelection={clearCategorySelection}
        />

        <ProductGrid
          products={filteredProducts}
          onProductClick={handleProductClick}
        />
      </div>
    </div>
  );
};

export default Categories;
