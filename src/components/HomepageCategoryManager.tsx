
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: number;
  name: string;
  image?: string;
  display_on_homepage?: boolean;
  homepage_order?: number;
}

const HomepageCategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, image, display_on_homepage, homepage_order')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
    } finally {
      setLoading(false);
    }
  };

  const toggleHomepageDisplay = async (categoryId: number, currentStatus: boolean) => {
    try {
      setUpdating(true);
      
      // Create update object
      const updateData: any = {
        display_on_homepage: !currentStatus
      };

      if (!currentStatus) {
        updateData.homepage_order = Date.now();
      } else {
        updateData.homepage_order = null;
      }

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId);

      if (error) {
        console.error('Error updating category:', error);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่');
        return;
      }

      toast.success(!currentStatus ? 'เพิ่มหมวดหมู่ในหน้าแรกแล้ว' : 'ลบหมวดหมู่ออกจากหน้าแรกแล้ว');
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่');
    } finally {
      setUpdating(false);
    }
  };

  const updateOrder = async (categoryId: number, direction: 'up' | 'down') => {
    try {
      setUpdating(true);
      const displayedCategories = categories.filter(cat => cat.display_on_homepage);
      const currentIndex = displayedCategories.findIndex(cat => cat.id === categoryId);
      
      if (currentIndex === -1) return;
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= displayedCategories.length) return;

      // สลับ order
      const currentCategory = displayedCategories[currentIndex];
      const targetCategory = displayedCategories[targetIndex];

      const updates = [
        supabase
          .from('categories')
          .update({ homepage_order: targetCategory.homepage_order } as any)
          .eq('id', currentCategory.id),
        supabase
          .from('categories')
          .update({ homepage_order: currentCategory.homepage_order } as any)
          .eq('id', targetCategory.id)
      ];

      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);

      if (hasError) {
        toast.error('เกิดข้อผิดพลาดในการเรียงลำดับ');
        return;
      }

      toast.success('เรียงลำดับหมวดหมู่แล้ว');
      fetchCategories();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียงลำดับ');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-600 font-medium">กำลังโหลดหมวดหมู่...</p>
      </div>
    );
  }

  const displayedCategories = categories
    .filter(cat => cat.display_on_homepage)
    .sort((a, b) => (a.homepage_order || 0) - (b.homepage_order || 0));

  const hiddenCategories = categories.filter(cat => !cat.display_on_homepage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>จัดการหมวดหมู่หน้าแรก</CardTitle>
          <p className="text-sm text-gray-600">
            เลือกหมวดหมู่ที่ต้องการแสดงในหน้าแรกและจัดเรียงลำดับ
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* หมวดหมู่ที่แสดงในหน้าแรก */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center">
              หมวดหมู่ที่แสดงในหน้าแรก
              <Badge variant="secondary" className="ml-2">
                {displayedCategories.length} หมวดหมู่
              </Badge>
            </h3>
            
            {displayedCategories.length > 0 ? (
              <div className="space-y-3">
                {displayedCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center space-x-3">
                      {category.image && (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-500">ลำดับที่ {index + 1}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrder(category.id, 'up')}
                        disabled={index === 0 || updating}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrder(category.id, 'down')}
                        disabled={index === displayedCategories.length - 1 || updating}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      
                      <Switch
                        checked={true}
                        onCheckedChange={() => toggleHomepageDisplay(category.id, true)}
                        disabled={updating}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                ไม่มีหมวดหมู่ที่แสดงในหน้าแรก
              </div>
            )}
          </div>

          {/* หมวดหมู่ที่ซ่อนอยู่ */}
          {hiddenCategories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                หมวดหมู่ที่ซ่อนอยู่
                <Badge variant="outline" className="ml-2">
                  {hiddenCategories.length} หมวดหมู่
                </Badge>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hiddenCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {category.image && (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <h4 className="font-medium">{category.name}</h4>
                    </div>
                    
                    <Switch
                      checked={false}
                      onCheckedChange={() => toggleHomepageDisplay(category.id, false)}
                      disabled={updating}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageCategoryManager;
