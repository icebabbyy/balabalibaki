import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, FileText, Eye, EyeOff, AlertCircle } from "lucide-react";

// ----- types -----
interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  price: number; // unitPrice
}

interface ProcessedOrder {
  id: number;
  username: string;
  items: OrderItem[];
  total_price: number;
  shipping_cost: number;
  shipping_address: string;
  status: string;
  created_at: string;
}

interface Product {
  sku: string;
  name: string;
  image: string;
}

type DbOrder = {
  id: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: any;
  total_price: number | null;
  shipping_cost: number | null;
  status: string | null;
  created_at: string | null;
  user_id: string | null;
};

// ===== Card =====
const OrderHistoryCard = ({
  order,
  productsMap,
}: {
  order: ProcessedOrder;
  productsMap: Record<string, Product>;
}) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  return (
    <Card className="p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h3 className="font-bold text-lg mb-2 sm:mb-0">ออเดอร์ # {order.id}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="cursor-default">
            {order.status || "N/A"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
            {isDetailsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isDetailsVisible && (
        <div className="mt-4">
          <div className="border-t pt-4 flex justify-between text-sm">
            <div>
              <p>จำนวนสินค้า: {order.items.length} รายการ</p>
              <p className="text-gray-500 mt-1">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("th-TH", { dateStyle: "long" })
                  : "ไม่ระบุวันที่"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-purple-700">฿{order.total_price?.toLocaleString() || 0}</p>
              <p className="text-gray-500">ค่าจัดส่ง: ฿{order.shipping_cost?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">รายการสินค้า:</h4>
            <div className="space-y-3">
              {order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={`${item.sku}-${item.name}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={productsMap[item.sku]?.image || "https://via.placeholder.com/64"}
                        alt={productsMap[item.sku]?.name || item.name}
                        className="w-16 h-16 object-cover rounded-md bg-gray-100"
                      />
                      <div>
                        <p className="font-semibold">{productsMap[item.sku]?.name || item.name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {item.quantity} x ฿{item.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">ไม่พบรายการสินค้าในออเดอร์นี้</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">ที่อยู่จัดส่ง:</h4>
            <div className="bg-gray-50 p-4 rounded-md text-gray-700 text-sm">{order.shipping_address || "ไม่ระบุ"}</div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ===== Page =====
const OrderHistory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw new Error(`Session Error: ${sessionError.message}`);

        const currentUser = session?.user || null;
        setUser(currentUser);

        if (!currentUser) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // ดึงเฉพาะออเดอร์ที่ user เป็นเจ้าของ (ตาม user_id)
        const { data: rawOrders, error: orderError } = await supabase
          .from("orders")
          .select(
            "id, customer_name, customer_phone, customer_address, items, total_price, shipping_cost, status, created_at, user_id"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (orderError) throw new Error(`Order Fetch Error: ${orderError.message}`);

        const processedOrders: ProcessedOrder[] = [];
        const allSkus = new Set<string>();

        (rawOrders as DbOrder[] | null)?.forEach((row) => {
          const arr: any[] = Array.isArray(row.items) ? row.items : row.items ? [row.items] : [];
          const items: OrderItem[] = arr.map((it) => ({
            sku: it?.sku ?? "",
            name: it?.productName ?? "",
            quantity: Number(it?.quantity ?? 0) || 0,
            price: Number(it?.unitPrice ?? 0) || 0,
          }));

          items.forEach((i) => i.sku && allSkus.add(i.sku));

          processedOrders.push({
            id: row.id,
            username: row.customer_name ?? "",
            items,
            total_price: row.total_price ?? 0,
            shipping_cost: row.shipping_cost ?? 0,
            shipping_address: row.customer_address ?? "",
            status: row.status ?? "",
            created_at: row.created_at ?? "",
          });
        });

        setOrders(processedOrders);

        if (allSkus.size > 0) {
          const { data: productData, error: productError } = await supabase
            .from("products")
            .select("sku, name, image")
            .in("sku", Array.from(allSkus));
          if (productError) throw new Error(`Product Fetch Error: ${productError.message}`);

          const map = (productData || []).reduce((acc: Record<string, Product>, p: any) => {
            acc[p.sku] = p;
            return acc;
          }, {});
          setProductsMap(map);
        }
      } catch (e: any) {
        console.error("A critical error occurred:", e);
        setError(e?.message ?? "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const RenderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-10">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-600" />
        </div>
      );
    }
    if (error) {
      return (
        <Card className="p-8 text-center bg-red-50 text-red-700">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold">เกิดข้อผิดพลาด</h3>
          <p className="text-sm mt-2 font-mono">{error}</p>
        </Card>
      );
    }
    if (!user) {
      return (
        <Card className="p-8 text-center">
          <p>กรุณาล็อกอินเพื่อดูประวัติการสั่งซื้อ</p>
          <Button asChild className="mt-4" style={{ backgroundColor: "#956ec3" }}>
            <Link to="/auth">ไปที่หน้าล็อกอิน</Link>
          </Button>
        </Card>
      );
    }
    if (orders.length === 0) {
      return (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold">ยังไม่มีประวัติการสั่งซื้อ</h3>
          <p className="text-gray-500">ออเดอร์ทั้งหมดของคุณจะแสดงที่นี่</p>
        </Card>
      );
    }
    return (
      <div className="space-y-6">
        {orders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} productsMap={productsMap} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ประวัติการสั่งซื้อ</h1>
          {user && <p className="text-gray-600">{user.email}</p>}
        </div>
        <RenderContent />
      </main>
    </div>
  );
};

export default OrderHistory;
