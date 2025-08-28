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

// helper รวมรูป
const collectAllImages = (p: any): string[] => {
  const uniq = (arr: (string | undefined | null)[]) =>
    Array.from(new Set(arr.filter(Boolean))) as string[];

  return uniq([
    p.main_image_url,
    ...(Array.isArray(p.product_images) ? p.product_images.map((im: any) => im?.image_url) : []),
    p.image_url,
    p.image,
  ]);
};

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
    const initPage = async () => {
      setLoading(true);
      
      const urlSearchTerm = searchParams.get('search') || '';
      if (urlSearchTerm) setSearchTerm(urlSearchTerm);

      await fetchCategories();
      let productIds: number[] | null = null;

      if (tagSlug) {
        await fetchTagInfo(tagSlug);
        productIds = await getProductIdsByTag(tagSlug);
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
  }, [tagSlug, searchParams]);

  useEffect(() => {
    if (initialCategoryFromUrl) {
      setSelectedCategories([initialCategoryFromUrl]);
    }
  }, [categories]);

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

  // --- REPLACE THIS FUNCTION in src/pages/Categories.tsx ---
const transformProductData = (rawData: any[]): ProductPublic[] => {
  return rawData.map((item: any) => {
    // รวม URL จากทุกแหล่ง (รองรับทั้ง view เก่า/ใหม่)
    const uniq = (arr: (string | null | undefined)[]) =>
      Array.from(new Set(arr.filter(Boolean))) as string[];

    const fromImages =
      Array.isArray(item.images) ? item.images.map((im: any) => im?.image_url || im) : [];

    const fromProductImages =
      Array.isArray(item.product_images)
        ? item.product_images.map((im: any) => im?.image_url || im)
        : [];

    const allImageUrls = uniq([
      item.main_image_url,
      ...fromProductImages,
      ...fromImages,
      item.image_url,
      item.image,
    ]);

    const primary = allImageUrls[0] || "/placeholder.svg";

    const structuredImages = allImageUrls.map((url: string, idx: number) => ({
      id: idx,
      image_url: url,
      order: idx,
    }));

    return {
      id: Number(item.id) || 0,
      name: String(item.name) || "",
      selling_price: Number(item.selling_price) || 0,
      category: String(item.category || item.category_name || ""),
      description: String(item.description) || "",

      // ให้การ์ด/รายละเอียดมี “รูปหลัก” เสมอ
      image: primary,
      image_url: item.image_url ?? undefined,
      main_image_url: item.main_image_url ?? undefined,

      product_status: String(item.product_status || "พรีออเดอร์"),
      sku: String(item.sku || ""),
      quantity: Number(item.quantity || 0),
      shipment_date: item.shipment_date ?? null,
      options: item.options ?? [],
      product_type: String(item.product_type || "ETC"),
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,

      // slug อาจว่าง → ให้ fallback เป็น id
      slug: item.slug && String(item.slug).trim() !== "" ? String(item.slug) : String(item.id),

      // tags อาจเป็น string[] หรือ object[] → ส่งดิบไป เดี๋ยวไปแปลงใน ProductDetail
      tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],

      product_images: structuredImages,
      images: structuredImages,
      all_images: structuredImages,
    } as ProductPublic;
  });
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
      setFilteredProducts(transformed);
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
