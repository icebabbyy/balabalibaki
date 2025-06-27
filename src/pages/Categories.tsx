
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

  const [products, setProducts] = useState([] as ProductPublic[]);
  const [filteredProducts, setFilteredProducts] = useState([] as ProductPublic[]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([] as any[]);
  const [selectedCategories, setSelectedCategories] = useState([] as string[]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTag, setCurrentTag] = useState(null as any);

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
      const query = supabase
        .from('categories')
        .select('*')
        .order('name');
      
      const result = await query;
      
      if (result.error) {
        console.error('Error fetching categories:', result.error);
        return;
      }
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTagInfo = async () => {
    if (!tagSlug) return;
    try {
      const query = supabase
        .from('tags')
        .select('*')
        .eq('slug', tagSlug);
      
      const result = await query;
      
      if (result.error) {
        console.error('Error fetching tag:', result.error);
        return;
      }
      const tagData = result.data && result.data.length > 0 ? result.data[0] : null;
      setCurrentTag(tagData);
    } catch (error) {
      console.error('Error fetching tag:', error);
    }
  };

  const getProductIdsByTag = async (tagSlug: string) => {
    const tagQuery = supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug);
    
    const tagResult = await tagQuery;
        
    if (tagResult.data && tagResult.data.length > 0) {
      const tagId = tagResult.data[0].id;
      const productTagQuery = supabase
        .from('product_tags')
        .select('product_id')
        .eq('tag_id', tagId);
      
      const productTagResult = await productTagQuery;
        
      if (productTagResult.data) {
        return productTagResult.data.map((pt: any) => pt.product_id);
      }
    }
    return [];
  };

  const transformProductData = (rawData: any[]) => {
    return rawData.map((item: any) => {
      const tagsArray: string[] = [];
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: any) => {
          if (typeof tag === 'string') {
            tagsArray.push(tag);
          }
        });
      }

      const productImages: Array<{ id: number; image_url: string; order: number }> = [];
      if (item.images_list && Array.isArray(item.images_list)) {
        item.images_list.forEach((img: any, index: number) => {
          let imageUrl = '';
          
          if (typeof img === 'string') {
            imageUrl = img;
          } else if (img && typeof img === 'object' && img.image_url) {
            imageUrl = String(img.image_url);
          }
          
          if (imageUrl) {
            productImages.push({
              id: index,
              image_url: imageUrl,
              order: index
            });
          }
        });
      }

      return {
        id: Number(item.id) || 0,
        name: String(item.name) || '',
        selling_price: Number(item.selling_price) || 0,
        category: String(item.category) || '',
        description: String(item.description) || '',
        image: String(item.image) || '',
        product_status: String(item.product_status) || 'พรีออเดอร์',
        sku: String(item.sku) || '',
        quantity: Number(item.quantity) || 0,
        shipment_date: String(item.shipment_date) || '',
        options: item.options || null,
        product_type: String(item.product_type) || 'ETC',
        created_at: String(item.created_at) || '',
        updated_at: String(item.updated_at) || '',
        slug: String(item.slug) || '',
        tags: tagsArray,
        product_images: productImages
      } as ProductPublic;
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let productIds: number[] = [];
      
      if (tagSlug) {
        productIds = await getProductIdsByTag(tagSlug);
      }

      const baseQuery = supabase.from('public_products').select('*');
      let finalQuery = baseQuery;
      
      if (productIds.length > 0) {
        finalQuery = baseQuery.in('id', productIds);
      }
      
      finalQuery = finalQuery.order('created_at', { ascending: false });
      
      const result = await finalQuery;
      
      if (result.error) {
        console.error('Error fetching products:', result.error);
        return;
      }

      const rawProducts = result.data || [];
      const transformedProducts = transformProductData(rawProducts);

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
