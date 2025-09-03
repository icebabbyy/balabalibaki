// src/pages/Reviews.tsx
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Image as ImageIcon, Loader2 } from "lucide-react";
import TrustindexWidget from "@/components/TrustindexWidget";

const CSV_URL = "/data/shopee_reviews.csv";
const MANIFEST_URL = "/data/shopee_reviews_manifest.json"; // ออปชัน: หลายไฟล์
const SHOPEE_SHOP_REVIEWS_URL =
  "https://shopee.co.th/buyer/19960178/rating?shop_id=19958842";

const SHOPEE_STORE_URL = "https://shopee.co.th/wishyoulucky";
const SHOPEE_BANNER_URL =
  "https://cdn.shopify.com/s/files/1/0675/5552/4787/files/Shopee-banner.jpg?v=1734587122";

/** ตั้งค่าพฤติกรรม */
const MAX_REVIEWS = 1000;
const SHUFFLE_MODE: "daily" | "always" | "none" = "daily";

/** Types จาก CSV */
type CsvRow = {
  "User Id": string;
  "User Shop Id": string;
  "User Name": string;
  "Anonymous": "Yes" | "No";
  "Comment Id": string;
  "Comment Date": string;
  "Comment": string;
  "Rating": string;
  "Detail Rating": string;
  "Comment Images": string;
  "Comment Videos": string;
  "Bought Products": string;
  "Product Id": string;
  "Product Url": string;
  "Product Name": string;
  "Product Image": string;
  "Shop Id": string;
  "Region": string;
  "Scraped At": string;
};

type Review = {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  detail?: string;
  date: string;
  images: string[];
  videos: string[];
  productId: string;
  productName: string;
  productUrl: string;
  productImage?: string;
};

/** Helpers */
function splitList(s?: string) {
  if (!s) return [];
  return s
    .split(/\s*\|\s*|\s*,\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function renderStars(rating: number, size: "sm" | "md" = "sm") {
  const r = Math.round(rating);
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return [...Array(5)].map((_, i) => (
    <Star
      key={i}
      className={`${cls} ${i < r ? "text-yellow-400 fill-current" : "text-gray-300"}`}
    />
  ));
}

function parseCsv(url: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(url, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (res) => resolve((res.data || []) as CsvRow[]),
      error: (e) => reject(e),
    });
  });
}

