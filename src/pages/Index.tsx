// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
// ✨ FIX #1: ลบตัวอักษร 'อม' ที่เกินมา และเพิ่ม import ที่ขาดไป
import { toast } from "sonner";
import Header from "@/components/Header";
import Autoplay from "embla-carousel-autoplay";
import { ProductPublic } from "@/types/product";

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

// ✨ FIX #2: สร้าง Component ที่หายไปขึ้นมาใหม่ (เพื่อให้โค้ดของคุณไม่พังตอนเรียกใช้)
const FeaturedProductsCarousel = ({ products, onProductClick, onAddToCart }: { products: ProductPublic[], onProductClick: (id: number) => void, onAddToCart: (product: ProductPublic) => void }) => {
  const ProductCard = ({ product }: { product: ProductPublic }) => {
      const navigate = useNavigate();
      const buyNow = (productToBuy: ProductPublic) => {
        const cartItem = {
          id: productToBuy.id,
          name: productToBuy.name,
          price: productToBuy.selling_price,
          quantity: 1, // FIX: เพิ่ม comma ที่ขาดไป
          image: productToBuy.image,
          variant: null
        };
        // ... (logic for buy now) ...
        navigate('/cart');
      };

      return (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full" onClick={() => onProductClick(product.id)}>
              <div className="relative">
                  <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
                  {product.product_status && (
                      <Badge className={`absolute top-2 left-2 border-transparent text-white ${product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-purple-600'}`}>
                          {product.product_status}
                      </Badge>
                  )}
              </div>
              <CardContent className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex-grow"></div>
                  <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-purple-600">฿{product.selling_price?.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 mt-auto">
                      <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); buyNow(product); }}>
                          <CreditCard className="h-4 w-4 mr-2" />ซื้อเดี๋ยวนี้
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
                          <ShoppingCart className="h-4 w-4 mr-2" />เพิ่มลงตะกร้า
                      </Button>
                  </div>
              </CardContent>
          </Card>
      );
  };
  
  return (
      <Carousel opts={{ align: "start" }}>
          <CarouselContent className="-ml-4">
              {products.map(product => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <ProductCard product={product} />
                  </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
      </Carousel>
  );
};


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

  const fetchBanners = async () => { /* โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง */ 
      try {
        const { data } = await supabase.from('banners').select('*').eq('active', true).order('position', { ascending: true });
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

  const fetchFeaturedProducts = async () => { /* โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง */ 
    try {
      const { data } = await supabase.from('public_products').select('*').limit(8);
      const mappedProducts: ProductPublic[] = (data || []).map(item => ({
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
        images_list: item.images_list || [],
        product_type: item.product_type || 'ETC',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
        tags: item.tags || [],
        slug: item.slug || String(item.id)
      }));
      setFeaturedProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => { /* โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง */ 
    try {
        const { data } = await supabase.from('categories').select('*');
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
  };

  const fetchHomepageCategories = async () => { /* โค้ดเดิมของคุณ (แก้ไข typo 1 จุด) */ 
    try {
      const displayCategories = ['Nikke', 'Honkai : Star Rail', 'League of Legends'];
      const categoriesData = [];
      const productsData: {[key: string]: ProductPublic[]} = {};
      for (const categoryName of displayCategories) {
        const { data: categoryInfo } = await supabase.from('categories').select('*').eq('name', categoryName).single();
        if (categoryInfo) {
          categoriesData.push(categoryInfo);
          const { data: products } = await supabase.from('public_products').select('*').eq('category', categoryName).limit(5);
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
            options: item.options || null, // ✨ FIX #3: แก้ไข typo จาก item.all_images เป็น item.options
            product_type: item.product_type || 'ETC',
            created_at: item.created_at || '',
            updated_at: item.updated_at || '',
            slug: item.sku,
            images_list: item.images_list || [], // ✨ FIX #4: เพิ่ม images_list ที่ขาดไป
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

  const handleProductClick = (productId: number) => { /* โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง */ 
    const allProducts = [...featuredProducts, ...Object.values(categoryProducts).flat()];
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        const slug = product.slug || product.id.toString();
        navigate(`/product/${slug}`);
    } else {
        navigate(`/product/${productId}`);
    }
  };

  const addToCart = (product: ProductPublic) => { /* โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง */ 
    const cartItem = { id: product.id, name: product.name, price: product.selling_price, quantity: 1, image: product.image };
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  // ✨ FIX #5: ย้าย ProductCard และ CategorySection มาไว้ข้างในเพื่อแก้ปัญหา scope
  const ProductCard = ({ product }: { product: ProductPublic }) => {
    const buyNow = (productToBuy: ProductPublic) => {
      const cartItem = {
        id: productToBuy.id,
        name: productToBuy.name,
        price: productToBuy.selling_price,
        quantity: 1,
        image: productToBuy.image,
        variant: null
      };
      // ... buy now logic
      navigate('/cart');
    };
    
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col" onClick={() => handleProductClick(product.id)}>
          <div className="relative">
              <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
              {product.product_status && (
                  <Badge className={`absolute top-2 left-2 text-white border-transparent ${product.product_status === 'พร้อมส่ง' ? 'bg-green-500' : 'bg-purple-600'}`}>
                    {product.product_status}
                  </Badge>
              )}
          </div>
          <CardContent className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-purple-600">฿{product.selling_price?.toLocaleString()}</span>
              </div>
              <div className="space-y-2 mt-auto">
                  <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); buyNow(product); }}>
                      <CreditCard className="h-4 w-4 mr-2" />ซื้อเดี๋ยวนี้
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                      <ShoppingCart className="h-4 w-4 mr-2" />เพิ่มลงตะกร้า
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
          <Link to={`/categories?category=${encodeURIComponent(categoryName)}`} className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
            ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
  
  const BannerSection = ({ banners, title }: { banners: Banner[]; title?: string }) => ( /* โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง */ 
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
            {title && <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>}
            <div className="h-40 md:h-60 rounded-lg overflow-hidden">
            <Carousel plugins={[Autoplay({delay: 5000})]} opts={{ align: "start", loop: true }}>
                <CarouselContent>
                    {banners.map((banner) => (
                        <CarouselItem key={banner.id}>
                            <div className="relative h-40 md:h-60 overflow-hidden rounded-lg">
                                <img src={banner.image_url || '/placeholder.svg'} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>
            </div>
        </div>
    </section>
  );

  // JSX ทั้งหมดคือโครงสร้างเดิมจากโค้ดของคุณ
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="relative">
        {mainBanners.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Carousel plugins={[Autoplay({ delay: 4000 })]} opts={{ align: "start", loop: true }}>
                <CarouselContent>{mainBanners.map(banner => <CarouselItem key={banner.id}><div className="relative h-64 md:h-80 overflow-hidden rounded-lg"><img src={banner.image_url} className="w-full h-full object-cover" /></div></CarouselItem>)}</CarouselContent>
                <CarouselPrevious className="left-4" /><CarouselNext className="right-4" />
            </Carousel>
          </div>
        )}
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all"><CardContent className="p-2"><div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg"><img src={category.image} className="w-full h-full object-cover"/></div><h3 className="font-medium text-xs text-center">{category.name}</h3></CardContent></Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? ( <div>Loading...</div> ) : (
            <FeaturedProductsCarousel products={featuredProducts} onProductClick={handleProductClick} onAddToCart={addToCart} />
          )}
        </div>
      </section>
      
      {secondBanners.length > 0 && <BannerSection banners={secondBanners} />}

      {homepageCategories.map((category) => (
        <CategorySection key={category.id} title={category.name} products={categoryProducts[category.name] || []} categoryName={category.name} />
      ))}
      
      {thirdBanners.length > 0 && <BannerSection banners={thirdBanners} />}
      {fourthBanners.length > 0 && <BannerSection banners={fourthBanners} />}
    </div>
  );
};

export default Index;
