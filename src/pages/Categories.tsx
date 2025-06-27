
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom"; 
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CategoryFilters from "@/components/categories/CategoryFilters";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";

interface SupabaseProductRow {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  product_status: string;
  sku: string;
  quantity: number;
  shipment_date: string;
  options: any;
  product_type: string;
  created_at: string;
  updated_at: string;
  slug: string;
  tags: any;
  images_list: any;
}

const Categories = () => {
  const { tagSlug } = useParams();
  const [searchParams] = useSearchParams(); 

  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPublic[]>([]);
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
      const categoryResult = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoryResult.error) {
        console.error('Error fetching categories:', categoryResult.error);
        return;
      }
      setCategories(categoryResult.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTagInfo = async () => {
    if (!tagSlug) return;
    try {
      const tagResult = await supabase
        .from('tags')
        .select('*')
        .eq('slug', tagSlug);
      
      if (tagResult.error) {
        console.error('Error fetching tag:', tagResult.error);
        return;
      }
      const tagData = tagResult.data && tagResult.data.length > 0 ? tagResult.data[0] : null;
      setCurrentTag(tagData);
    } catch (error) {
      console.error('Error fetching tag:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let productIds: number[] = [];
      
      if (tagSlug) {
        const tagResult = await supabase
          .from('tags')
          .select('id')
          .eq('slug', tagSlug);
          
        if (tagResult.data && tagResult.data.length > 0) {
          const tagId = tagResult.data[0].id;
          const productTagResult = await supabase
            .from('product_tags')
            .select('product_id')
            .eq('tag_id', tagId);
            
          if (productTagResult.data) {
            productIds = productTagResult.data.map((pt: any) => pt.product_id);
          }
        }
      }

      let productQuery = supabase
        .from('public_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productIds.length > 0) {
        productQuery = productQuery.in('id', productIds);
      }
      
      const productResult = await productQuery;
      
      if (productResult.error) {
        console.error('Error fetching products:', productResult.error);
        return;
      }

      const transformedProducts: ProductPublic[] = [];
      const rawProducts = productResult.data as SupabaseProductRow[] || [];
      
      for (const item of rawProducts) {
        const tagsArray: string[] = [];
        if (item.tags && Array.isArray(item.tags)) {
          for (const tag of item.tags) {
            if (typeof tag === 'string') {
              tagsArray.push(tag);
            }
          }
        }

        const productImages: Array<{ id: number; image_url: string; order: number }> = [];
        if (item.images_list && Array.isArray(item.images_list)) {
          for (let index = 0; index < item.images_list.length; index++) {
            const img = item.images_list[index];
            let imageUrl = '';
            
            if (typeof img === 'string') {
              imageUrl = img;
            } else if (img && typeof img === 'object' && 'image_url' in img) {
              imageUrl = String(img.image_url || '');
            }
            
            if (imageUrl) {
              productImages.push({
                id: index,
                image_url: imageUrl,
                order: index
              });
            }
          }
        }

        const product: ProductPublic = {
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
        };

        transformedProducts.push(product);
      }

      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
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
