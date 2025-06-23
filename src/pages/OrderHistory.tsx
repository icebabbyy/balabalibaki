// ✅ 1. Wishlist.tsx - "use is not defined"
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Package, Eye } from "lucide-react";
import { toast } from "sonner";
import OrderTrackingDialog from "@/components/OrderTrackingDialog";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  variant?: string;
}

interface Order {
  id: number;
  order_date: string;
  status: string;
  total_selling_price: number;
  items: OrderItem[];
  tracking_number?: string;
  admin_notes?: string;
  payment_slip_url?: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem("username");
      if (!username) {
        toast.error("กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("username", username)
        .order("order_date", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดประวัติการสั่งซื้อ");
        return;
      }

      const processedOrders: Order[] = (data || []).map((order) => ({
        id: order.id,
        order_date: order.order_date || order.created_at,
        status: order.status || "รอชำระเงิน",
        total_selling_price: order.total_selling_price || 0,
        items: Array.isArray(order.items) ? (order.items as OrderItem[]) : [],
        tracking_number: order.tracking_number,
        admin_notes: order.admin_notes,
        payment_slip_url: order.payment_slip_url,
      }));

      setOrders(processedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดประวัติการสั่งซื้อ");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รอชำระเงิน":
        return "bg-yellow-100 text-yellow-800";
      case "รอยืนยันการชำระเงิน":
        return "bg-blue-100 text-blue-800";
      case "กำลังจัดเตรียมสินค้า":
        return "bg-orange-100 text-orange-800";
      case "จัดส่งแล้ว":
      case "สำเร็จ":
        return "bg-green-100 text-green-800";
      case "ยกเลิก":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewTracking = (order: Order) => {
    setSelectedOrder(order);
    setShowTrackingDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดประวัติการสั่งซื้อ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">ประวัติการสั่งซื้อ</h1>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">ออเดอร์ #{order.id}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.order_date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <p className="text-lg font-bold text-purple-600 mt-1">
                        ฿{order.total_selling_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.variant && (
                            <p className="text-sm text-gray-500">
                              ตัวเลือก: {item.variant}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            จำนวน: {item.quantity} | ราคา: ฿{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div>
                      {order.tracking_number && (
                        <p className="text-sm text-gray-600">
                          เลขติดตาม: <span className="font-mono">{order.tracking_number}</span>
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTracking(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderTrackingDialog
          isOpen={showTrackingDialog}
          onClose={() => {
            setShowTrackingDialog(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default OrderHistory;
