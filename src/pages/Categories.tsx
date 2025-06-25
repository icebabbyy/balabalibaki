
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CategoryFilters from "@/components/categories/CategoryFilters";
import ProductGrid from "@/components/categories/ProductGrid";
import { ProductPublic } from "@/types/product";

const Categories = () => {
  const { tagSlug } = useParams();
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [currentTag, setCurrentTag] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    if (tagSlug) {
      fetchTagInfo();
    }
  }, [tagSlug]);

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
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            order
          )
        `)
        .order('created_at', { ascending: false });

      // If filtering by tag, join with product_tags
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
      setFilteredProducts(transformedProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.selling_price - b.selling_price;
        case "price-high":
          return b.selling_price - a.selling_price;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {tagSlug && currentTag ? (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                สินค้าที่มีแท็ก "#{currentTag.name}"
              </h1>
              <p className="text-gray-600">
                แสดงสินค้าทั้งหมดที่เกี่ยวข้องกับแท็กนี้
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">สินค้าทั้งหมด</h1>
              <p className="text-gray-600">ค้นหาและเลือกซื้อสินค้าที่คุณต้องการ</p>
            </div>
          )}
        </div>

        <CategoryFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <ProductGrid 
          products={filteredProducts} 
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Categories;
