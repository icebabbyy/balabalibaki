import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import CategoryFilters from "@/components/categories/CategoryFilters";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import {
  useCategoryFiltering,
  type StatusOption,
  type ProductTypeOption,
} from "@/hooks/useCategoryFiltering";

interface Category {
  id: number;
  name: string;
  image?: string;
  display_on_homepage?: boolean;
  homepage_order?: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

/* รวมรูปจากทุกฟิลด์ */
const toImages = (item: any): { id: number; image_url: string; order: number }[] => {
  const uniq = (arr: (string | null | undefined)[]) =>
    Array.from(new Set(arr.filter(Boolean))) as string[];
  const fromImages =
    Array.isArray(item.images) ? item.images.map((im: any) => im?.image_url || im) : [];
  const fromProductImages =
    Array.isArray(item.product_images) ? item.product_images.map((im: any) => im?.image_url || im) : [];
  const all = uniq([item.main_image_url, ...fromProductImages, ...fromImages, item.image_url, item.image]);
  return all.map((url: string, idx: number) => ({ id: idx, image_url: url, order: idx }));
};

const transformProductData = (raw: any[]): ProductPublic[] => {
  return raw.map((item: any) => {
    const imgs = toImages(item);
    const main = imgs[0]?.image_url || "/placeholder.svg";

    return {
      id: Number(item.id) || 0,
      name: String(item.name || ""),
      selling_price: Number(item.selling_price || 0),
      category: String(item.category || item.category_name || ""),
      description: String(item.description || ""),
      image: main,
      image_url: item.image_url ?? undefined,
      main_image_url: item.main_image_url ?? undefined,
      product_status: String(item.product_status || ""),
      sku: String(item.sku || ""),
      quantity: Number(item.quantity || 0),
      shipment_date: item.shipment_date ?? null,
      options: item.options ?? [],
      product_type: String(item.product_type || item.product_type_name || ""), // backup
      // ใส่ field เผื่อไว้ให้ฟิลเตอร์ประเภทสินค้า
      ...(item.product_type_name ? { product_type_name: String(item.product_type_name) } : {}),
      product_type_name: String(item.product_type_name || item.product_type || ""),
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
      slug: item.slug && String(item.slug).trim() !== "" ? String(item.slug) : String(item.id),
      tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
      product_images: imgs,
      images: imgs,
      all_images: imgs,
    } as unknown as ProductPublic;
  });
};

const Categories = () => {
  const { tagSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [productsRaw, setProductsRaw] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);

  /* hook ฟิลเตอร์ */
  const {
    filteredProducts,
    searchTerm,
    selectedCategories,
    selectedStatuses,
    selectedTypes,
    setSearchTerm,
    handleCategoryChange,
    handleStatusChange,
    handleTypeChange,
    clearCategorySelection,
    clearStatusSelection,
    clearTypeSelection,
    clearAllFilters,
  } = useCategoryFiltering(productsRaw);

  /* init */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCategories();

      let productIds: number[] | null = null;
      if (tagSlug) {
        await fetchTagInfo(tagSlug);
        productIds = await getProductIdsByTag(tagSlug);
        if (productIds.length === 0) {
          setProductsRaw([]);
          setLoading(false);
          return;
        }
      }

      await fetchProducts(productIds);

      const urlSearch = searchParams.get("search") || "";
      if (urlSearch) setSearchTerm(urlSearch);

      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagSlug, searchParams]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error) setCategories((data as Category[]) || []);
  };

  const fetchTagInfo = async (slug: string) => {
    const { data, error } = await supabase.from("tags").select("id, name").eq("name", slug).single();
    if (!error && data) setCurrentTag({ ...data, slug });
  };

  const getProductIdsByTag = async (slug: string) => {
    const { data, error } = await supabase.rpc("get_product_ids_by_tag_name", { tag_name: slug });
    if (error) return [];
    return (data as number[]) || [];
  };

  const fetchProducts = async (ids: number[] | null) => {
    let q = supabase.from("public_products").select("*").order("created_at", { ascending: false });
    if (ids) q = q.in("id", ids);
    const { data, error } = await q;
    if (!error) setProductsRaw(transformProductData(data || []));
  };

  const handleProductClick = (productId: number) => {
    const found = productsRaw.find((p) => p.id === productId);
    navigate(`/product/${found?.slug || productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
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
            {currentTag ? `สินค้าแท็ก: ${currentTag.name}` : "หมวดหมู่สินค้า"}
          </h1>
          <p className="text-gray-600">
            {currentTag ? `ค้นหาสินค้าที่มีแท็ก "${currentTag.name}"` : "เลือกหมวดหมู่สินค้าที่ต้องการ"}
          </p>
        </div>

        <CategoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          onClearCategory={clearCategorySelection}
          selectedStatuses={selectedStatuses as StatusOption[]}
          onStatusChange={handleStatusChange}
          onClearStatus={clearStatusSelection}
          selectedTypes={selectedTypes as ProductTypeOption[]}
          onTypeChange={handleTypeChange}
          onClearType={clearTypeSelection}
          onClearAll={clearAllFilters}
        />

        <ProductGrid products={filteredProducts} onProductClick={handleProductClick} />
      </div>
    </div>
  );
};

export default Categories;
