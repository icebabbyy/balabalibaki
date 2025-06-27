
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Package, Edit } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import OrderManagement from "@/components/OrderManagement";
import BannerManager from "@/components/BannerManager";
import CategoryManager from "@/components/CategoryManager";
import HomepageCategoryManager from "@/components/HomepageCategoryManager";
import AdminRouteGuard from "@/components/AdminRouteGuard";

interface PublicProduct {
  id: number;
  product_name: string;
  category: string;
  selling_price: number;
  product_sku: string;
  quantity: number;
  product_status: string;
  product_type?: string;
  description: string;
  main_image_url: string;
  product_images: any;
  shipment_date: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDescription, setEditingDescription] = useState<{productId: number, description: string} | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      // Map the data to ensure all required fields are present
      const mappedProducts: PublicProduct[] = (data || []).map(item => ({
        id: item.id || 0,
        product_name: item.name || '', // Fixed: use 'name' field from public_products
        category: item.category || '',
        selling_price: item.selling_price || 0,
        main_image_url: item.image || '', // Fixed: use 'image' field from public_products
        description: item.description || '',
        product_sku: item.sku || '', // Fixed: use 'sku' field from public_products
        quantity: item.quantity || 0,
        product_status: item.product_status || 'พรีออเดอร์',
        product_type: 'ETC',
        shipment_date: item.shipment_date || '',
        product_images: item.images_list || null
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const updateProductDescription = async (productId: number, description: string) => {
    try {
      console.log('Updating product description for ID:', productId);
      console.log('Description:', description);

      const { error } = await supabase
        .from('public_products')
        .update({ description })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product description:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกคำอธิบาย');
        return false;
      }

      toast.success('บันทึกคำอธิบายสำเร็จ');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกคำอธิบาย');
      return false;
    }
  };

  const handleDescriptionSave = async () => {
    if (!editingDescription) return;
    
    const success = await updateProductDescription(editingDescription.productId, editingDescription.description);
    if (success) {
      setEditingDescription(null);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('ยืนยันการลบสินค้านี้?')) return;
    
    try {
      const { error } = await supabase
        .from('public_products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
        return;
      }

      toast.success('ลบสินค้าสำเร็จ!');
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  if (loading) {
    return (
      <AdminRouteGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">แผงควบคุม</h1>
            <p className="text-gray-500">จัดการสينค้าจากฐานข้อมูล public_products</p>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6">
            <nav className="-mb-px flex space-x-4">
              <Button
                variant="ghost"
                className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'products' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
                onClick={() => setActiveTab('products')}
              >
                สินค้า
              </Button>
              <Button
                variant="ghost"
                className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'orders' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
                onClick={() => setActiveTab('orders')}
              >
                คำสั่งซื้อ
              </Button>
              <Button
                variant="ghost"
                className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'banners' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
                onClick={() => setActiveTab('banners')}
              >
                แบนเนอร์
              </Button>
              <Button
                variant="ghost"
                className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'categories' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
                onClick={() => setActiveTab('categories')}
              >
                หมวดหมู่สินค้า
              </Button>
              <Button
                variant="ghost"
                className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'homepage-categories' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
                onClick={() => setActiveTab('homepage-categories')}
              >
                หมวดหมู่หน้าแรก
              </Button>
            </nav>
          </div>

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Products List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    รายการสินค้า ({products.length} รายการ)
                  </CardTitle>
                  <p className="text-sm text-gray-600">ข้อมูลจากตาราง public_products</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">รูปภาพ</th>
                          <th className="text-left p-2">ชื่อสินค้า</th>
                          <th className="text-left p-2">คำอธิบาย</th>
                          <th className="text-left p-2">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <img 
                                src={product.main_image_url || '/placeholder.svg'} 
                                alt={product.product_name}
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:w-32 hover:h-32 transition-all duration-300"
                                title="คลิกเพื่อดูขนาดใหญ่"
                              />
                            </td>
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{product.product_name}</p>
                              </div>
                            </td>
                            <td className="p-2 max-w-xs">
                              {editingDescription?.productId === product.id ? (
                                <div className="w-full max-w-sm">
                                  <RichTextEditor
                                    value={editingDescription.description}
                                    onChange={(value) => setEditingDescription({
                                      ...editingDescription,
                                      description: value
                                    })}
                                    onSave={handleDescriptionSave}
                                    onCancel={() => setEditingDescription(null)}
                                    isEditing={true}
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2 max-w-sm">
                                  <div className="max-h-20 overflow-y-auto">
                                    <RichTextEditor
                                      value={product.description || ''}
                                      onChange={() => {}}
                                      onSave={() => {}}
                                      onCancel={() => {}}
                                      isEditing={false}
                                    />
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingDescription({
                                      productId: product.id,
                                      description: product.description || ''
                                    })}
                                    className="w-full"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    แก้ไขคำอธิบาย
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteProduct(product.id)}
                                  title="ลบสินค้า"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <OrderManagement />
          )}

          {activeTab === 'banners' && (
            <BannerManager />
          )}

          {activeTab === 'categories' && (
            <CategoryManager />
          )}

          {activeTab === 'homepage-categories' && (
            <HomepageCategoryManager />
          )}
        </div>
      </div>
    </AdminRouteGuard>
  );
};

export default Admin;
