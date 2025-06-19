
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useProductImages } from '@/hooks/useProductImages';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';

interface BatchImageUploadManagerProps {
  productId: number;
}

interface PendingImage {
  id: string;
  file?: File;
  url?: string;
  preview: string;
}

const BatchImageUploadManager = ({ productId }: BatchImageUploadManagerProps) => {
  const { images, loading, deleteImage, refreshImages } = useProductImages(productId);
  const { uploadImage, uploading } = useImageUpload();
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 20;

  const addPendingImage = (file?: File, url?: string) => {
    if (pendingImages.length >= MAX_IMAGES) {
      toast.error(`สามารถเพิ่มได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    const id = Date.now().toString();
    const preview = file ? URL.createObjectURL(file) : url || '';
    
    setPendingImages(prev => [...prev, {
      id,
      file,
      url,
      preview
    }]);

    if (file) {
      toast.success('เพิ่มรูปภาพเรียบร้อย');
    }
  };

  const removePendingImage = (id: string) => {
    setPendingImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.file) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = MAX_IMAGES - pendingImages.length;
    
    if (files.length > remainingSlots) {
      toast.error(`สามารถเพิ่มได้อีกเพียง ${remainingSlots} รูป`);
      return;
    }

    files.forEach(file => addPendingImage(file));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    const remainingSlots = MAX_IMAGES - pendingImages.length;
    if (files.length > remainingSlots) {
      toast.error(`สามารถเพิ่มได้อีกเพียง ${remainingSlots} รูป`);
      return;
    }

    files.forEach(file => addPendingImage(file));
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    addPendingImage(undefined, urlInput.trim());
    setUrlInput('');
  };

  const saveAllImages = async () => {
    if (pendingImages.length === 0) {
      toast.error('ไม่มีรูปภาพที่จะบันทึก');
      return;
    }

    setSaving(true);
    let successCount = 0;

    try {
      for (const image of pendingImages) {
        let imageUrl = image.url;
        
        // Upload file if it's a file
        if (image.file) {
          console.log('Uploading file:', image.file.name);
          imageUrl = await uploadImage(image.file, 'product-images');
          console.log('Upload result:', imageUrl);
        }

        if (imageUrl) {
          const nextOrder = images.length + successCount + 1;
          
          console.log('Inserting image record:', { productId, imageUrl, nextOrder });
          
          const { error } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: imageUrl,
              order: nextOrder
            });

          if (!error) {
            successCount++;
            console.log('Successfully inserted image record');
          } else {
            console.error('Error inserting image record:', error);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`บันทึกรูปภาพสำเร็จ ${successCount} รูป`);
        setPendingImages([]);
        await refreshImages();
      } else {
        toast.error('ไม่สามารถบันทึกรูปภาพได้');
      }
    } catch (error) {
      console.error('Error saving images:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกรูปภาพ');
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    pendingImages.forEach(image => {
      if (image.file) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setPendingImages([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>จัดการรูปภาพสินค้า</CardTitle>
            <div className="text-sm text-gray-500">
              {images.length + pendingImages.length}/{MAX_IMAGES} รูป
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-gray-700 mb-2">
              ลากวางหรือคลิกเพื่อเลือกรูปภาพ
            </p>
            <p className="text-sm text-gray-500">
              รองรับ JPG, PNG, GIF | สูงสุด {MAX_IMAGES} รูป
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Upload className="h-4 w-4 mr-2" />
              เลือกไฟล์
            </Button>
          </div>

          {/* URL Input */}
          <div className="flex space-x-2 mb-4">
            <Input
              type="url"
              placeholder="หรือใส่ URL รูปภาพ"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlAdd}
              disabled={!urlInput.trim()}
            >
              เพิ่ม
            </Button>
          </div>

          {/* Pending Images */}
          {pendingImages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">รูปภาพที่เตรียมบันทึก ({pendingImages.length})</h4>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    ยกเลิกทั้งหมด
                  </Button>
                  <Button
                    onClick={saveAllImages}
                    disabled={saving || uploading}
                    style={{ backgroundColor: '#956ec3' }}
                    className="text-white"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {pendingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePendingImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images */}
          <div>
            <h4 className="font-medium mb-3">รูปภาพที่บันทึกแล้ว ({images.length})</h4>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-purple-600 font-medium">กำลังโหลดรูปภาพ...</p>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url || '/placeholder.svg'}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        ลบ
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>ยังไม่มีรูปภาพสินค้า</p>
              </div>
            )}
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchImageUploadManager;