// RNG สำหรับสุ่มแบบ deterministic รายวัน
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle<T>(arr: T[], seed: number) {
  const rand = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function todaySeed() {
  const d = new Date();
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate()
    ).padStart(2, "0")}`
  );
}

export default function Reviews() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let csvRows: CsvRow[] = [];
        try {
          const res = await fetch(MANIFEST_URL, { cache: "no-store" });
          if (res.ok) {
            const files: string[] = await res.json();
            const all = await Promise.all(files.map((u) => parseCsv(u)));
            csvRows = all.flat();
          } else {
            csvRows = await parseCsv(CSV_URL);
          }
        } catch {
          csvRows = await parseCsv(CSV_URL);
        }

        // dedupe
        const map = new Map<string, CsvRow>();
        for (const r of csvRows) {
          const key = r["Comment Id"] || `${r["Product Id"]}-${r["Comment Date"]}`;
          if (!map.has(key)) map.set(key, r);
        }
        setRows(Array.from(map.values()));
      } catch (e: any) {
        setErr(e?.message || "โหลดรีวิวไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reviews: Review[] = useMemo(() => {
    let list: Review[] = (rows || [])
      .map((r) => {
        const name =
          r.Anonymous === "Yes" ? "ผู้ใช้ไม่เปิดเผยชื่อ" : r["User Name"] || "ลูกค้า";
        const rating = Number(r.Rating) || 0;
        return {
          id: r["Comment Id"] || `${r["Product Id"]}-${r["Comment Date"]}`,
          customer: name,
          rating,
          comment: r.Comment || "",
          detail: r["Detail Rating"] || "",
          date: r["Comment Date"],
          images: splitList(r["Comment Images"]),
          videos: splitList(r["Comment Videos"]),
          productId: r["Product Id"],
          productName: r["Product Name"],
          productUrl: r["Product Url"],
          productImage: r["Product Image"],
        } as Review;
      })
      .filter((r) => r.productUrl);

    if (SHUFFLE_MODE === "daily") {
      list = seededShuffle(list, todaySeed());
    } else if (SHUFFLE_MODE === "always") {
      list = seededShuffle(list, Math.floor(Math.random() * 1e9));
    } else {
      list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }

    if (MAX_REVIEWS > 0) list = list.slice(0, MAX_REVIEWS);
    return list;
  }, [rows]);

  const summary = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? Math.round(
            (reviews.reduce((s, x) => s + (x.rating || 0), 0) / total) * 10
          ) / 10
        : 0;
    const withMedia = reviews.filter((r) => r.images.length > 0 || r.videos.length > 0).length;
    return { total, avg, withMedia };
  }, [reviews]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* หัวข้อกลาง */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">รีวิวจากลูกค้า</h1>
          <p className="text-gray-600">
            ทางร้านมีรีวิวจากหน้าเพจ Facebook และรีวิวจริงจาก Shopee (สุ่มแสดงรายวัน)
          </p>
        </div>

        {/* สรุปคะแนน (compact) */}
        <Card className="mb-6">
          <CardContent className="py-5">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                กำลังโหลดรีวิว...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex justify-center items-center space-x-1 mb-1.5">
                    {renderStars(Number.isFinite(summary.avg) ? Math.round(summary.avg) : 0, "md")}
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: "#956ec3" }}>
                    {summary.avg.toFixed(1)}/5
                  </h3>
                  <p className="text-gray-600 text-sm">คะแนนเฉลี่ย</p>
                </div>
                <div>
                  <Heart className="h-7 w-7 mx-auto mb-1.5" style={{ color: "#956ec3" }} />
                  <h3 className="text-xl font-bold" style={{ color: "#956ec3" }}>
                    {summary.total}
                  </h3>
                  <p className="text-gray-600 text-sm">จำนวนรีวิว</p>
                </div>
                <div>
                  <ImageIcon className="h-7 w-7 mx-auto mb-1.5" style={{ color: "#956ec3" }} />
                  <h3 className="text-xl font-bold" style={{ color: "#956ec3" }}>
                    {summary.withMedia}
                  </h3>
                  <p className="text-gray-600 text-sm">รีวิวที่มีรูป/วิดีโอ</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facebook Reviews (Trustindex) */}
        <div className="mb-8">
          <TrustindexWidget />
        </div>

        {/* แบนเนอร์ Shopee (กดแล้วไปหน้าร้าน) — วางก่อนรีวิว Shopee */}
        <div className="mb-4">
          <a
            href={SHOPEE_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title="ไปที่ร้านบน Shopee"
          >
            <img
              src={SHOPEE_BANNER_URL}
              alt="Shopee banner"
              loading="lazy"
              className="w-full h-32 md:h-40 lg:h-48 object-cover rounded-xl border shadow-sm hover:shadow-md transition"
            />
          </a>
        </div>

        {/* Shopee Reviews (2 คอลัมน์ กระชับ) */}
        {err && (
          <Card className="border-red-200 mb-6">
            <CardContent className="py-4 text-red-600">โหลดรีวิวไม่สำเร็จ: {err}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border rounded-xl">
              <div className="py-3 px-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-semibold truncate">{review.customer}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating, "sm")}</div>
                      <Badge variant="secondary" className="max-w-[18rem] truncate">
                        {review.productName}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{fmt(review.date)}</span>
                </div>

                <div className="pt-2">
                  {review.comment && (
                    <p className="text-gray-700 text-sm line-clamp-3 mb-2">{review.comment}</p>
                  )}
                  {review.detail && (
                    <p className="text-xs text-gray-500 mb-2">
                      {(review.detail || "").replace(/\r?\n/g, " · ")}
                    </p>
                  )}
                  {review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {review.images.slice(0, 3).map((url, i) => (
                        <img
                          key={`img-${i}`}
                          src={url}
                          alt={`รีวิวภาพที่ ${i + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                  <a
                    href={review.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-gray-600"
                  >
                    ดูสินค้าบน Shopee
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA ไปหน้ารีวิวรวมบน Shopee (คงไว้ด้านล่าง) */}
        <Card className="mt-8" style={{ borderColor: "#956ec3" }}>
          <CardContent className="py-5 text-center">
            <a
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "#956ec3", color: "#956ec3" }}
              href={SHOPEE_SHOP_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="เปิดหน้ารีวิวทั้งหมดบน Shopee"
            >
              ดูรีวิวทั้งหมดบน Shopee
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
