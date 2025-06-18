
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  status: string;
  sku: string;
  price_yuan: number;
  exchange_rate: number;
  import_cost: number;
  cost_thb: number;
  quantity: number;
  shipment_date: string;
  options: any;
  link: string;
  created_at: string;
  updated_at: string;
}

export const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: number, updates: Partial<Product>) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product:', error);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
        return false;
      }

      toast.success('อัปเดตสินค้าเรียบร้อยแล้ว');
      await fetchProducts(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
        return false;
      }

      toast.success('ลบสินค้าเรียบร้อยแล้ว');
      await fetchProducts(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    updating,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
