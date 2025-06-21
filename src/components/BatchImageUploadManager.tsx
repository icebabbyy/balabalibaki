import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, X, AlertCircle, CheckCircle, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useProductImages } from '@/hooks/useProductImages';
import { supabase } from '@/integrations/supabase/client';

interface BatchImageUploadManagerProps {
  onImagesUploaded?: (urls: string[]) => void;
  productId?: number;
}

interface UploadResult {
  file: File;
  url?: string;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

const BatchImageUploadManager = ({ onImagesUploaded, productId }: BatchImageUploadManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const { uploadImages, images, loading, refetch } = useProductImages(productId);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ไม่ใช่ไฟล์รูปภาพ`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} มีขนาดใหญ่เกิน 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const initialResults: UploadResult[] = validFiles.map(file => ({
      file,
      status: 'pending'
    }));

    setUploadResults(initialResults);
    setUploading(true);

    try {
      if (productId) {
        const uploadedUrls = await uploadImages(validFiles);
        setUploadResults(prev => prev.map((result, index) => {
          if (index < uploadedUrls.length) {
            return { ...result, status: 'success', url: uploadedUrls[index] };
          } else {
            return { ...result, status: 'error', error: 'Upload failed' };
          }
        }));
        if (uploadedUrls.length > 0) {
          onImagesUploaded?.(uploadedUrls);
          refetch();
        }
      } else {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          setUploadResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'uploading' } : r));
          const fileExt = file.name.split('.').pop();
          const fileName = `batch/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);
          if (error) {
            setUploadResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', error: error.message } : r));
            continue;
          }
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
          uploadedUrls.push(publicUrl);
          setUploadResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'success', url: publicUrl } : r));
        }
        if (uploadedUrls.length > 0) {
          toast.success(`อัพโหลดสำเร็จ ${uploadedUrls.length} ไฟล์`);
          onImagesUploaded?.(uploadedUrls);
        } else {
          toast.error('ไม่สามารถอัพโหลดไฟล์ใดได้');
        }
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  const handleDeleteImage = async (id: number) => {
    const confirmDelete = confirm('ยืนยันลบรูปภาพนี้หรือไม่?');
    if (!confirmDelete) return;
    const { error } = await supabase.from('product_images').delete().eq('id', id);
    if (error) {
      toast.error(`ลบไม่สำเร็จ: ${error.message}`);
    } else {
      toast.success('ลบรูปสำเร็จ');
      refetch();
    }
  };

  const successCount = uploadResults.filter(r => r.status === 'success').length;
  const errorCount = uploadResults.filter(r => r.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>อัพโหลดรูปภาพแบบกลุ่ม</CardTitle>
        {productId && (
          <p className="text-sm text-gray-600">
            สำหรับสินค้า ID: {productId} | รูปภาพปัจจุบัน: {images.length} รูป
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={uploading || loading}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{uploading ? 'กำลังอัพโหลด...' : 'เลือกรูปภาพหลายไฟล์'}</span>
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            รองรับไฟล์ .jpg, .png, .gif ขนาดไม่เกิน 5MB ต่อไฟล์
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {productId && images.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">รูปภาพปัจจุบันของสินค้า:</p>
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 8).map((image) => (
                <div key={image.id} className="relative aspect-square group">
                  <img
                    src={image.image_url}
                    alt={`Product image ${image.order}`}
                    className="w-full h-full object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => toast.info(`แก้ไขรูป ID: ${image.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {images.length > 8 && (
                <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{images.length - 8}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {uploadResults.length > 0 && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <div className="text-sm">
              <span className="font-medium">ผลลัพธ์: </span>
              <span className="text-green-600">{successCount} สำเร็จ</span>
              {errorCount > 0 && (
                <span className="text-red-600 ml-2">{errorCount} ล้มเหลว</span>
              )}
              <span className="text-gray-600 ml-2">จากทั้งหมด {uploadResults.length} ไฟล์</span>
            </div>
            <Button variant="outline" size="sm" onClick={clearResults}>
              <X className="h-4 w-4 mr-1" /> ล้าง
            </Button>
          </div>
        )}

        {uploadResults.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadResults.map((r, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 border rounded">
                {r.status === 'uploading' ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" /> :
                 r.status === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                 r.status === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                 <div className="h-4 w-4 bg-gray-300 rounded-full" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.file.name}</p>
                  {r.error && <p className="text-xs text-red-600 truncate">{r.error}</p>}
                </div>
                <span className={`text-xs ${
                  r.status === 'uploading' ? 'text-blue-600' :
                  r.status === 'success' ? 'text-green-600' :
                  r.status === 'error' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {r.status === 'pending' && 'รอ'}
                  {r.status === 'uploading' && 'อัพโหลด...'}
                  {r.status === 'success' && 'สำเร็จ'}
                  {r.status === 'error' && 'ล้มเหลว'}
                </span>
              </div>
            ))}
          </div>
        )}

        {successCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">URL รูปภาพที่อัพโหลดสำเร็จ:</p>
            <div className="bg-green-50 p-3 rounded max-h-40 overflow-y-auto">
              {uploadResults.filter(r => r.status === 'success' && r.url).map((r, i) => (
                <div key={i} className="text-xs font-mono break-all mb-1">{r.url}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchImageUploadManager;
