
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings,
  Bell,
  Mail
} from "lucide-react";
import OrderManagement from "@/components/OrderManagement";
import ProductNotificationManager from "@/components/ProductNotificationManager";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchStats();
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch order stats
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status');

      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(order => 
        order.status === 'รอชำระเงิน' || order.status === 'รอตรวจสอบการชำระเงิน'
      ).length || 0;

      // Fetch product count
      const { data: products } = await supabase
        .from('public_products')
        .select('id');

      const totalProducts = products?.length || 0;

      // Fetch user count
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      const totalUsers = users?.length || 0;

      setStats({
        totalOrders,
        pendingOrders,
        totalProducts,
        totalUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (authLoading || loading) {
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

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">แดชบอร์ดแอดมิน</h1>
          <p className="text-gray-600">จัดการระบบและติดตามสถิติการขาย</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ออเดอร์ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <Badge className="bg-orange-100 text-orange-600">
                  <Bell className="h-4 w-4" />
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ลูกค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              จัดการออเดอร์
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              แจ้งเตือนสินค้า
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              รายงาน
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              ตั้งค่า
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <ProductNotificationManager />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>รายงานและสถิติ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">ฟีเจอร์รายงานจะเพิ่มในอนาคต</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>การตั้งค่าระบบ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">ฟีเจอร์การตั้งค่าจะเพิ่มในอนาคต</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
