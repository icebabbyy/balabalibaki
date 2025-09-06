import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ProductPublic } from "@/types/product";
import { toDisplaySrc } from "@/lib/imageUrl";
import ElfsightChat from "@/components/ElfsightChat";

import Header from "@/components/Header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";
import SubcategoryShowcase from "@/components/sections/SubcategoryShowcase";

interface Banner {
  id: string;
  image_url: string;
  link_url?: string;
  position: number;
  title?: string;
}
interface Category {
  id: number;
  name: string;
  image?: string;
}

/** map แถวจาก view public_products → ProductPublic */
const mapProduct = (item: any): ProductPublic | null => {
  if (!item) return null;

  const fromProductImages =
    Array.isArray(item.product_images) && item.product_images.length > 0
      ? item.product_images
          .map((img: any) => img?.image_url || img?.url)
          .filter((u: any) => typeof u === "string" && u.trim())
      : [];

  const fromImagesField = Array.isArray(item.images)
    ? item.images
        .map((im: any) => (typeof im === "string" ? im : im?.image_url || im?.url))
        .filter((u: any) => typeof u === "string" && u.trim())
    : [];

  const primaryCandidate =
    (typeof item.main_image_url === "string" && item.main_image_url.trim()) ||
    (typeof item.main_image === "string" && item.main_image.trim()) ||
    (fromProductImages[0] as string | undefined) ||
    (fromImagesField[0] as string | undefined) ||
    (typeof item.image_url === "string" && item.image_url.trim()) ||
    (typeof item.imageUrl === "string" && item.imageUrl.trim()) ||
    (typeof item.image === "string" && item.image.trim()) ||
    (typeof item.thumbnail_url === "string" && item.thumbnail_url.trim()) ||
    (typeof item.thumbnail === "string" && item.thumbnail.trim()) ||
    undefined;

  const allRaw: string[] = [
    primaryCandidate,
    ...fromProductImages,
    ...fromImagesField,
    item.image_url,
    item.imageUrl,
    item.image,
    item.main_image_url,
    item.main_image,
    item.thumbnail_url,
    item.thumbnail,
  ].filter((u: any) => typeof u === "string" && u.trim()) as string[];

  const unique = Array.from(new Set(allRaw));

  const all_images = unique.map((u, idx) => ({
    id: idx,
    image_url: u,
    order: idx,
  }));

  return {
    id: Number(item.id ?? 0),
    name: String(item.name ?? ""),
    selling_price: Number(item.selling_price ?? item.sellingPrice ?? 0),
    description: String(item.description ?? ""),
    image: primaryCandidate,
    image_url: item.image_url ?? item.imageUrl ?? undefined,
    main_image_url: item.main_image_url ?? item.main_image ?? undefined,
    product_status: String(item.product_status ?? item.status ?? "พรีออเดอร์"),
    sku: String(item.sku ?? ""),
    quantity: Number(item.quantity ?? 0),
    shipment_date: item.shipment_date ?? null,
    options: item.options ?? [],
    product_type: String(item.product_type ?? "standard"),
    created_at: item.created_at ?? null,
    updated_at: item.updated_at ?? null,
    slug: item.slug ?? String(item.id),
    category: String(item.category ?? ""),
    category_name: item.category_name ?? "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    product_images: all_images,
    images: all_images,
    all_images,
  };
};

