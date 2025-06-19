
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, Hash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const OrderHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchOrderHistory();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchOrderHistory = async () => {
    if (!user) return;
    
    try {
      // ใช้ orders table สำหรับ user ที่ login แล้ว
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, username, items, total_selling_price, status, order_date, address, tracking_number, admin_notes')
        .eq('username', profile?.username || user.email?.split('@')[0])
        .order('id', { ascending: false });

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'รอชำระเงิน':
      case 'รอตรวจสอบการชำระเงิน':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ชำระเงินแล้ว':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'กำลังจัดส่ง':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'จัดส่งแล้ว':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ยกเลิก':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatItemName = (item: any) => {
    let name = item.name || 'ไม่ระบุชื่อสินค้า';
    if (item.variant) {
      name += ` (${item.variant})`;
    }
    return name;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6" />
                <span>ประวัติการสั่งซื้อ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่มีประวัติการสั่งซื้อ</h3>
                  <p className="text-gray-500">คุณยังไม่มีการสั่งซื้อสินค้า เริ่มช้อปปิ้งกันเถอะ!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">#{order.id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(order.status)} border`}>
                            {order.status || 'รอชำระเงิน'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleOrderDetails(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {expandedOrders.has(order.id) ? 'ซ่อน' : 'ดู'}รายละเอียด
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            จำนวนสินค้า: {order.items?.length || 0} รายการ
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {order.order_date 
                                ? new Date(order.order_date).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'ไม่ระบุวันที่'
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-600 text-lg">
                            ฿{order.total_selling_price?.toLocaleString() || '0'}
                          </p>
                          {order.tracking_number && (
                            <p className="text-sm text-gray-600 mt-1">
                              หมายเลขติดตาม: <span className="font-mono">{order.tracking_number}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedOrders.has(order.id) && (
                        <div className="border-t pt-4 mt-4 space-y-4">
                          {/* Items List */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">รายการสินค้า:</h4>
                            <div className="space-y-2">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                    <div>
                                      <p className="font-medium">{formatItemName(item)}</p>
                                      <p className="text-sm text-gray-600">
                                        SKU: {item.sku || 'ไม่ระบุ'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {item.quantity || 1} x ฿{(item.price || 0).toLocaleString()}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        ฿{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500">ไม่มีข้อมูลสินค้า</p>
                              )}
                            </div>
                          </div>

                          {/* Address */}
                          {order.address && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">ที่อยู่จัดส่ง:</h4>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                                {order.address}
                              </p>
                            </div>
                          )}

                          {/* Admin Notes */}
                          {order.admin_notes && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">หมายเหตุจากร้าน:</h4>
                              <p className="text-blue-700 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                {order.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
