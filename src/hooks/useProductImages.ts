
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
      console.log('Fetching images for product ID:', productId);
      fetchProductImages();
    }
  }, [productId]);

  const fetchProductImages = async () => {
    if (!productId) {
      console.log('No product ID provided');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching product images from database...');
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching product images:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดรูปภาพ');
        return;
      }

      console.log('Fetched images:', data);
      setImages(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      setLoading(false);
    }
  };

  const addImage = async (imageUrl: string): Promise<boolean> => {
    if (!productId) {
      toast.error('ไม่พบ Product ID');
      return false;
    }

    try {
      const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.order || 0)) + 1 : 1;
      
      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: imageUrl,
          order: nextOrder
        });

      if (error) {
        console.error('Error inserting image record:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลรูปภาพ');
        return false;
      }

      await fetchProductImages(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มรูปภาพ');
      return false;
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!productId) {
      toast.error('ไม่พบ Product ID');
      return [];
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      console.log('Starting upload process for', files.length, 'files');
      
      for (const file of files) {
        console.log('Uploading file:', file.name);
        
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `products/${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        console.log('Upload path:', fileName);
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast.error(`เกิดข้อผิดพลาดในการอัพโหลด ${file.name}: ${error.message}`);
          continue;
        }

        console.log('Upload successful:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        console.log('Public URL:', publicUrl);
        uploadedUrls.push(publicUrl);

        // Add to product_images table
        const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.order || 0)) + 1 : 1;
        
        console.log('Inserting image record with order:', nextOrder);
        
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
        } else {
          console.log('Image record inserted successfully');
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

  const deleteImage = async (imageId: number): Promise<boolean> => {
    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return false;

      console.log('Deleting image:', imageToDelete);

      // Delete from storage
      const path = imageToDelete.image_url.split('/').slice(-2).join('/'); // Get path from URL
      console.log('Deleting from storage path:', path);
      
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting image:', error);
        toast.error('เกิดข้อผิดพลาดในการลบรูปภาพ');
        return false;
      }

      await fetchProductImages(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('เกิดข้อผิดพลาดในการลบรูปภาพ');
      return false;
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
    addImage,
    uploadImages,
    deleteImage,
    updateImageOrder,
    refreshImages: fetchProductImages
  };
};
