import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/hooks/useCart";
import { toDisplaySrc } from "@/lib/imageUrl";

/* ---------------- helpers: เลือกและแปลงรูป ---------------- */
const imgW = (raw?: string, w = 700, q = 85) =>
  raw ? toDisplaySrc(raw, { w, q }) || raw : "";

function pickPrimaryImage(p: any): string | undefined {
  const list: string[] = [];
  const push = (u?: string | null) => {
    if (typeof u === "string" && u.trim() && !list.includes(u)) list.push(u.trim());
  };

  // เดี่ยว
  push(p?.main_image_url);
  push(p?.main_image);
  push(p?.image_url);
  push(p?.imageUrl);
  push(p?.image);
  push(p?.thumbnail_url);
  push(p?.thumbnail);

  // Array
  const collect = (arr?: any[]) =>
    Array.isArray(arr)
      ? arr.forEach((im) =>
          push(typeof im === "string" ? im : im?.image_url || im?.url)
        )
      : null;

  collect(p?.product_images);
  collect(p?.images);
  collect(p?.all_images);

  return list[0];
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { loading, wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-600 font-medium">กำลังโหลดรายการโปรด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">รายการสินค้าที่ถูกใจ</h1>

        {(!wishlistItems || wishlistItems.length === 0) ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">ยังไม่มีสินค้าที่ถูกใจ</p>
            <Button onClick={() => navigate("/categories")}>เลือกซื้อสินค้า</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product: any) => {
              const raw = pickPrimaryImage(product);
              const src = imgW(raw, 800);
              const fallback = raw || "/placeholder.svg";

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <img
                      src={src || fallback}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer mb-4"
                      onClick={() =>
                        navigate(`/product/${product.slug || product.id}`)
                      }
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        if (fallback && el.src !== fallback) {
                          el.src = fallback;
                        } else {
                          el.src = "/placeholder.svg";
                        }
                      }}
                    />
                    <h3
                      className="font-semibold mb-2 cursor-pointer hover:text-purple-600 line-clamp-2"
                      onClick={() =>
                        navigate(`/product/${product.slug || product.id}`)
                      }
                    >
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-purple-600 mb-3">
                      ฿{Number(product.selling_price || 0).toLocaleString()}
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleWishlist(product)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        นำออกจากรายการโปรด
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => addToCart(product, 1)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        เพิ่มลงตะกร้า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
