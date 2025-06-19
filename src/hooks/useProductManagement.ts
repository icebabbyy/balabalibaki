
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductAdmin } from '@/types/product';

export const useProductManagement = () => {
  const [products, setProducts] = useState<ProductAdmin[]>([]);
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

      // Map the data to ensure all required fields are present
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        selling_price: item.selling_price || 0,
        cost_thb: item.cost_thb || 0,
        import_cost: item.import_cost || 0,
        exchange_rate: item.exchange_rate || 0,
        price_yuan: item.price_yuan || 0,
        image: item.image || '',
        description: item.description || '',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        product_status: item.product_status || 'พรีออเดอร์',
        product_type: item.product_type || 'ETC',
        link: item.link || '',
        shipment_date: item.shipment_date || '',
        shipping_fee: item.shipping_fee || '',
        options: item.options || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));

      setProducts(mappedData);
      console.log('Fetched products with product_status:', mappedData.map(p => ({ id: p.id, name: p.name, product_status: p.product_status })));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: number, updates: Partial<ProductAdmin>) => {
    try {
      setUpdating(true);
      
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
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
