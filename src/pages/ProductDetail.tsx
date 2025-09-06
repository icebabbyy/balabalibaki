import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ProductPublic } from "@/types/product";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import { ArrowLeft, ShoppingCart, CreditCard, Heart, Tag, Package, Clock, Calendar } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { toDisplaySrc } from "@/lib/imageUrl";

/* utils */
const uniq = (arr: (string | undefined | null)[]) =>
  Array.from(new Set(arr.filter(Boolean))) as string[];

const extractAllImages = (p: any): string[] => {
  const fromImages =
    Array.isArray(p.images) ? p.images.map((im: any) => im?.image_url || im) : [];
  const fromProductImages =
    Array.isArray(p.product_images) ? p.product_images.map((im: any) => im?.image_url || im) : [];
  return uniq([p.main_image_url, ...fromProductImages, ...fromImages, p.image_url, p.image]);
};

const tagsToList = (tags: any): { id?: number; name: string }[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    if (typeof tags[0] === "string") return (tags as string[]).map((name) => ({ name }));
    return (tags as any[]).map((t) => ({ id: t.id, name: t.name ?? String(t) }));
  }
  return [];
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  /* ---------- state ---------- */
  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  /* ---------- effects ---------- */
  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("public_products")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          navigate("/404");
          return;
        }

        setProduct(data as any);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await checkWishlistStatus(currentUser.id, (data as any).id);
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const checkWishlistStatus = async (userId: string, productId: number) => {
    setIsWishlistLoading(true);
    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      setIsInWishlist(!!data);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user || !product) {
      toast.info("กรุณาล็อกอินเพื่อใช้ฟังก์ชัน Wishlist");
      if (!user) navigate("/auth");
      return;
    }
    setIsWishlistLoading(true);
    try {
      if (isInWishlist) {
        await supabase.from("wishlist_items").delete().match({ user_id: user.id, product_id: product.id });
        setIsInWishlist(false);
        toast.success(`ลบ "${product.name}" ออกจาก Wishlist แล้ว`);
      } else {
        await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: product.id });
        setIsInWishlist(true);
        toast.success(`เพิ่ม "${product.name}" เข้าสู่ Wishlist แล้ว`);
      }
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", { description: error.message });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleTagClick = (tagName: string) =>
    navigate(`/products/tag/${encodeURIComponent(tagName)}`);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, selected_variant: selectedVariant ?? undefined } as any, quantity);
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const handleVariantChange = (variant: any) => {
    if (selectedVariant?.id === variant?.id) setSelectedVariant(null);
    else setSelectedVariant(variant);
  };

  /* ---------- memo (ประกาศก่อน return เสมอ) ---------- */
  const baseImages = useMemo(() => extractAllImages(product || {}), [product]);
  const selectedImage = selectedVariant?.image_url || selectedVariant?.image || undefined;
  const galleryImages = useMemo(() => {
    const urls = selectedImage ? uniq([selectedImage, ...baseImages]) : baseImages;
    return urls.map((u) => toDisplaySrc(u, { w: 1200, q: 85 }));
  }, [selectedImage, baseImages]);

  const mainImage = galleryImages[0] || "/placeholder.svg";
  const additionalImages = galleryImages.slice(1);

  const tagList = useMemo(() => tagsToList((product as any)?.tags), [product]);
  const categoryName = (product as any)?.category || (product as any)?.category_name || "";

  /* ---------- render ---------- */
  if (loading) {
    return <div className="flex justify-center items-center h-screen">กำลังโหลด...</div>;
  }
  if (!product) {
    return <div className="flex justify-center items-center h-screen">ไม่พบสินค้า</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ProductBreadcrumb category={categoryName} productName={product.name} />

          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* รูป + หัวใจ overlay */}
            <div className="relative">
              <ProductImageGallery
                key={selectedImage ? `v-${selectedImage}` : `p-${product.id}`}
                mainImage={mainImage}
                additionalImages={additionalImages}
                productName={product.name}
              />
              <button
                aria-label="wishlist"
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
                className={`absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 backdrop-blur hover:bg-white shadow ${
                  isInWishlist ? "text-red-500" : "text-gray-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500" : ""}`} />
              </button>
            </div>

            {/* ข้อมูลสินค้า */}
            <div className="flex flex-col space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              <p className="text-4xl font-bold text-purple-600">฿{product.selling_price?.toLocaleString()}</p>

              {/* แถวปุ่มซื้อ + จำนวน */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 font-semibold select-none">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-l-none"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>

                <Button onClick={handleBuyNow} className="h-9" style={{ backgroundColor: "#956ec3" }}>
                  <CreditCard className="mr-2 h-5 w-5" /> ซื้อเดี๋ยวนี้
                </Button>
                <Button onClick={handleAddToCart} variant="outline" className="h-9">
                  <ShoppingCart className="mr-2 h-5 w-5" /> เพิ่มลงตะกร้า
                </Button>
              </div>

              {/* กล่องข้อมูลย่อย: sku/status/tags */}
              <div className="border bg-white rounded-lg p-4 space-y-3">

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">สถานะ:</span>
                  <button
                    className="text-sm rounded bg-orange-100 text-orange-800 px-2 py-0.5 hover:underline"
                    onClick={() =>
                      navigate(`/categories?status=${encodeURIComponent(product.product_status || "")}`)
                    }
                  >
                    {product.product_status || "-"}
                  </button>
                </div>

                {["พร้อมส่ง", "พรีออเดอร์", "pre-sale"].includes(product.product_status || "") && (
                  <div className="flex items-center gap-3 pt-3 border-t">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-800">
                      {product.product_status === "พร้อมส่ง" && "จัดส่งภายใน 1-3 วัน"}
                      {product.product_status === "พรีออเดอร์" && "ระยะเวลา 10–17 วัน ขึ้นอยู่กับการจัดส่งของ Official"}
                      {product.product_status === "pre-sale" && product.shipment_date && (
                        <>กำหนดส่ง (โดยประมาณ): <span className="underline">{product.shipment_date}</span></>
                      )}
                    </span>
                  </div>
                )}

                {tagList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                    <Tag className="h-4 w-4 text-gray-500 mr-1" />
                    {tagList.map((tag) => (
                      <Badge
                        key={tag.id ?? tag.name}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleTagClick(tag.name)}
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* DESCRIPTION (สั้น) */}
              <div className="border-2 border-purple-200 rounded-lg bg-white p-6">
                <h3 className="font-semibold text-purple-900 mb-2">รายละเอียดสินค้า</h3>
                <p className="text-sm text-gray-800 whitespace-pre-line leading-4 line-clamp-6">
                  {product.description || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* กล่องกว้าง: “รายละเอียดเพิ่มเติม” (static) */}
          <div className="mt-10 border-2 border-purple-200 rounded-lg bg-white p-6">
            <h3 className="font-semibold text-purple-900 mb-3">
              รายละเอียดเพิ่มเติม
            </h3>
            <p className="text-sm text-gray-500">
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