const Index = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homepageCategoryProducts, setHomepageCategoryProducts] = useState<
    Record<string, ProductPublic[]>
  >({});

  const [loading, setLoading] = useState({
    banners: true,
    featured: true,
    categories: true,
    homepageProducts: true,
  });
  const stopLoading = (part: keyof typeof loading) =>
    setLoading((prev) => ({ ...prev, [part]: false }));

  // banners
  useEffect(() => {
    supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("position")
      .then(({ data, error }) => {
        if (error) console.error("Error fetching banners:", error);
        else setBanners(data || []);
        stopLoading("banners");
      });
  }, []);

  // featured
  useEffect(() => {
    supabase
      .from("public_products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching featured products:", error);
          setFeaturedProducts([]);
        } else {
          const mapped = (data || []).map(mapProduct).filter(Boolean) as ProductPublic[];
          setFeaturedProducts(mapped);
        }
        stopLoading("featured");
      });
  }, []);

  // categories for name->id map
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("display_on_homepage", true)
      .order("homepage_order")
      .then(({ data, error }) => {
        if (error) console.error("Error fetching all categories:", error);
        else setAllCategories(data || []);
        stopLoading("categories");
      });
  }, []);

  const nameToId = useMemo(
    () => new Map(allCategories.map((c) => [c.name, c.id])),
    [allCategories]
  );

  // homepage subcategory products
  useEffect(() => {
    let cancelled = false;

    const displayCategoryNames = [
      "Honkai : Star Rail",
      "Nikke",
      "League of Legends",
      "Valorant",
      "Zenless Zone Zero",
    ];

    const fetchHomepageProducts = async () => {
      try {
        const results = await Promise.all(
          displayCategoryNames.map(async (cat) => {
            const catId = nameToId.get(cat);

            const orFilters = [
              `category_name.ilike.*${cat}*`, // จับชื่อแบบไม่สนเคส/มีช่องว่าง
              catId ? `category_id.eq.${catId}` : "",
            ]
              .filter(Boolean)
              .join(",");

            const res = await supabase
              .from("public_products")
              .select("*")
              .or(orFilters)
              .order("created_at", { ascending: false })
              .limit(24);

            return { cat, res };
          })
        );

        if (cancelled) return;

        const map: Record<string, ProductPublic[]> = {};
        results.forEach(({ cat, res }) => {
          if (res.error) {
            console.error("Error fetching products for category:", cat, res.error);
            map[cat] = [];
          } else {
            map[cat] = ((res.data || []).map(mapProduct).filter(Boolean) as ProductPublic[]).slice(
              0,
              8
            ); // ส่งมากสุด 8 → component จัด 3+5
          }
        });

        setHomepageCategoryProducts(map);
      } finally {
        if (!cancelled) stopLoading("homepageProducts");
      }
    };

    if (!loading.categories) fetchHomepageProducts();
    return () => {
      cancelled = true;
    };
  }, [loading.categories, nameToId]);

  const handleProductClick = (productId: number) => {
    const allProducts = [
      ...featuredProducts,
      ...Object.values(homepageCategoryProducts).flat(),
    ];
    const product = allProducts.find((p) => p && p.id === productId);
    if (product) navigate(`/product/${product.slug || product.id}`);
  };

  const isPageLoading = Object.values(loading).some((s) => s);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {isPageLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      ) : (
        <>
          <BannerSection
            banners={banners.filter((b) => b.position === 1)}
            aspectRatio="1400/400"
            autoPlay
          />

          <CategoryGridSection categories={allCategories} />

          <FeaturedProductsSection
            products={featuredProducts}
            onProductClick={handleProductClick}
          />

          {/* แบนเนอร์ย่อย + 3 + 5 */}
          <SubcategoryShowcase
            title="Honkai : Star Rail"
  bannerImage="https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/1500x500.jpg"  // ✅ ใส่เองได้
  products={homepageCategoryProducts["Honkai : Star Rail"] || []}
  onProductClick={handleProductClick}
/>
          <SubcategoryShowcase
            title="Nikke"
bannerImage="https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/Screenshot_139.png"  // ✅ ใส่เองได้
  products={homepageCategoryProducts["Nikke"] || []}
  onProductClick={handleProductClick}
/>

          <BannerSection
            banners={banners.filter((b) => b.position === 2)}
            small
            aspectRatio="1400/400"
          />
          <BannerSection
            banners={banners.filter((b) => b.position === 3)}
            small
            autoPlay
            aspectRatio="1400/400"
          />

          <SubcategoryShowcase
            title="League of Legends"
  bannerImage="https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/n68317.jpeg"  // ✅ ใส่เองได้
  products={homepageCategoryProducts["League of Legends"] || []}
  onProductClick={handleProductClick}
/>
          <SubcategoryShowcase
            title="Valorant"
  bannerImage="https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/960x0.jpg"  // ✅ ใส่เองได้
  products={homepageCategoryProducts["Valorant"] || []}
  onProductClick={handleProductClick}
/>

          <BannerSection
            banners={banners.filter((b) => b.position === 4)}
            small
            aspectRatio="1400/400"
          />

          <SubcategoryShowcase
  title="Zenless Zone Zero"
  bannerImage="https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/Screenshot_138.png"  // ✅ ใส่เองได้
  products={homepageCategoryProducts["Zenless Zone Zero"] || []}
  onProductClick={handleProductClick}
/>
 <SubcategoryShowcase
            title="Genshin Impact"
  bannerImage="https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/1500x500%20(1).jpg"  // ✅ ใส่เองได้
  products={homepageCategoryProducts["Genshin Impact"] || []}
  onProductClick={handleProductClick}
/>
        </>
      )}
    </div>
  );
};

