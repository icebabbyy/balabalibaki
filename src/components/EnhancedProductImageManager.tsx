
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useProductImages } from '@/hooks/useProductImages';
import PhotoCopyPaste from '@/components/PhotoCopyPaste';

interface EnhancedProductImageManagerProps {
  productId: number;
}

const EnhancedProductImageManager = ({ productId }: EnhancedProductImageManagerProps) => {
  const { images, loading, addImage, deleteImage, updateImageOrder } = useProductImages(productId);
  const [isAddingImage, setIsAddingImage] = useState(false);

  const handleImageAdd = async (imageUrl: string) => {
    if (imageUrl) {
      const success = await addImage(imageUrl);
      if (success) {
        setIsAddingImage(false);
        toast.success('เพิ่มรูปภาพสำเร็จ!');
      }
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (window.confirm('คุณต้องการลบรูปภาพนี้หรือไม่?')) {
      await deleteImage(imageId);
      toast.success('ลบรูปภาพสำเร็จ!');
    }
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
          {/* Add New Image - ใช้ PhotoCopyPaste ที่ปรับปรุงแล้ว */}
          {isAddingImage && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">เพิ่มรูปภาพใหม่</CardTitle>
                <p className="text-sm text-gray-600">
                  คุณสามารถลากวาง, วาง (Ctrl+V), หรือเลือกไฟล์ได้
                </p>
              </CardHeader>
              <CardContent>
                <PhotoCopyPaste
                  onImageChange={handleImageAdd}
                  label="รูปภาพสินค้า"
                  folder="product-images"
                />
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingImage(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>
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
              <p>ยังไม่มีรูปภาพสินค้า</p>
              <p className="text-sm">คลิก "เพิ่มรูปภาพ" เพื่อเริ่มต้น</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProductImageManager;
