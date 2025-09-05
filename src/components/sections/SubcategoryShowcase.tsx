import * as React from "react";
import { Link } from "react-router-dom";
import type { ProductPublic } from "@/types/product";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";
import { toDisplaySrc } from "@/lib/imageUrl";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

/* ----------------------------- helpers ----------------------------- */
const imgW = (raw?: string, w = 1300, q = 85) =>
  raw ? toDisplaySrc(raw, { w, q }) || raw : "";

function collectImagesFlexible(p: any): string[] {
  const out: string[] = [];
  const push = (u?: string | null) => {
    if (typeof u === "string" && u.trim() && !out.includes(u)) out.push(u.trim());
  };
  push(p?.main_image_url);
  push(p?.main_image);
  push(p?.image_url);
  push(p?.imageUrl);
  push(p?.image);
  push(p?.thumbnail_url);
  push(p?.thumbnail);
  const from = (arr?: any[]) =>
    Array.isArray(arr)
      ? arr.forEach((im: any) => push(typeof im === "string" ? im : im?.image_url || im?.url))
      : null;
  from(p?.all_images);
  from(p?.product_images);
  from(p?.images);
  return out;
}

/* ------------------ การ์ดสินค้าเล็กที่อยู่ "บนแบนเนอร์" ------------------ */
/* ปรับเฉพาะ 'รูป' ให้ใหญ่ขึ้น (object-cover) โดยคงความกว้างการ์ดเดิม */
function BannerInlineItem({
  product,
  onClick,
}: {
  product: ProductPublic;
  onClick: (id: number) => void;
}) {
  const { addToCart } = useCart();
  const imgs = collectImagesFlexible(product as any);
  const main = imgs[0] || "";
  const hover = imgs.find((u) => u && u !== main);
  const price = Number((product as any).selling_price ?? 0) || 0;

  return (
    <div
      className="group w-[200px] bg-white rounded-lg overflow-hidden cursor-pointer"
      onClick={() => onClick((product as any).id)}
    >
      {/* โซนรูป: ปรับให้เต็มเฟรม ไม่เหลือขอบขาว */}
      <div className="relative w-full h-[180px]">
        {main && (
          <img
            src={imgW(main, 700)}
            alt={(product as any).name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
        )}
        {hover && (
          <img
            src={imgW(hover, 700)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
        )}
      </div>

      {/* ชื่อ + ราคา + ตะกร้า */}
      <div className="p-3">
        <div className="text-xs text-gray-800 font-medium truncate">
          {(product as any).name}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-base font-bold text-gray-900">
            ฿{price.toLocaleString()}
          </div>
          <button
            type="button"
            aria-label="เพิ่มลงตะกร้า"
            title="เพิ่มลงตะกร้า"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 w-9 h-9 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product as any, 1);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- main props ----------------------------- */
type Props = {
  title: string;
  bannerImage?: string;  // รูปแบนเนอร์กำหนดเอง
  link?: string;         // ลิงก์ “ดูเพิ่มเติม”
  products: ProductPublic[];
  onProductClick?: (id: number) => void;
};

/* ------------------------- SubcategoryShowcase ------------------------- */
export default function SubcategoryShowcase({
  title,
  bannerImage,
  link,
  products,
  onProductClick,
}: Props) {
  const all = products || [];
  const top3 = all.slice(0, 3);
  const bottomUpTo5 = all.slice(0, 5);

  const fallbackBanner =
    bannerImage ||
    (top3[0] ? collectImagesFlexible(top3[0])[0] : undefined) ||
    undefined;

  return (
    <section className="py-10 bg-white">
      <div className="mx-auto w-full max-w-[1300px] px-4">
        {/* ----------------------- แบนเนอร์ 1300x350 ----------------------- */}
        <div className="relative w-full h-[200px] sm:h-[260px] lg:h-[350px] rounded-2xl overflow-hidden bg-gray-200">
          {fallbackBanner && (
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url('${imgW(fallbackBanner, 1600)}')` }}
            />
          )}

          {/* ไล่เฉดซ้าย -> โปร่งขวาเพื่อให้อ่านชื่อได้ชัด */}
          <div className="absolute inset-y-0 left-0 right-[min(35%,520px)] bg-gradient-to-r from-black/45 via-black/20 to-transparent" />

          {/* ชื่อหมวด + ลิงก์ดูเพิ่มเติม */}
          <div className="absolute inset-x-0 top-0 px-4 sm:px-6 pt-4 flex items-start justify-between">
            <h2 className="text-white text-2xl sm:text-3xl font-semibold drop-shadow">
              {title}
            </h2>
            {link && (
              <Link
                to={link}
                className="text-white underline underline-offset-4 decoration-white/70 hover:decoration-white"
              >
                ดูเพิ่มเติม
              </Link>
            )}
          </div>

          {/* ถาดสินค้าเล็กฝั่งขวา (ไม่ขยายการ์ด, รูปเต็มเฟรม) */}
          {top3.length > 0 && (
            <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2">
              <div className="inline-block bg-white rounded-xl shadow-[0_8px_24px_rgba(16,24,40,0.08)] px-4 py-4">
                <div className="grid grid-flow-col auto-cols-[200px] gap-2">
                  {top3.map((p) => (
                    <BannerInlineItem
                      key={p.id}
                      product={p}
                      onClick={onProductClick || (() => {})}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* จอเล็ก: แสดง 2–3 คอลัมน์ใต้แบนเนอร์แทนถาดด้านขวา */}
        {top3.length > 0 && (
          <div className="lg:hidden mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {top3.map((p) => (
              <EnhancedProductCard
                key={p.id}
                product={p}
                onProductClick={onProductClick || (() => {})}
              />
            ))}
          </div>
        )}

        {/* แถวล่าง: ทำให้ขนาด “เท่า สินค้ามาใหม่” ไม่ยืดเต็มเมื่อมีแค่ 1–2 ชิ้น */}
        {bottomUpTo5.length > 0 && (
          <>
            {/* มือถือ/จอเล็ก -> ใช้ grid ปกติ */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 lg:hidden">
              {bottomUpTo5.map((p) => (
                <EnhancedProductCard
                  key={`bottom-sm-${p.id}`}
                  product={p}
                  onProductClick={onProductClick || (() => {})}
                />
              ))}
            </div>

            {/* จอใหญ่ -> การ์ดความกว้างคงที่ (ไม่ยืดเต็ม) เหมือน “สินค้ามาใหม่” */}
            <div className="mt-6 hidden lg:flex lg:flex-wrap lg:gap-4">
              {bottomUpTo5.map((p) => (
                <div
                  key={`bottom-lg-${p.id}`}
                  className="flex-none w-[220px] md:w-[230px] lg:w-[240px]"
                >
                  <EnhancedProductCard
                    product={p}
                    onProductClick={onProductClick || (() => {})}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
