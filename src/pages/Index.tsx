import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductPublic } from "@/types/product";

interface Category {
  id: number;
  name: string;
  image: string;
  display_on_homepage: boolean;
  homepage_order: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('public_products')
        .select('*')
        .limit(8)
        .order('id', { ascending: false });

      if (productsError) {
        console.error('Error fetching featured products:', productsError);
        return;
      }

      // Fetch product images
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

      setFeaturedProducts(mappedProducts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('display_on_homepage', true)
        .order('homepage_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/categories?category=${encodeURIComponent(categoryName)}`);
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
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Products Carousel */}
        <section className="mb-12">
          <FeaturedProductsCarousel products={featuredProducts} />
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent className="p-4 text-center">
                  <img
                    src={category.image || '/placeholder.svg'}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">สินค้าใหม่</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <Card 
                key={product.id}
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge 
                      className={`absolute top-2 left-2 text-white ${
                        product.product_status === 'พรีออเดอร์' 
                          ? 'bg-orange-500' 
                          : 'bg-green-500'
                      }`}
                    >
                      {product.product_status}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold" style={{ color: '#956ec3' }}>
                      ฿{product.selling_price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
