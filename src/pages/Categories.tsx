import { useState, useEffect } from "react";
// --- 1. แก้ไข: import useSearchParams เพิ่มเข้ามา ---
import { useParams, useSearchParams } from "react-router-dom"; 
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CategoryFilters from "@/components/categories/CategoryFilters";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";

const Categories = () => {
  const { tagSlug } = useParams();
  // --- 2. แก้ไข: สร้างตัวแปรเพื่ออ่านค่าจาก URL ---
  const [searchParams] = useSearchParams(); 

  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTag, setCurrentTag] = useState<any>(null);

  // --- 3. แก้ไข: อ่านค่า 'category' จาก URL มาเก็บไว้ ---
  const initialCategoryFromUrl = searchParams.get('category');

  // useEffect หลักของคุณ สำหรับดึงข้อมูล αρχικά
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (tagSlug) {
      fetchTagInfo();
    }
  }, [tagSlug]);

  // --- 4. แก้ไข: เพิ่ม useEffect ใหม่ เพื่อตั้งค่า Filter เริ่มต้นจาก URL ---
  // useEffect นี้จะทำงานแค่ครั้งเดียวตอนเปิดหน้า หรือเมื่อค่า category ใน URL เปลี่ยนไป
  useEffect(() => {
    if (initialCategoryFromUrl) {
      // ถ้าใน URL มี ?category=... ให้ตั้งค่านั้นเป็นหมวดหมู่ที่ถูกเลือก
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
    // โค้ด fetchProducts เดิมของคุณ (ทำงานได้ดีอยู่แล้ว)
    try {
      let query = supabase
        .from('products')
        .select(`*, product_images (id, image_url, order)`)
        .order('created_at', { ascending: false });

      if (tagSlug) {
        const { data: tagData } = await supabase.from('tags').select('id').eq('slug', tagSlug).single();
        if (tagData) {
          const { data: productTagData } = await supabase.from('product_tags').select('product_id').eq('tag_id', tagData.id);
          if (productTagData) {
            const productIds = productTagData.map(pt => pt.product_id);
            query = query.in('id', productIds);
          }
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      const transformedProducts: ProductPublic[] = data?.map(product => ({
        id: product.id,
        name: product.name,
        selling_price: product.selling_price,
        category: product.category,
        description: product.description,
        image: product.image,
        product_status: product.product_status,
        sku: product.sku,
        quantity: product.quantity,
        shipment_date: product.shipment_date,
        options: product.options,
        product_type: product.product_type,
        created_at: product.created_at,
        updated_at: product.updated_at,
        slug: product.slug,
        product_images: product.product_images || []
      })) || [];

      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts); // ตั้งค่าเริ่มต้น
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: number) => {
    const product = products.find(p => p.id === productId);
    const slug = product?.slug || productId.toString();
    // แนะนำให้ใช้ navigate ของ react-router-dom แทน window.location.href เพื่อประสบการณ์ใช้งานที่ดีกว่า
    // แต่โค้ดเดิมก็ทำงานได้ครับ
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

  // useEffect สำหรับกรองสินค้า (โค้ดเดิมของคุณ ทำงานถูกต้องแล้ว)
  // มันจะทำงานอัตโนมัติเมื่อ selectedCategories ถูกตั้งค่าจาก URL
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
    // ... UI ตอนโหลด ...
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* ... ส่วนหัว Title ... */}
        
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
