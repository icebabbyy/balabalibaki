
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, GripVertical, Upload, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useProductImages } from '@/hooks/useProductImages';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedProductImageManagerProps {
  productId: number;
}

const EnhancedProductImageManager = ({ productId }: EnhancedProductImageManagerProps) => {
  const { images, loading, deleteImage, refreshImages } = useProductImages(productId);
  const { uploadImage, uploading } = useImageUpload();
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageAdd = async (imageUrl: string) => {
    if (imageUrl) {
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
          return;
        }

        await refreshImages();
        setIsAddingImage(false);
        setPreviewUrl(null);
        setUrlInput('');
        toast.success('เพิ่มรูปภาพสำเร็จ!');
      } catch (error) {
        console.error('Error adding image:', error);
        toast.error('เกิดข้อผิดพลาดในการเพิ่มรูปภาพ');
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    // Show preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // Upload to Supabase with proper folder structure
    const uploadedUrl = await uploadImage(file, `products/${productId}`);
    if (uploadedUrl) {
      await handleImageAdd(uploadedUrl);
      URL.revokeObjectURL(localPreviewUrl);
    } else {
      setPreviewUrl(null);
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const handleMultipleFileUpload = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    if (imageFiles.length > 10) {
      toast.error('สามารถอัพโหลดได้สูงสุด 10 รูปต่อครั้ง');
      return;
    }

    let successCount = 0;
    
    for (const file of imageFiles) {
      const uploadedUrl = await uploadImage(file, `products/${productId}`);
      if (uploadedUrl) {
        const nextOrder = images.length + successCount + 1;
        
        const { error } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: uploadedUrl,
            order: nextOrder
          });

        if (!error) {
          successCount++;
        }
      }
    }

    if (successCount > 0) {
      await refreshImages();
      toast.success(`อัพโหลดสำเร็จ ${successCount} รูป`);
      setIsAddingImage(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (files.length === 1) {
      await handleFileUpload(files[0]);
    } else {
      await handleMultipleFileUpload(files);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          await handleFileUpload(file);
          toast.success('วางรูปภาพสำเร็จ!');
        }
        break;
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    if (imageFiles.length === 1) {
      await handleFileUpload(imageFiles[0]);
      toast.success('ลากวางรูปภาพสำเร็จ!');
    } else {
      const fileList = document.createElement('input');
      fileList.type = 'file';
      fileList.multiple = true;
      fileList.files = event.dataTransfer.files;
      await handleMultipleFileUpload(event.dataTransfer.files);
      toast.success(`ลากวางรูปภาพสำเร็จ ${imageFiles.length} รูป!`);
    }
  };

  const handleUrlSubmit = async () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
      await handleImageAdd(urlInput.trim());
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (window.confirm('คุณต้องการลบรูปภาพนี้หรือไม่?')) {
      await deleteImage(imageId);
      toast.success('ลบรูปภาพสำเร็จ!');
    }
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl);
    toast.success('คัดลอก URL รูปภาพแล้ว!');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-600 font-medium">กำลังโหลดรูปภาพ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>จัดการรูปภาพสินค้า</CardTitle>
            <Button
              onClick={() => setIsAddingImage(true)}
              style={{ backgroundColor: '#956ec3' }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มรูปภาพ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Image */}
          {isAddingImage && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">เพิ่มรูปภาพใหม่</CardTitle>
                <p className="text-sm text-gray-600">
                  รองรับการอัพโหลดหลายไฟล์ พร้อมลากวาง, วาง (Ctrl+V), หรือใส่ URL
                </p>
              </CardHeader>
              <CardContent>
                {/* Enhanced Drag & Drop Area */}
                <div
                  onPaste={handlePaste}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-purple-500 bg-purple-50 scale-105'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                  }`}
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-3">
                    <div className={`transition-all duration-200 ${isDragging ? 'scale-110' : ''}`}>
                      <Upload className={`h-10 w-10 mx-auto ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`font-medium ${isDragging ? 'text-purple-600' : 'text-gray-700'}`}>
                        {isDragging ? 'วางรูปภาพที่นี่' : 'ลากวาง หรือ คลิกเพื่อเลือกรูปภาพ'}
                      </p>
                      <p className="text-sm text-gray-500">
                        รองรับ: JPG, PNG, GIF | หลายไฟล์ | วาง: Ctrl+V | ลากวาง: ลากไฟล์มาวางที่นี่
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'กำลังอัพโหลด...' : 'เลือกไฟล์'}
                    </Button>
                  </div>
                </div>

                {/* URL Input */}
                <div className="flex space-x-2 mt-4">
                  <Input
                    type="url"
                    placeholder="หรือใส่ URL รูปภาพ"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                  >
                    เพิ่ม
                  </Button>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mt-4">
                    <div className="relative inline-block">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded border shadow-sm"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingImage(false);
                      setPreviewUrl(null);
                      setUrlInput('');
                    }}
                  >
                    ยกเลิก
                  </Button>
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
          )}

          {/* Existing Images */}
          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="relative">
                    <img
                      src={image.image_url || '/placeholder.svg'}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    
                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyImageUrl(image.image_url)}
                          className="bg-white text-gray-700 hover:bg-gray-100"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          คัดลอก
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleImageDelete(image.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          ลบ
                        </Button>
                      </div>
                    </div>
                    
                    {/* Order Badge */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                      #{index + 1}
                    </div>
                    
                    {/* Drag Handle */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-1 rounded cursor-move">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">ยังไม่มีรูปภาพสินค้า</p>
              <p className="text-sm">คลิก "เพิ่มรูปภาพ" เพื่อเริ่มต้น</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProductImageManager;
