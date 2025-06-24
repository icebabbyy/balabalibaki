
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
      
      // Fetch products with their additional images
      const { data: productsData, error: productsError } = await supabase
        .from('public_products')
        .select('*')
        .order('id', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      // Fetch all product images
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .order('product_id, order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching product images:', imagesError);
      }

      // Map products with their images
      const mappedProducts: ProductPublic[] = (productsData || []).map(item => {
        const productImages = (imagesData || []).filter(img => img.product_id === item.id);
        
        return {
          id: item.id || 0,
          name: item.name || '',
          selling_price: item.selling_price || 0,
          category: item.category || '',
          description: item.description || '',
          image: item.main_image_url || '/placeholder.svg',
          main_image_url: item.main_image_url || '/placeholder.svg',
          product_status: item.product_status || 'พรีออเดอร์',
          sku: item.sku || '',
          quantity: item.quantity || 0,
          shipment_date: item.shipment_date || '',
          options: item.options || null,
          product_type: 'ETC',
          created_at: '',
          updated_at: '',
          product_images: productImages.map(img => ({
            id: img.id,
            image_url: img.image_url,
            order: img.order || 0
          }))
        };
      });

      setProducts(mappedProducts);
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
