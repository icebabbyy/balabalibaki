// src/pages/OrderHistory.tsx
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { X, ExternalLink, LogIn } from "lucide-react";

/* ---------- Types ---------- */
type DbOrder = {
  id: number;
  user_id?: string | null;
  order_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  items: any;
  subtotal: number | null;
  shipping_cost: number | null;
  total_price: number | null;
  status: string | null;
  tracking_number: string | null;
  deposit: number | null;
  discount: number | null;
  payment_method: string | null;
  created_at: string | null;
};

type OrderItem = {
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number | null;
  image_url: string | null;
  releaseDate: string | null;
  shipment_month: string | null;
};

interface Order {
  id: number;
  username: string;
  phone: string | null;
  status: string;
  tracking_number: string | null;
  payment_method: string | null;
  amount_transferred: number | null;
  outstanding_balance: number | null;
  items: OrderItem[];
  itemsCount: number;
  thumbnail: string | null;
  created_at?: string | null;
}

/* ---------- Helpers (เหมือนหน้า OrderStatus) ---------- */
const getStatusBadgeClass = (status: string) => {
  if (status === "จัดส่งแล้ว") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (status.includes("รอ")) return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-purple-100 text-purple-700 border border-purple-200";
};
const labelPayment = (v: string | null) => {
  if (!v) return "N/A";
  const s = v.toLowerCase();
  if (s.includes("true")) return "TrueMoney";
  if (s.includes("k")) return "K PLUS";
  return v;
};
const baht = (n: number | null | undefined) => (n == null ? "N/A" : `฿${Number(n).toLocaleString()}`);
const ensureArray = (x: any): any[] => (Array.isArray(x) ? x : x ? [x] : []);

/* mm/yyyy helpers */
const toMMYYYY = (val: string) => {
  let m = val.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (m) return `${String(+m[2]).padStart(2, "0")}/${m[1]}`;
  m = val.match(/^(\d{1,2})[\/-](\d{4})$/);
  if (m) return `${String(+m[1]).padStart(2, "0")}/${m[2]}`;
  const d = new Date(val);
  if (!isNaN(+d)) return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return null;
};
const mmYYYY = (d?: string | null) => (d ? toMMYYYY(d) : null);

const extractShipInfo = (raw: any): string | null => {
  const cands: any[] = [
    raw?.shipment_month, raw?.shipmentMonth, raw?.presale_month, raw?.preorder_month,
    raw?.releaseMonth, raw?.eta_month, raw?.etaDate, raw?.eta_date, raw?.eta,
    raw?.ship_month, raw?.ship_date, raw?.shipping_month, raw?.shipping_date,
    raw?.releaseDate, raw?.release_date,
  ];
  for (const v of cands) {
    if (v == null) continue;
    if (typeof v === "string") {
      const t = v.trim();
      const mm = toMMYYYY(t);
      if (mm) return mm;
      const lower = t.toLowerCase();
      if (/(พร้อมส่ง|in\s*stock)/.test(lower)) return "พร้อมส่ง";
      const day = t.match(/(\d+\s*-\s*\d+|\d+)\s*วัน/);
      if (day) return `ภายใน ${day[1].replace(/\s*/g, "")} วัน`;
    }
  }
  if (raw?.readyToShip === true) return "พร้อมส่ง";
  return null;
};

const mapItemFromOrder = (raw: any): OrderItem => ({
  productName: raw?.productName ?? raw?.name ?? "(ไม่ระบุชื่อสินค้า)",
  sku: raw?.sku ?? null,
  quantity: Number(raw?.quantity ?? raw?.qty ?? 1),
  unitPrice:
    raw?.unitPrice != null ? Number(raw.unitPrice)
    : raw?.selling_price != null ? Number(raw.selling_price)
    : raw?.price != null ? Number(raw.price)
    : null,
  image_url: raw?.productImage || raw?.variant_image || raw?.thumbnail || raw?.image || raw?.image_url || null,
  releaseDate: raw?.releaseDate ?? raw?.release_date ?? null,
  shipment_month: extractShipInfo(raw),
});

