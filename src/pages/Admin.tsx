
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, ShoppingCart, Users, BarChart3, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import BannerManager from "@/components/BannerManager";
import CategoryManager from "@/components/CategoryManager";
import ProductEditDialog from "@/components/ProductEditDialog";
import ImageUpload from "@/components/ImageUpload";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    selling_price: '',
    category: '',
    description: '',
    image: '',
    status: 'พรีออเดอร์',
    sku: ''
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserProfile();
      fetchAdminData();
    }
  }, [user, authLoading]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfile(data);
        console.log('Admin - User profile loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Check if user is admin - consistent with Auth.tsx
  const isAdmin = user?.email === 'wishyouluckyshop@gmail.com' || profile?.role === 'admin';

  // Redirect if not admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    console.log('Admin access denied - User:', user?.email, 'Profile role:', profile?.role);
    return <Navigate to="/auth" replace />;
  }

  const fetchAdminData = async () => {
    try {
      // Fetch products from public_products only
      const { data: productsData } = await supabase
        .from('public_products')
        .select('*')
        .order('id', { ascending: false });

      // Fetch orders from publine_orders only
      const { data: ordersData } = await supabase
        .from('publine_orders')
        .select('*')
        .order('id', { ascending: false });

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      // Fetch banners
      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .order('position');

      setProducts(productsData || []);
      setOrders(ordersData || []);
      setCategories(categoriesData || []);
      setBanners(bannersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Note: Admin functions for adding/editing products would need to be updated to work with public views
  // Since public_products is a view, direct insertion may not be possible without proper setup
  const handleAddProduct = async () => {
    toast.error('การเพิ่มสินค้าต้องทำผ่านระบบหลังบ้าน');
  };

  const handleEditProduct = (product) => {
    toast.error('การแก้ไขสินค้าต้องทำผ่านระบบหลังบ้าน');
  };

  const handleSaveProduct = async (updatedProduct) => {
    toast.error('การบันทึกสินค้าต้องทำผ่านระบบหลังบ้าน');
  };

  const handleUpdateOrder = async (orderId, newStatus) => {
    toast.error('การอัพเดทออเดอร์ต้องทำผ่านระบบหลังบ้าน');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:bg-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับหน้าแรก
              </Button>
              <h1 className="text-2xl font-bold">ระบบแอดมิน - Lucky Shop</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">แอดมิน: {profile?.username || user?.email}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-white hover:bg-purple-700"
              >
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">จำนวนสินค้า</p>
                  <p className="text-2xl font-bold text-purple-600">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ออเดอร์ทั้งหมด</p>
                  <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">หมวดหมู่</p>
                  <p className="text-2xl font-bold text-green-600">{categories.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">แบนเนอร์</p>
                  <p className="text-2xl font-bold text-orange-600">{banners.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs with sticky navigation */}
        <Tabs defaultValue="products" className="space-y-6">
          <div className="sticky top-20 z-40 bg-gray-50 pb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">จัดการสินค้า</TabsTrigger>
              <TabsTrigger value="orders">จัดการออเดอร์</TabsTrigger>
              <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
              <TabsTrigger value="banners">แบนเนอร์</TabsTrigger>
            </TabsList>
          </div>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-6">
            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle>รายการสินค้า (จาก public_products)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category}</p>
                          <p className="font-semibold text-purple-600">฿{product.selling_price?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{product.status || product["status TEXT DEFAULT"]}</Badge>
                        <span className="text-xs text-gray-500">อ่านอย่างเดียว</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>จัดการออเดอร์ (จาก publine_orders)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">ออเดอร์ #{order.id}</h4>
                          <p className="text-sm text-gray-500">สินค้า: {order.item}</p>
                          <p className="text-sm text-gray-500">SKU: {order.sku}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            order.status === 'รอชำระเงิน' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'กำลังจัดส่ง' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {order.status || 'รอชำระเงิน'}
                          </Badge>
                          <span className="text-xs text-gray-500">อ่านอย่างเดียว</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        ราคา: {order.price}
                      </p>
                      <p className="text-sm text-gray-600">
                        ลูกค้า: {order.username || 'ไม่ระบุ'}
                      </p>
                      <p className="text-sm text-gray-600">
                        จำนวน: {order.qty}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Management */}
          <TabsContent value="categories" className="space-y-6">
            <CategoryManager />
          </TabsContent>

          {/* Banners Management */}
          <TabsContent value="banners" className="space-y-6">
            <BannerManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Edit Dialog */}
      <ProductEditDialog
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Admin;
