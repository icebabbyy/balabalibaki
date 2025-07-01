// src/pages/Categories.tsx

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom"; 
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CategoryFilters from "@/components/categories/CategoryFilters";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";

interface Category {
  id: number;
  name: string;
  image: string;
  display_on_homepage: boolean;
  homepage_order: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

const Categories = () => {
  const { tagSlug } = useParams();
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);

  const initialCategoryFromUrl = searchParams.get('category');

  useEffect(() => {
    // แยก fetchTagInfo ออกมาเพื่อให้แน่ใจว่ามันทำงานก่อน fetchProducts
    const initPage = async () => {
      setLoading(true);
      
      const urlSearchTerm = searchParams.get('search') || '';
      if (urlSearchTerm) {
        setSearchTerm(urlSearchTerm);
      }
      await fetchCategories();
      let productIds: number[] | null = null;
      if (tagSlug) {
        await fetchTagInfo(tagSlug);
        productIds = await getProductIdsByTag(tagSlug);
        // ✨ FIX: ถ้ามี tag แต่ไม่มีสินค้า ให้แสดงผลว่าไม่พบสินค้าทันที
        if (productIds.length === 0) {
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
          return;
        }
      }
      await fetchProducts(productIds);
      setLoading(false);
    };

    initPage();
  }, [tagSlug, searchParams]); // เพิ่ม dependency เป็น searchParams เพื่อให้แน่ใจว่า URL เปลี่ยนแปลงจะทำให้ useEffect ทำงานใหม่

  useEffect(() => {
    if (initialCategoryFromUrl) {
      setSelectedCategories([initialCategoryFromUrl]);
    }
  }, [categories]); // เปลี่ยน dependency เป็น categories เพื่อให้แน่ใจว่า categories โหลดเสร็จก่อน

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories((data as Category[]) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTagInfo = async (slug: string) => {
    try {
      const { data, error } = await supabase.from('tags').select('id, name').eq('name', slug).single();
      if (error) throw error;
      if (data) {
        setCurrentTag({ ...data, slug });
      }
    } catch (error) {
      console.error('Error fetching tag:', error);
    }
  };

  const getProductIdsByTag = async (slug: string): Promise<number[]> => {
    const { data, error } = await supabase.rpc('get_product_ids_by_tag_name', { tag_name: slug });
    if (error) {
      console.error('Error getting product ids by tag:', error);
      return [];
    }
    return data || [];
  };

  const transformProductData = (rawData: any[]): ProductPublic[] => {
    return rawData.map((item: any) => ({
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
      tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
      product_images: Array.isArray(item.product_images) ? item.product_images.filter(img => img && img.image_url) : []
    } as ProductPublic));
  };

  const fetchProducts = async (productIds: number[] | null) => {
    try {
      const queryBuilder = supabase.from('public_products').select('*');
      if (productIds) {
        queryBuilder.in('id', productIds);
      }
      const { data, error } = await queryBuilder.order('created_at', { ascending: false });
      if (error) throw error;
      const transformed = transformProductData(data || []);
      setProducts(transformed);
      setFilteredProducts(transformed); // ตั้งค่าเริ่มต้นให้ filteredProducts
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductClick = (productId: number) => {
    const product = products.find(p => p.id === productId);
    const slug = product?.slug || productId.toString();
    navigate(`/product/${slug}`);
  };

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked ? [...prev, categoryName] : prev.filter(cat => cat !== categoryName)
    );
  };

  const handleClearSelection = () => {
    setSelectedCategories([]);
  };

  useEffect(() => {
    let filtered = [...products];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        product.category.toLowerCase().includes(lowercasedTerm)
      );
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategories, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลดสินค้า...</p>
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