/** เติมรูป/เดือนส่งจากผลิตภัณฑ์ โดย lookup ด้วย sku */
const fetchSkuFallback = async (
  skus: string[]
): Promise<Record<string, { image_url: string | null; shipment_month: string | null }>> => {
  const out: Record<string, { image_url: string | null; shipment_month: string | null }> = {};
  const uniq = Array.from(new Set(skus.filter(Boolean)));
  if (uniq.length === 0) return out;

  try {
    const { data } = await supabase
      .from("public_products")
      .select("sku, image_url, image, shipment_date")
      .in("sku", uniq);
    if (data) {
      for (const r of data as any[]) {
        out[r.sku] = { image_url: r?.image_url || r?.image || null, shipment_month: mmYYYY(r?.shipment_date) };
      }
    }
  } catch {}

  try {
    const need = uniq.filter((s) => !out[s]);
    if (need.length) {
      const { data } = await supabase
        .from("products")
        .select("sku, image_url, image, shipment_date")
        .in("sku", need);
      if (data) {
        for (const r of data as any[]) {
          out[r.sku] = { image_url: r?.image_url || r?.image || null, shipment_month: mmYYYY(r?.shipment_date) };
        }
      }
    }
  } catch {}

  return out;
};

/* ---------- Query helpers (ปิด generic inference ของ supabase-js) ---------- */
const SELECT =
  "id, user_id, order_number, customer_name, customer_phone, items, subtotal, shipping_cost, total_price, status, tracking_number, deposit, discount, payment_method, created_at";

const baseSelect = () =>
  (supabase as any).from("orders").select(SELECT as any);

const safeFetchEq = async (col: string, val: string): Promise<DbOrder[]> => {
  try {
    const { data, error } = await baseSelect()
      .eq(col as any, val)
      .order("created_at", { ascending: false });
    if (error) {
      console.warn(`[OrderHistory] skip '${col}':`, (error as any).message);
      return [] as DbOrder[];
    }
    return (data ?? []) as DbOrder[];
  } catch {
    return [] as DbOrder[];
  }
};

const safeFetchJsonEmail = async (email: string): Promise<DbOrder[]> => {
  try {
    const { data, error } = await baseSelect()
      .filter("customer_info->>email", "eq", email)
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[OrderHistory] skip customer_info->>email:", (error as any).message);
      return [] as DbOrder[];
    }
    return (data ?? []) as DbOrder[];
  } catch {
    return [] as DbOrder[];
  }
};

