
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, bucket: string = 'product-images') => {
    try {
      setUploading(true);
      console.log('Starting image upload:', { fileName: file.name, fileSize: file.size, bucket });
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
        return null;
      }
      
      // Create unique filename with proper path structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // For product images, use the bucket folder structure
      const filePath = bucket.includes('products/') ? `${bucket}/${fileName}` : fileName;
      
      console.log('Generated filename:', fileName);
      console.log('Upload path:', filePath);
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast.error(`เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}`);
        return null;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      console.log('Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
