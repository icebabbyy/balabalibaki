// src/pages/Categories.js
// (โค้ดส่วน import และส่วนต้นอื่นๆ เหมือนเดิม)
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
  } = useCategoryFiltering(products);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    if (categoryParam) {
      handleCategoryChange(categoryParam, true);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams, handleCategoryChange, setSearchTerm]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchProducts()]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('homepage_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
        return;
      }
      setCategories(data || []);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
    }
  };

  // ***** แก้ไขฟังก์ชันนี้เพื่อความแน่นอนของข้อมูล *****
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, selling_price, description, product_status, sku, quantity, shipment_date, product_type, created_at, updated_at,
          image,
          categories (name),
          product_images (id, image_url, order)
        `)
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching products with images:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      const formattedProducts: ProductPublic[] = (data || []).map(product => ({
        ...product,
        category: product.categories?.name || 'ไม่มีหมวดหมู่',
        // จัดเรียงอัลบั้มรูปภาพตาม 'order' เพื่อให้ rollover effect ทำงานถูกต้อง
        product_images: (product.product_images || []).sort((a, b) => a.order - b.order)
      }));

      setProducts(formattedProducts);

    } catch (error) {
      console.error('Critical error in fetchProducts:', error);
      toast.error('เกิดข้อผิดพลาดร้ายแรงในการโหลดข้อมูล');
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // (ส่วน JSX ที่ return สำหรับ loading และหน้าหลักให้คงไว้เหมือนเดิม)
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
