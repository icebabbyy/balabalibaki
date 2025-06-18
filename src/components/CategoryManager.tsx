
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  image?: string;
  created_at: string;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error('กรุณาใส่ชื่อหมวดหมู่');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);

      if (error) throw error;

      toast.success('เพิ่มหมวดหมู่เรียบร้อยแล้ว');
      setNewCategory({ name: '', image: '' });
      setIsAddDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          image: editingCategory.image
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      toast.success('อัพเดทหมวดหมู่เรียบร้อยแล้ว');
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพเดทหมวดหมู่');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('คุณต้องการลบหมวดหมู่นี้หรือไม่?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('ลบหมวดหมู่เรียบร้อยแล้ว');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('เกิดข้อผิดพลาดในการลบหมวดหมู่');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>จัดการหมวดหมู่สินค้า</span>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มหมวดหมู่
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ชื่อหมวดหมู่</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="ชื่อหมวดหมู่"
                    />
                  </div>
                  <div>
                    <Label>URL รูปภาพ</Label>
                    <Input
                      value={newCategory.image}
                      onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                    {newCategory.image && (
                      <div className="mt-2">
                        <img 
                          src={newCategory.image} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddCategory} className="bg-purple-600 hover:bg-purple-700">
                      เพิ่ม
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-500">
                      สร้างเมื่อ: {new Date(category.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
                      </DialogHeader>
                      {editingCategory && (
                        <div className="space-y-4">
                          <div>
                            <Label>ชื่อหมวดหมู่</Label>
                            <Input
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>URL รูปภาพ</Label>
                            <Input
                              value={editingCategory.image || ''}
                              onChange={(e) => setEditingCategory({...editingCategory, image: e.target.value})}
                              placeholder="https://example.com/image.jpg"
                            />
                            {editingCategory.image && (
                              <div className="mt-2">
                                <img 
                                  src={editingCategory.image} 
                                  alt="Preview" 
                                  className="w-32 h-32 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={handleEditCategory} className="bg-purple-600 hover:bg-purple-700">
                              บันทึก
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              ยกเลิก
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
