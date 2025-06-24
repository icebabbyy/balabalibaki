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
    fetchData(); // เรียกฟังก์ชันเดียวเพื่อโหลดข้อมูลทั้งหมด
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
    // เรียกโหลดทั้ง categories และ products พร้อมกัน
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

  // ***** นี่คือฟังก์ชันที่แก้ไขแล้ว *****
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products') // ดึงจากตาราง 'products' โดยตรง
        .select(`
          *,
          categories (name),
          product_images (id, image_url, order)
        `) // ดึงข้อมูลจากตารางลูกมาพร้อมกันในครั้งเดียว
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching products with images:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      // แปลงข้อมูลให้ตรงกับ Type ที่เราต้องการ
      const formattedProducts: ProductPublic[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        selling_price: product.selling_price,
        category: product.categories?.name || 'ไม่มีหมวดหมู่',
        description: product.description,
        main_image_url: product.image, // สมมติว่า field 'image' ในตาราง products คือรูปหลัก
        image: product.image,
        product_status: product.product_status,
        sku: product.sku,
        quantity: product.quantity,
        shipment_date: product.shipment_date,
        options: null, // หรือใส่ข้อมูลที่ถูกต้องถ้ามี
        product_type: product.product_type,
        created_at: product.created_at,
        updated_at: product.updated_at,
        product_images: product.product_images || [] // ข้อมูลอัลบั้มรูปจะมาโดยอัตโนมัติ
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
