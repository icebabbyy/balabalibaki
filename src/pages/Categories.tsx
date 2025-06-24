// src/pages/Categories.tsx
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
  id: number; name: string; image: string;
  display_on_homepage: boolean; homepage_order: number;
}

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const safeProductsForFiltering = products.filter(p => p); 

  const {
    filteredProducts, searchTerm, setSearchTerm, selectedCategories,
    handleCategoryChange, clearCategorySelection
  } = useCategoryFiltering(safeProductsForFiltering);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    if (categoryParam) handleCategoryChange(categoryParam, true);
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams, handleCategoryChange, setSearchTerm]);
  
  const fetchData = async () => {
    setLoading(true);
    await Promise.all([ fetchCategories(), fetchProducts() ]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('homepage_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) { console.error('Error fetching categories:', error); }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_images ( image_url, "order", type )`)
        .order('id', { ascending: false });

      if (error) throw error;

      const formattedProducts = (data || []).map(product => {
        if (!product) return null;

        const sortedImages = (product.product_images || []).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        
        // Logic หารูปภาพหลักที่สมบูรณ์ที่สุด
        // 1. หาจาก field 'image' ในตาราง products
        // 2. ถ้าไม่มี ให้หาจาก product_images ที่มี type = 'main'
        // 3. ถ้าไม่มีอีก ให้เอารูปที่ order = 1
        // 4. ถ้าไม่มีอีก ให้เอารูปแรกสุดในอัลบั้ม
        const mainImage = product.image || 
                          sortedImages.find(img => img.type === 'main')?.image_url ||
                          sortedImages.find(img => img.order === 1)?.image_url ||
                          sortedImages[0]?.image_url || '';

        return {
          id: product.id,
          name: product.name || '',
          selling_price: product.selling_price || 0,
          category: product.category || '',
          description: product.description || '',
          image: mainImage,
          product_status: product.product_status || 'พรีออเดอร์',
          sku: product.sku || '',
          quantity: product.quantity || 0,
          shipment_date: product.shipment_date || '',
          options: null,
          product_type: product.product_type || 'ETC',
          created_at: product.created_at,
          updated_at: product.updated_at,
          product_images: sortedImages,
        };
      }).filter(p => p) as ProductPublic[];
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    }
  };

  const handleProductClick = (productId: number) => { navigate(`/product/${productId}`); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลดสินค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">สินค้าทั้งหมด</h1>
        <CategoryFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} categories={categories} selectedCategories={selectedCategories} onCategoryChange={handleCategoryChange} onClearSelection={clearCategorySelection} />
        <ProductGrid products={filteredProducts} onProductClick={handleProductClick} />
      </div>
    </div>
  );
};

export default Categories;
