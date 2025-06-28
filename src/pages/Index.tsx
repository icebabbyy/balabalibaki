import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const Index = () => {
  const navigate = useNavigate();
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [secondBanners, setSecondBanners] = useState<Banner[]>([]);
  const [thirdBanners, setThirdBanners] = useState<Banner[]>([]);
  const [fourthBanners, setFourthBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductPublic[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
    fetchCategories();
    fetchHomepageCategories();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("position", { ascending: true });
    setMainBanners((data || []).filter((b) => b.position === 1));
    setSecondBanners((data || []).filter((b) => b.position === 2));
    setThirdBanners((data || []).filter((b) => b.position === 3));
    setFourthBanners((data || []).filter((b) => b.position === 4));
  };

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from("public_products")
      .select("*")
      .limit(8);
    const mapped = (data || []).map(mapProduct);
    setFeaturedProducts(mapped);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const fetchHomepageCategories = async () => {
    const display = ["Nikke", "Honkai : Star Rail", "League of Legends"];
    const cat: Category[] = [];
    const productMap: Record<string, ProductPublic[]> = {};

    for (const name of display) {
      const { data: catInfo } = await supabase
        .from("categories")
        .select("*")
        .eq("name", name)
        .single();
      if (catInfo) {
        cat.push(catInfo);
        const { data: products } = await supabase
          .from("public_products")
          .select("*")
          .eq("category", name)
          .limit(5);
        productMap[name] = (products || []).map(mapProduct);
      }
    }
    setHomepageCategories(cat);
    setCategoryProducts(productMap);
  };

  const mapProduct = (item: any): ProductPublic => ({
    id: item.id || 0,
    name: item.name || "",
    selling_price: item.selling_price || 0,
    category: item.category || "",
    description: item.description || "",
    image: item.image || "",
    product_status: item.product_status || "พรีออเดอร์",
    sku: item.sku || "",
    quantity: item.quantity || 0,
    shipment_date: item.shipment_date || "",
    options: item.options || null,
    images_list: item.images_list || [],
    product_type: item.product_type || "ETC",
    created_at: item.created_at || "",
    updated_at: item.updated_at || "",
    tags: item.tags || [],
    slug: item.slug || String(item.id),
  });

  const handleProductClick = (id: number) => {
    const all = [...featuredProducts, ...Object.values(categoryProducts).flat()];
    const found = all.find((p) => p.id === id);
    const slug = found?.slug || String(id);
    navigate(`/product/${slug}`);
  };

  const addToCart = (product: ProductPublic) => {
    const item = { id: product.id, name: product.name, price: product.selling_price, quantity: 1, image: product.image };
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = cart.findIndex((i: any) => i.id === product.id);
    if (index > -1) cart[index].quantity += 1;
    else cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  const ProductCard = ({ product }: { product: ProductPublic }) => {
    const buyNow = (p: ProductPublic) => {
      const item = { id: p.id, name: p.name, price: p.selling_price, quantity: 1, image: p.image, variant: null };
      navigate("/cart");
    };
    return (
      <Card className="hover:shadow-lg cursor-pointer flex flex-col" onClick={() => handleProductClick(product.id)}>
        <div className="relative">
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
          {product.product_status && (
            <Badge className={`absolute top-2 left-2 text-white border-transparent ${product.product_status === "พร้อมส่ง" ? "bg-green-500" : "bg-purple-600"}`}>
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

  const BannerSection = ({ banners }: { banners: Banner[] }) => (
    <section className="py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-40 md:h-60 rounded-lg overflow-hidden">
          <Carousel plugins={[Autoplay({ delay: 5000 })]} opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="relative h-40 md:h-60 overflow-hidden rounded-lg">
                    <img src={banner.image_url || "/placeholder.svg"} className="w-full h-full object-cover" />
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

  const FeaturedProductsCarousel = ({ products }: { products: ProductPublic[] }) => (
    <Carousel opts={{ align: "start" }}>
      <CarouselContent className="-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {mainBanners.length > 0 && <BannerSection banners={mainBanners} />}

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-2">
                    <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg">
                      <img src={category.image} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-medium text-xs text-center">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
          {loading ? <div>Loading...</div> : <FeaturedProductsCarousel products={featuredProducts} />}
        </div>
      </section>

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
