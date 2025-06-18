
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  order: number;
}

export const useProductImages = (productId?: number) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductImages();
    }
  }, [productId]);

  const fetchProductImages = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching product images:', error);
        return;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!productId) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `products/${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast.error(`เกิดข้อผิดพลาดในการอัพโหลด ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);

        // Add to product_images table
        const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.order || 0)) + 1 : 1;
        
        const { error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            order: nextOrder
          });

        if (insertError) {
          console.error('Error inserting image record:', insertError);
          toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลรูปภาพ');
        }
      }

      if (uploadedUrls.length > 0) {
        toast.success(`อัพโหลดรูปภาพสำเร็จ ${uploadedUrls.length} รูป`);
        await fetchProductImages(); // Refresh the list
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: number) => {
    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;

      // Delete from storage
      const path = imageToDelete.image_url.split('/').slice(-2).join('/'); // Get path from URL
      await supabase.storage
        .from('product-images')
        .remove([path]);

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting image:', error);
        toast.error('เกิดข้อผิดพลาดในการลบรูปภาพ');
        return;
      }

      toast.success('ลบรูปภาพเรียบร้อยแล้ว');
      await fetchProductImages(); // Refresh the list
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('เกิดข้อผิดพลาดในการลบรูปภาพ');
    }
  };

  const updateImageOrder = async (imageId: number, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .update({ order: newOrder })
        .eq('id', imageId);

      if (error) {
        console.error('Error updating image order:', error);
        toast.error('เกิดข้อผิดพลาดในการเรียงลำดับรูปภาพ');
        return;
      }

      await fetchProductImages(); // Refresh the list
    } catch (error) {
      console.error('Error updating image order:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียงลำดับรูปภาพ');
    }
  };

  return {
    images,
    loading,
    uploading,
    uploadImages,
    deleteImage,
    updateImageOrder,
    refreshImages: fetchProductImages
  };
};
