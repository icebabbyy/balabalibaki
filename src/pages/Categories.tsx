import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom"; 
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CategoryFilters from "@/components/categories/CategoryFilters";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";

const Categories = () => {
  const { tagSlug } = useParams();
  const [searchParams] = useSearchParams(); 

  // Use type assertion to avoid generic recursion
  const [products, setProducts] = useState([] as ProductPublic[]);
  const [filteredProducts, setFilteredProducts] = useState([] as ProductPublic[]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTag, setCurrentTag] = useState<any>(null);

  const initialCategoryFromUrl = searchParams.get('category');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (tagSlug) {
      fetchTagInfo();
    }
  }, [tagSlug]);

  useEffect(() => {
    if (initialCategoryFromUrl) {
      setSelectedCategories([initialCategoryFromUrl]);
    }
  }, [initialCategoryFromUrl]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTagInfo = async () => {
    if (!tagSlug) return;
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', tagSlug)
        .single();
      if (error) {
        console.error('Error fetching tag:', error);
        return;
      }
      setCurrentTag(data);
    } catch (error) {
      console.error('Error fetching tag:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Get product IDs for tag filtering if needed
      let productIds: number[] = [];
      
      if (tagSlug) {
        const { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', tagSlug)
          .single();
          
        if (tagData) {
          const { data: productTagData } = await supabase
            .from('product_tags')
            .select('product_id')
            .eq('tag_id', tagData.id);
            
          if (productTagData) {
            productIds = productTagData.map(pt => pt.product_id);
          }
        }
      }

      // Define columns explicitly to avoid type inference issues
      const columns = [
        'id', 'name', 'selling_price', 'category', 'description',
        'image', 'product_status', 'sku', 'quantity', 'shipment_date',
        'options', 'product_type', 'created_at', 'updated_at', 'slug', 'tags', 'images_list'
      ] as const;

      // Simplified query approach
      let queryResult;
      
      if (productIds.length > 0) {
        queryResult = await supabase
          .from('public_products')
          .select('*')
          .in('id', productIds)
          .order('created_at', { ascending: false });
      } else {
        queryResult = await supabase
          .from('public_products')
          .select('*')
          .order('created_at', { ascending: false });
      }
      
      const { data: rawData, error } = queryResult;
      
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      // Transform with explicit type handling
      const transformedProducts: ProductPublic[] = [];
      
      if (rawData) {
        for (const item of rawData) {
          // Handle tags safely
          let tagsArray: string[] = [];
          if (item.tags && Array.isArray(item.tags)) {
            tagsArray = item.tags.filter(tag => typeof tag === 'string');
          }

          // Handle product images safely
          let productImages: Array<{ id: number; image_url: string; order: number }> = [];
          if (item.images_list && Array.isArray(item.images_list)) {
            productImages = item.images_list.map((img: any, index: number) => ({
              id: index,
              image_url: typeof img === 'string' ? img : (img?.image_url || ''),
              order: index
            }));
          }

          transformedProducts.push({
            id: item.id || 0,
            name: item.name || '',
            selling_price: item.selling_price || 0,
            category: item.category || '',
            description: item.description || '',
            image: item.image || '',
            product_status: item.product_status || 'พรีออเดอร์',
            sku: item.sku || '',
            quantity: item.quantity || 0,
            shipment_date: item.shipment_date || '',
            options: item.options || null,
            product_type: item.product_type || 'ETC',
            created_at: item.created_at || '',
            updated_at: item.updated_at || '',
            slug: item.slug || '',
            tags: tagsArray,
            product_images: productImages
          });
        }
      }

      // Use type assertion to avoid TypeScript recursion
      const safeProducts = transformedProducts as ProductPublic[];
      setProducts(safeProducts);
      setFilteredProducts(safeProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: number) => {
    const product = products.find(p => p.id === productId);
    const slug = product?.slug || productId.toString();
    window.location.href = `/product/${slug}`;
  };

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryName]);
    } else {
      setSelectedCategories(prev => prev.filter(cat => cat !== categoryName));
    }
  };

  const handleClearSelection = () => {
    setSelectedCategories([]);
  };

  // Filter products based on selected categories and search term
  useEffect(() => {
    let filtered = [...products];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategories, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {currentTag ? `สินค้าแท็ก: ${currentTag.name}` : 'หมวดหมู่สินค้า'}
          </h1>
          <p className="text-gray-600">
            {currentTag ? `ค้นหาสินค้าที่มีแท็ก "${currentTag.name}"` : 'เลือกหมวดหมู่สินค้าที่ต้องการ'}
          </p>
        </div>
        
        <CategoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          onClearSelection={handleClearSelection}
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
