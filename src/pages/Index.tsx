import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";อม
import { toast } from "sonner";

interface Banner {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  link_url?: string;
  active: boolean;
  position: number;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  display_on_homepage?: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: ProductPublic[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
    fetchCategories();
    fetchHomepageCategories();
  }, []);

  const fetchBanners = async () => {
    try {
      console.log('Fetching banners...');
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position', { ascending: true });
      
      console.log('Fetched all banners:', data);
      
      const position1 = (data || []).filter(banner => banner.position === 1);
      const position2 = (data || []).filter(banner => banner.position === 2);
      const position3 = (data || []).filter(banner => banner.position === 3);
      const position4 = (data || []).filter(banner => banner.position === 4);
      
      setMainBanners(position1);
      setSecondBanners(position2);
      setThirdBanners(position3);
      setFourthBanners(position4);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data } = await supabase
        .from('public_products')
        .select('*')
        .limit(8);
      
   const mappedProducts: ProductPublic[] = (data || []).map(item => ({
  id: item.id || 0,
  name: item.name || '', // ใช้ item.name ที่ถูกต้อง
  selling_price: item.selling_price || 0,
  category: item.category || '',
  description: item.description || '',
  image: item.image || '',
  product_status: item.product_status || 'พรีออเดอร์',
  sku: item.sku || '',                       // แก้จาก product_sku
  quantity: item.quantity || 0,
  shipment_date: item.shipment_date || '',
  options: item.options || null,
  images_list: item.images_list || [],     // แก้จาก all_images
  product_type: item.product_type || 'ETC',
  created_at: item.created_at || '',
  updated_at: item.updated_at || '',
  tags: item.tags || [],
  slug: item.slug || String(item.id)         // แก้ไขให้ใช้ slug จริงๆ
}));
      
      setFeaturedProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*');
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchHomepageCategories = async () => {
    try {
      const displayCategories = ['Nikke', 'Honkai : Star Rail', 'League of Legends'];
      const categoriesData = [];
      const productsData: {[key: string]: ProductPublic[]} = {};

      for (const categoryName of displayCategories) {
        const { data: categoryInfo } = await supabase
          .from('categories')
          .select('*')
          .eq('name', categoryName)
          .single();

        if (categoryInfo) {
          categoriesData.push(categoryInfo);

          const { data: products } = await supabase
            .from('public_products')
            .select('*')
            .eq('category', categoryName)
            .limit(5);

          const mappedProducts: ProductPublic[] = (products || []).map(item => ({
            id: item.id || 0,
            name: item.name || '',
            tags: item.tags || [],
            selling_price: item.selling_price || 0,
            category: item.category || '',
            description: item.description || '',
            image: item.image || '',
            product_status: item.product_status || 'พรีออเดอร์',
            sku: item.sku || '',
            quantity: 0,
            shipment_date: item.shipment_date || '',
            options: item.all_images || null,
            product_type: item.product_type || 'ETC',
            created_at: item.created_at || '',
            updated_at: item.updated_at || '',
          
            slug: item.sku // Use SKU as slug fallback
          }));

          productsData[categoryName] = mappedProducts;
        }
      }

      setHomepageCategories(categoriesData);
      setCategoryProducts(productsData);
    } catch (error) {
      console.error('Error fetching homepage categories:', error);
    }
  };

  // Fix the handleProductClick function to properly use slug with fallback
  const handleProductClick = (productId: number) => {
    const product = featuredProducts.find(p => p.id === productId) || 
                   Object.values(categoryProducts).flat().find(p => p.id === productId);
    
    if (product) {
      const slug = product.slug || product.id.toString();
      console.log('Navigating to product:', slug);
      navigate(`/product/${slug}`);
    } else {
      console.error('Product not found for ID:', productId);
      navigate(`/product/${productId}`);
    }
  };

  const addToCart = (product: ProductPublic) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      quantity: 1,
      image: product.image
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    alert('เพิ่มสินค้าลงตะกร้าแล้ว');
  };

  const ProductCard = ({ product }: { product: ProductPublic }) => {
    const buyNow = (productToBuy: ProductPublic) => {
      const cartItem = {
        id: productToBuy.id,
        name: productToBuy.name,
        price: productToBuy.selling_price
        quantity: 1,
        image: productToBuy.image,
        variant: null
      };

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === productToBuy.id && item.variant === null);

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }
      localStorage.setItem('cart', JSON.stringify(existingCart));
      navigate('/cart');
    };

    const addToCart = (productToAdd: ProductPublic) => {
      const cartItem = {
        id: productToAdd.id,
        name: productToAdd.name,
        price: productToAdd.selling_price,
        quantity: 1,
        image: productToAdd.image,
        variant: null
      };

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === productToAdd.id && item.variant === null);

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));
      toast.success(`เพิ่ม "${productToAdd.name}" ลงตะกร้าแล้ว`);
    };

    return (
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
        onClick={() => handleProductClick(product.id)}
      >
       <div className="relative">
  <img
    src={product.image || '/placeholder.svg'}
    alt={product.name}
    className="w-full h-48 object-cover rounded-t-lg"
  />
  {/* ✅ ใช้โค้ดบล็อกนี้แทนที่ของเดิมทั้งหมด */}
  {product.product_status && (
 <Badge 
              className={`absolute top-2 left-2 border ${
                product.product_status === 'พร้อมส่ง' 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                : product.product_status === 'พรีออเดอร์'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
            </Badge>
  )}
</div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-purple-600">
              ฿{product.selling_price?.toLocaleString()}
            </span>
          </div>
          <div className="space-y-2 mt-auto">
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => { e.stopPropagation(); buyNow(product); }}
            >
              <CreditCard className="h-4 w-4" />
              ซื้อเดี๋ยวนี้
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            >
              <ShoppingCart className="h-4 w-4" />
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategorySection = ({ title, products, categoryName }: { title: string; products: ProductPublic[]; categoryName: string }) => (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link 
            to={`/categories?category=${encodeURIComponent(categoryName)}`}
            className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            ไม่พบสินค้าในหมวดหมู่นี้
          </div>
        )}
      </div>
    </section>
  );

  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => (
    <section className="py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {title && <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>}
        {banners.length > 0 ? (
          <div className="h-40 md:h-60 rounded-lg overflow-hidden">
            <Carousel 
              className="w-full h-full"
              plugins={[
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: true,
                })
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative h-40 md:h-60 overflow-hidden rounded-lg">
                      <img
                        src={banner.image_url || '/placeholder.svg'}
                        alt={banner.title || 'Banner'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Banner image failed to load:', banner.image_url);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {(banner.title || banner.description) && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="text-center text-white max-w-md px-4">
                            {banner.title && <h2 className="text-xl md:text-2xl font-bold mb-2">{banner.title}</h2>}
                            {banner.description && <p className="text-sm md:text-base">{banner.description}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        ) : (
          <div className="h-40 md:h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">ส่วนลดพิเศษ</h3>
              <p className="text-sm md:text-base">สินค้าคุณภาพ ราคาดีที่สุด</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main banner section */}
      <section className="relative">
        {mainBanners.length > 0 ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Carousel 
              className="w-full h-64 md:h-80"
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: true,
                })
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {mainBanners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                      <img
                        src={banner.image_url || '/placeholder.svg'}
                        alt={banner.title || 'Banner'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Banner image failed to load:', banner.image_url);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {(banner.title || banner.description) && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="text-center text-white max-w-md px-4">
                            {banner.title && <h2 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h2>}
                            {banner.description && <p className="text-sm md:text-base">{banner.description}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="h-64 md:h-80 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">ยินดีต้อนรับสู่ Lucky Shop</h2>
                <p className="text-sm md:text-base">สินค้าจากจีนคุณภาพดี ราคาดี</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Categories section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200">
                  <CardContent className="p-2">
                    <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>
                    <h3 className="font-medium text-xs text-center text-gray-800 line-clamp-2 leading-tight">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products section */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <FeaturedProductsCarousel 
              products={featuredProducts}
              onProductClick={handleProductClick}
              onAddToCart={addToCart}
            />
          )}
        </div>
      </section>

      {/* Banner sections and category sections */}
      {secondBanners.length > 0 && <BannerSection banners={secondBanners} />}

      {homepageCategories.map((category) => (
        <CategorySection 
          key={category.id}
          title={category.name} 
          products={categoryProducts[category.name] || []} 
          categoryName={category.name} 
        />
      ))}

      {thirdBanners.length > 0 && <BannerSection banners={thirdBanners} />}
      {fourthBanners.length > 0 && <BannerSection banners={fourthBanners} />}
    </div>
  );
};

export default Index;
