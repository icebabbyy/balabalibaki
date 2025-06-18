import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, ShoppingCart, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import BannerManager from "@/components/BannerManager";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    selling_price: '',
    category: '',
    description: '',
    image: '',
    status: 'พรีออเดอร์',
    sku: ''
  });

  // Check if user is admin
  const isAdmin = user?.email === 'admin@luckyshop.com' || user?.user_metadata?.role === 'admin';

  useEffect(() => {
    if (!authLoading && user) {
      fetchAdminData();
    }
  }, [user, authLoading]);

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
    return <Navigate to="/auth" replace />;
  }

  const fetchAdminData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

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

  const handleAddProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          ...newProduct,
          selling_price: parseFloat(newProduct.selling_price) || 0,
          price_yuan: 10,
          cost_thb: 10,
          import_cost: 10,
          exchange_rate: 10,
          quantity: 0,
          sku: newProduct.sku || `SKU-${Date.now()}`
        }]);

      if (error) throw error;

      toast.success('เพิ่มสินค้าเรียบร้อยแล้ว');
      setNewProduct({
        name: '',
        selling_price: '',
        category: '',
        description: '',
        image: '',
        status: 'พรีออเดอร์',
        sku: ''
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  };

  const handleUpdateOrder = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('อัพเดทสถานะออเดอร์เรียบร้อยแล้ว');
      fetchAdminData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพเดทออเดอร์');
    }
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
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">ระบบแอดมิน - Lucky Shop</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">แอดมิน</Badge>
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

        {/* Admin Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">จัดการสินค้า</TabsTrigger>
            <TabsTrigger value="orders">จัดการออเดอร์</TabsTrigger>
            <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
            <TabsTrigger value="banners">แบนเนอร์</TabsTrigger>
          </TabsList>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-6">
            {/* Add New Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>เพิ่มสินค้าใหม่</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="ชื่อสินค้า"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                  <Input
                    placeholder="ราคา"
                    type="number"
                    value={newProduct.selling_price}
                    onChange={(e) => setNewProduct({...newProduct, selling_price: e.target.value})}
                  />
                  <Input
                    placeholder="หมวดหมู่"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  />
                  <Input
                    placeholder="SKU (รหัสสินค้า)"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                  <Input
                    placeholder="URL รูปภาพ"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="md:col-span-2"
                  />
                </div>
                <Textarea
                  placeholder="คำอธิบายสินค้า"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
                <Button onClick={handleAddProduct} className="bg-purple-600 hover:bg-purple-700">
                  เพิ่มสินค้า
                </Button>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle>รายการสินค้า</CardTitle>
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
                        <Badge variant="outline">{product.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                <CardTitle>จัดการออเดอร์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">ออเดอร์ #{order.id}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            order.status === 'รอชำระเงิน' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'กำลังจัดส่ง' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {order.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateOrder(order.id, 'กำลังจัดส่ง')}
                          >
                            อัพเดทสถานะ
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        ยอดรวม: ฿{order.total_selling_price?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ลูกค้า: {order.username || 'ไม่ระบุ'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Management */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>จัดการหมวดหมู่สินค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-500">
                          สร้างเมื่อ: {new Date(category.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banners Management */}
          <TabsContent value="banners" className="space-y-6">
            <BannerManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
