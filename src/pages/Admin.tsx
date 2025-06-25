// src/pages/Admin.tsx

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

// Interface สำหรับข้อมูลที่ดึงมาแสดงผล (ลดลงเหลือเท่าที่ใช้)
interface ProductForAdmin {
  id: number;
  name: string;
  description: string;
  image: string;
  quantity: number;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<ProductForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDescription, setEditingDescription] = useState<{productId: number, description: string} | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลจาก public_products view เหมือนเดิม แต่เลือกเฉพาะ field ที่จะแสดง
      const { data, error } = await supabase
        .from('public_products')
        .select('id, name, description, image, quantity')
        .order('id', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  // --- แก้ไข: เปลี่ยนให้ฟังก์ชันไปอัปเดตที่ตาราง 'products' จริงๆ ---
  const updateProductDescription = async (productId: number, description: string) => {
    try {
      const { error } = await supabase
        .from('products') // <--- แก้ไขเป็นตารางจริง
        .update({ description, updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
      toast.success('บันทึกคำอธิบายสำเร็จ');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error updating description:', error);
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

  // --- แก้ไข: เปลี่ยนให้ฟังก์ชันไปลบที่ตาราง 'products' จริงๆ ---
  const deleteProduct = async (id: number) => {
    if (!confirm('ยืนยันการลบสินค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      const { error } = await supabase
        .from('products') // <--- แก้ไขเป็นตารางจริง
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('ลบสินค้าสำเร็จ!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };
  
  if (loading) { /* ... Loading UI ... */ }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8"><h1 className="text-3xl font-bold text-gray-800">แผงควบคุม</h1><p className="text-gray-500">จัดการข้อมูลเว็บไซต์</p></div>
          <div className="border-b mb-6"><nav className="-mb-px flex space-x-4"> ... </nav></div>

          {activeTab === 'products' && (
            <Card>
              <CardHeader><CardTitle>รายการสินค้า ({products.length} รายการ)</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {/* --- แก้ไข: ลดจำนวนคอลัมน์ในหัวตาราง --- */}
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold w-[10%]">รูปภาพ</th>
                        <th className="text-left p-2 font-semibold w-[30%]">ชื่อสินค้า</th>
                        <th className="text-left p-2 font-semibold w-[40%]">คำอธิบาย</th>
                        <th className="text-left p-2 font-semibold w-[20%]">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          {/* --- แก้ไข: ลดจำนวน cell ให้ตรงกับหัวตาราง --- */}
                          <td className="p-2 align-top">
                            <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                          </td>
                          <td className="p-2 align-top">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">จำนวน: {product.quantity}</p>
                            </div>
                          </td>
                          <td className="p-2 align-top max-w-xs">
                            {editingDescription?.productId === product.id ? (
                              <div className="w-full max-w-sm">
                                <RichTextEditor value={editingDescription.description} onChange={(value) => setEditingDescription({ ...editingDescription, description: value })} onSave={handleDescriptionSave} onCancel={() => setEditingDescription(null)} isEditing={true} />
                              </div>
                            ) : (
                              <div className="space-y-2 max-w-sm">
                                <div className="max-h-20 overflow-y-auto text-sm text-gray-700 prose" dangerouslySetInnerHTML={{ __html: product.description || '<p><em>ไม่มีคำอธิบาย</em></p>' }} />
                                <Button variant="outline" size="sm" onClick={() => setEditingDescription({ productId: product.id, description: product.description || '' })} className="w-full text-xs">
                                  <Edit className="h-3 w-3 mr-1" /> แก้ไข
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="p-2 align-top">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon" onClick={() => deleteProduct(product.id)} title="ลบสินค้า" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
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
          )}

          {activeTab === 'orders' && (<OrderManagement />)}
          {activeTab === 'banners' && (<BannerManager />)}
          {activeTab === 'categories' && (<CategoryManager />)}
          {activeTab === 'homepage-categories' && (<HomepageCategoryManager />)}
        </div>
      </div>
    </AdminRouteGuard>
  );
};

export default Admin;
