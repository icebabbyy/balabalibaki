import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, ShoppingCart, Users, BarChart3, ArrowLeft, Image } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import BannerManager from "@/components/BannerManager";
import CategoryManager from "@/components/CategoryManager";
import ProductEditDialog from "@/components/ProductEditDialog";
import OrderManagement from "@/components/OrderManagement";
import { useProductManagement } from "@/hooks/useProductManagement";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductImageManager from "@/components/ProductImageManager";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [managingImages, setManagingImages] = useState(null);
  
  const { products, loading: productsLoading } = useProductManagement();
  const { orders, loading: ordersLoading } = useOrderManagement();

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
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      // Fetch banners
      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .order('position');

      setCategories(categoriesData || []);
      setBanners(bannersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleSaveProduct = async (updatedProduct) => {
    // The ProductEditDialog will handle the saving
    setEditingProduct(null);
  };

  const handleManageImages = (product) => {
    setManagingImages(product);
  };

  if (loading || productsLoading || ordersLoading) {
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageImages(product)}
                        >
                          <Image className="h-4 w-4 mr-1" />
                          รูปภาพ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          แก้ไข
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
            <OrderManagement />
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

      {/* Product Image Management Dialog */}
      {managingImages && (
        <Dialog open={!!managingImages} onOpenChange={() => setManagingImages(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>จัดการรูปภาพ - {managingImages.name}</DialogTitle>
            </DialogHeader>
            <ProductImageManager productId={managingImages.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Admin;