/* ---------- helper components (Banner/CategoryGrid/Featured/CategorySection) ---------- */
const BannerSection = ({
  banners,
  small,
  autoPlay,
  aspectRatio,
}: {
  banners: Banner[];
  small?: boolean;
  autoPlay?: boolean;
  aspectRatio?: string;
}) => {
  if (!banners || banners.length === 0) return null;

  // ✅ รองรับทั้ง URL เต็ม และ "พาธสั้นของ storage" เช่น public-images/xxx.jpg
  const normalizeBannerSrc = (u?: string): string => {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u; // เป็น URL เต็มอยู่แล้ว

    // เป็นพาธสั้น "bucket/path/to/file"
    const trimmed = u.replace(/^\/+/, "");
    const [bucket, ...rest] = trimmed.split("/");
    if (!bucket || rest.length === 0) return u;

    // แปลงเป็น public URL จาก storage
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(rest.join("/"));
    return data?.publicUrl || u;
  };

  const plugins = autoPlay ? [Autoplay({ delay: 4000, stopOnInteraction: true })] : [];

  return (
    <section className="py-8">
      <div className={`mx-auto px-4 ${small ? "max-w-6xl" : "max-w-7xl"}`}>
        <Carousel plugins={plugins as any} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map((banner) => {
              // ✅ แปลงให้ชัวร์ก่อน แล้วค่อย proxy ผ่าน toDisplaySrc
              const raw = normalizeBannerSrc(banner.image_url);
              const proxied = raw ? toDisplaySrc(raw, { w: 1400, q: 85 }) : "";
              const src = proxied || raw || undefined;

              return (
                <CarouselItem key={banner.id}>
                  {src ? (
                    <Link to={banner.link_url || "#"} rel="noopener noreferrer">
                      <img
                        src={src}
                        alt={banner.title || "Banner"}
                        className="w-full h-auto object-cover rounded-lg"
                        style={{ aspectRatio: aspectRatio || "1400/400" }}
                        onError={(e) => {
                          // fallback กลับไปใช้ raw ถ้า proxy ล่ม
                          if (raw && e.currentTarget.src !== raw) {
                            e.currentTarget.src = raw;
                          } else {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }
                        }}
                      />
                    </Link>
                  ) : (
                    <div
                      className="w-full rounded-lg bg-gray-200"
                      style={{ aspectRatio: aspectRatio || "1400/400" }}
                    />
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-2 hidden md:flex" />
          <CarouselNext className="right-2 hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

const CategoryGridSection = ({ categories }: { categories: Category[] }) => {
  if (!categories || categories.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">หมวดหมู่สินค้า</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-4">
          {categories.map((category) => {
            const fromProxy = category.image
              ? toDisplaySrc(category.image, { w: 300, q: 85 })
              : "";
            const src = fromProxy || category.image || undefined;

            return (
              <Link
                key={category.id}
                to={`/categories?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-purple-200 transition-all flex items-center justify-center">
                  {src ? (
                    <img
                      src={src}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const raw = category.image;
                        if (raw && e.currentTarget.src !== raw) {
                          e.currentTarget.src = raw;
                        } else {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <h3 className="font-medium text-xs text-center mt-2 group-hover:text-purple-600 truncate">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FeaturedProductsSection = ({
  products,
  onProductClick,
}: {
  products: ProductPublic[];
  onProductClick: (id: number) => void;
}) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">สินค้ามาใหม่</h2>
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })] as any}
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <EnhancedProductCard product={product} onProductClick={onProductClick} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 hidden md:flex" />
          <CarouselNext className="right-2 hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

/* คง CategorySection ไว้ (เผื่อใช้หน้าอื่น) และย่อขนาดลงเล็กน้อย */
export const CategorySection = ({
  title,
  products,
  onProductClick,
}: {
  title: string;
  products: ProductPublic[];
  onProductClick: (id: number) => void;
}) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link
            to={`/categories?category=${encodeURIComponent(title)}`}
            className="flex items-center text-purple-600"
          >
            ดูทั้งหมด <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {products.map((p) => (
            <EnhancedProductCard key={p.id} product={p} onProductClick={onProductClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Index;
