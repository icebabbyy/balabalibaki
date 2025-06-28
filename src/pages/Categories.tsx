// src/pages/Categories.tsx

import { useState, useEffect } from "react";
// ✨ FIX 3: นำเข้า useNavigate
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
  const navigate = useNavigate(); // ✨ FIX 3: สร้าง instance ของ navigate

  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);

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

  // (ส่วนของ fetchCategories, fetchTagInfo, getProductIdsByTag ไม่มีการเปลี่ยนแปลง)
  const fetchCategories = async () => { /* ...โค้ดเดิม... */ };
  const fetchTagInfo = async () => { /* ...โค้ดเดิม... */ };
  const getProductIdsByTag = async (tagSlug: string): Promise<number[]> => { /* ...โค้ดเดิม... */ };

  const transformProductData = (rawData: any[]) => {
    return rawData.map((item: any) => {
      // ... (ส่วนของ tagsArray ไม่มีการเปลี่ยนแปลง)
      const tagsArray: string[] = item.tags && Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];

      // ✨ FIX 2: แก้ไขการแปลงข้อมูลรูปภาพ
      const productImages: Array<{ id: number; image_url: string; order: number }> = [];
      // เปลี่ยนจาก 'images_list' เป็น 'product_images' ให้ตรงกับ View
      if (item.product_images && Array.isArray(item.product_images)) {
        item.product_images.forEach((img: any) => {
          if (img && typeof img === 'object' && img.image_url) {
            productImages.push({
              id: Number(img.id) || 0,
              image_url: String(img.image_url),
              order: Number(img.order) || 0
            });
          }
        });
      }

      return {
        // ... (properties อื่นๆ เหมือนเดิม)
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

  const fetchProducts = async () => { /* ...โค้ดเดิม... */ };

  // ✨ FIX 3: แก้ไขฟังก์ชัน handleProductClick
  const handleProductClick = (productId: number) => {
    const product = products.find(p => p.id === productId);
    const slug = product?.slug || productId.toString();
    // เปลี่ยนจาก window.location.href เป็น navigate
    navigate(`/product/${slug}`);
  };

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryName]);
    } else {
      setSelectedCategories(prev => prev.filter(cat => cat !== categoryName));
    }
  };

  // ✨ FIX 1: เพิ่มฟังก์ชัน handleClearSelection ที่หายไป
  const handleClearSelection = () => {
    setSelectedCategories([]);
  };

  useEffect(() => {
    // (ส่วนของ client-side filtering ไม่มีการเปลี่ยนแปลง)
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

  // (ส่วนของ Loading JSX ไม่มีการเปลี่ยนแปลง)
  if (loading) { /* ...โค้ดเดิม... */ }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* ... (ส่วน h1 และ p เหมือนเดิม) ... */}
        </div>
        
        <CategoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          onClearSelection={handleClearSelection} // ตอนนี้ handleClearSelection มีอยู่จริงแล้ว
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
