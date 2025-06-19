
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Upload, Download, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useProductImages } from '@/hooks/useProductImages';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedProductImageManagerProps {
  productId: number;
}

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

const EnhancedProductImageManager = ({ productId }: EnhancedProductImageManagerProps) => {
  const { images, loading, deleteImage, refreshImages } = useProductImages(productId);
  const { uploadImage, uploading } = useImageUpload();
  const [isAddingImages, setIsAddingImages] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addPendingImage = (file: File) => {
    if (pendingImages.length >= 10) {
      toast.error('สามารถเพิ่มได้สูงสุด 10 รูปต่อครั้ง');
      return;
    }

    const preview = URL.createObjectURL(file);
    const pendingImage: PendingImage = {
      id: Math.random().toString(36).substring(2),
      file,
      preview
    };

    setPendingImages(prev => [...prev, pendingImage]);
  };

  const removePendingImage = (id: string) => {
    setPendingImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    if (pendingImages.length + imageFiles.length > 10) {
      toast.error('สามารถเพิ่มได้สูงสุด 10 รูปต่อครั้ง');
      return;
    }

    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB`);
        return;
      }
      addPendingImage(file);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

    if (pendingImages.length + imageFiles.length > 10) {
      toast.error('สามารถเพิ่มได้สูงสุด 10 รูปต่อครั้ง');
      return;
    }

    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB`);
        return;
      }
      addPendingImage(file);
    });
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    // Create a dummy file-like object for URL
    const urlImage: PendingImage = {
      id: Math.random().toString(36).substring(2),
      file: null as any, // We'll handle this differently
      preview: urlInput.trim()
    };

    setPendingImages(prev => [...prev, urlImage]);
    setUrlInput('');
  };

  const savePendingImages = async () => {
    if (pendingImages.length === 0) {
      toast.error('ไม่มีรูปภาพที่จะบันทึก');
      return;
    }

    let successCount = 0;
    
    for (const pendingImage of pendingImages) {
      try {
        let imageUrl;

        if (pendingImage.file) {
          // Upload file to storage
          imageUrl = await uploadImage(pendingImage.file, `products/${productId}`);
        } else {
          // Use URL directly
          imageUrl = pendingImage.preview;
        }

        if (imageUrl) {
          const nextOrder = images.length + successCount + 1;
          
          const { error } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: imageUrl,
              order: nextOrder
            });

          if (!error) {
            successCount++;
          } else {
            console.error('Error inserting image record:', error);
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    // Clean up preview URLs
    pendingImages.forEach(img => {
      if (img.file) {
        URL.revokeObjectURL(img.preview);
      }
    });

    setPendingImages([]);
    
    if (successCount > 0) {
      await refreshImages();
      toast.success(`บันทึกรูปภาพสำเร็จ ${successCount} รูป`);
      setIsAddingImages(false);
    } else {
      toast.error('ไม่สามารถบันทึกรูปภาพได้');
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (window.confirm('คุณต้องการลบรูปภาพนี้หรือไม่?')) {
      const success = await deleteImage(imageId);
      if (success) {
        toast.success('ลบรูปภาพสำเร็จ!');
      }
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
              onClick={() => setIsAddingImages(!isAddingImages)}
              style={{ backgroundColor: '#956ec3' }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAddingImages ? 'ยกเลิก' : 'เพิ่มรูปภาพ'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Images Section */}
          {isAddingImages && (
            <Card className="mb-6 border-dashed border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  เพิ่มรูปภาพใหม่ (สูงสุด 10 รูป)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  ลากวาง, คลิกเลือก, หรือใส่ URL | รองรับ: JPG, PNG, GIF
                </p>
              </CardHeader>
              <CardContent>
                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-purple-500 bg-purple-50 scale-105'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
                  <p className={`font-medium ${isDragging ? 'text-purple-600' : 'text-gray-700'}`}>
                    {isDragging ? 'วางรูปภาพที่นี่' : 'ลากวาง หรือ คลิกเพื่อเลือกรูปภาพ'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    สูงสุด 10 รูป | ขนาดไม่เกิน 5MB ต่อรูป
                  </p>
                </div>

                {/* URL Input */}
                <div className="flex space-x-2 mt-4">
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
                    disabled={!urlInput.trim() || pendingImages.length >= 10}
                  >
                    เพิ่ม URL
                  </Button>
                </div>

                {/* Pending Images Preview */}
                {pendingImages.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">รูปภาพที่เลือก ({pendingImages.length}/10)</h4>
                      <Button
                        onClick={savePendingImages}
                        disabled={uploading || pendingImages.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {uploading ? 'กำลังบันทึก...' : `บันทึกทั้งหมด (${pendingImages.length})`}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {pendingImages.map((pendingImage) => (
                        <div key={pendingImage.id} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                            <img
                              src={pendingImage.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 group-hover:opacity-100"
                            onClick={() => removePendingImage(pendingImage.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