/* ---------- Page ---------- */
export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (!user) {
        setNeedLogin(true);
        setOrders([]);
        setLoading(false);
        return;
      }

      const email = user.email ?? "";
      const uid = user.id;

      try {
        const buckets: DbOrder[][] = [];

        // 1) ผูกบัญชีโดยตรง
        if (uid) buckets.push(await safeFetchEq("user_id", uid));

        // 2) ผูกด้วยอีเมล (ลองหลายคอลัมน์/โครงสร้าง)
        if (email) {
          buckets.push(await safeFetchEq("customer_email", email)); // ถ้ามีคอลัมน์นี้
          buckets.push(await safeFetchEq("email", email));          // ถ้ามีคอลัมน์นี้
          buckets.push(await safeFetchEq("customer_name", email));  // เคสเก็บอีเมลในช่องนี้
          buckets.push(await safeFetchJsonEmail(email));            // ถ้ามี JSON customer_info
        }

        // รวม & กันซ้ำ
        const merged = new Map<number, DbOrder>();
        for (const arr of buckets) for (const r of arr) merged.set(r.id, r);

        // map → UI
        const base: Order[] = Array.from(merged.values()).map((row) => {
          const items = ensureArray(row.items).map(mapItemFromOrder);
          const total = Number(row.total_price ?? 0);
          const deposit = Number(row.deposit ?? 0);
          const isPaidInFull = deposit === 0 || deposit >= total;
          const amountTransferred = isPaidInFull ? total : deposit;
          const outstanding = Math.max(total - amountTransferred, 0);
          return {
            id: row.id,
            username: row.customer_name ?? "-",
            phone: row.customer_phone ?? null,
            status: row.status ?? "รอชำระเงิน",
            tracking_number: row.tracking_number,
            payment_method: row.payment_method,
            amount_transferred: amountTransferred,
            outstanding_balance: outstanding,
            items,
            itemsCount: items.length,
            thumbnail: items.find((i) => !!i.image_url)?.image_url ?? null,
            created_at: row.created_at,
          };
        });

        // เติมรูป/กำหนดส่งจาก product ถ้ายังไม่มี
        const needSkus = Array.from(
          new Set(
            base.flatMap((o) =>
              o.items
                .filter((it) => (!it.image_url || !it.shipment_month) && it.sku)
                .map((it) => it.sku as string)
            )
          )
        );
        let skuMap: Record<string, { image_url: string | null; shipment_month: string | null }> = {};
        if (needSkus.length) skuMap = await fetchSkuFallback(needSkus);

        const enriched = base.map((o) => {
          const items = o.items.map((it) => {
            const fb = it.sku ? skuMap[it.sku] : undefined;
            return {
              ...it,
              image_url: it.image_url || fb?.image_url || null,
              shipment_month:
                it.shipment_month ||
                (it.releaseDate ? mmYYYY(it.releaseDate) : fb?.shipment_month ?? null),
            };
          });
          const thumbnail = items.find((i) => !!i.image_url)?.image_url ?? o.thumbnail ?? null;
          return { ...o, items, thumbnail };
        });

        // เรียงล่าสุดก่อน
        enriched.sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });

        setOrders(enriched);
      } catch (err) {
        console.error("load orders error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- UI (ยืมการ์ดจาก OrderStatus) ---------- */
  const SuperCompactCard = ({ order }: { order: Order }) => {
    const first = order.items[0];
    const more = order.itemsCount > 1 ? ` +อีก ${order.itemsCount - 1} รายการ` : "";

    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border bg-white overflow-hidden flex-shrink-0">
              {order.thumbnail ? (
                <img
                  src={order.thumbnail}
                  alt={first?.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold truncate">ออเดอร์ #{order.id}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-700 truncate">
                {first?.productName ?? "(ไม่ระบุสินค้า)"}<span className="text-gray-500">{more}</span>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-8 px-3 text-sm" style={{ backgroundColor: "#956ec3" }}>
                  ดูรายละเอียด
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl p-0">
                <DialogTitle className="sr-only">Order Detail</DialogTitle>

                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold">Order Detail</h2>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border overflow-hidden bg-white">
                      {order.thumbnail ? (
                        <img
                          src={order.thumbnail}
                          alt={first?.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.currentTarget.style.display = "none"))}
                        />
                      ) : <div className="w-full h-full bg-gray-100" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {first?.productName ?? "(ไม่ระบุสินค้า)"}{more}
                      </div>
                      <div className="text-sm text-gray-600 truncate">{order.username}</div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-6 px-6 pb-4 text-sm">
                  <div>
                    <p className="text-gray-500">รูปแบบการชำระเงิน</p>
                    <p className="font-semibold">{labelPayment(order.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">จำนวนเงินที่โอน</p>
                    <p className="font-semibold">{baht(order.amount_transferred)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ยอดคงค้าง</p>
                    <p className="font-semibold">{baht(order.outstanding_balance)}</p>
                  </div>

                  {order.tracking_number && (
                    <div className="col-span-2">
                      <p className="text-gray-500">เลขพัสดุ</p>
                      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mt-1">
                        <p className="font-mono text-sm">{order.tracking_number}</p>
                        <a
                          href={`https://track.thailandpost.co.th/?trackNumber=${order.tracking_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-600" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* รายการสินค้า */}
                <div className="px-6 pb-6">
                  <div className="text-sm font-semibold mb-2">สินค้าในออเดอร์ ({order.itemsCount})</div>
                  <div className="max-h-96 overflow-auto divide-y rounded-md border bg-white">
                    {order.items.map((it, idx) => (
                      <div key={`${it.sku ?? "no-sku"}-${idx}`} className="p-3 grid grid-cols-[64px,1fr,auto] gap-3 items-center">
                        <div className="w-16 h-16 rounded-lg border overflow-hidden bg-gray-50">
                          {it.image_url ? (
                            <img
                              src={it.image_url}
                              alt={it.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.currentTarget.style.display = "none"))}
                            />
                          ) : <div className="w-full h-full bg-gray-100" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{it.productName}</div>
                          <div className="text-xs text-gray-500">
                            SKU: {it.sku ?? "N/A"} • จำนวน: {it.quantity}
                            {it.shipment_month ? ` • กำหนดส่ง: ${it.shipment_month}` : ""}
                          </div>
                        </div>
                        <div className="text-right text-sm font-semibold">{baht(it.unitPrice)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-600 font-medium">กำลังโหลดประวัติคำสั่งซื้อ…</p>
        </div>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <LogIn className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <h2 className="text-xl font-semibold mb-2">กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</h2>
          <p className="text-gray-600 mb-6">ระบบจะดึงออเดอร์ที่ผูกกับบัญชีของคุณให้อัตโนมัติ</p>
          <a href="/login">
            <Button style={{ backgroundColor: "#956ec3" }}>เข้าสู่ระบบ</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">ประวัติการสั่งซื้อ</h1>
        <p className="text-gray-600 mb-6">ระบบจะแสดงออเดอร์ทั้งหมดที่เชื่อมกับอีเมลของคุณ</p>

        {orders.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            ยังไม่มีประวัติการสั่งซื้อ ออเดอร์ทั้งหมดของคุณจะแสดงที่นี่
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <SuperCompactCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
