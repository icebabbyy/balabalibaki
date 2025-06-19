
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BatchImageUploadManagerProps {
  onImagesUploaded?: (urls: string[]) => void;
}

interface UploadResult {
  file: File;
  url?: string;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

const BatchImageUploadManager = ({ onImagesUploaded }: BatchImageUploadManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
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

    // Initialize upload results
    const initialResults: UploadResult[] = validFiles.map(file => ({
      file,
      status: 'pending'
    }));
    
    setUploadResults(initialResults);
    setUploading(true);

    const uploadedUrls: string[] = [];

    try {
      // Upload files one by one
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        // Update status to uploading
        setUploadResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'uploading' } : result
        ));

        try {
          console.log(`Uploading file ${i + 1}/${validFiles.length}:`, file.name);
          
          // Create unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `batch/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          // Upload to product-images bucket
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (error) {
            console.error('Upload error:', error);
            setUploadResults(prev => prev.map((result, index) => 
              index === i ? { ...result, status: 'error', error: error.message } : result
            ));
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
          
          // Update status to success
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'success', url: publicUrl } : result
          ));

          console.log(`Successfully uploaded: ${file.name}`);
          
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { 
              ...result, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error'
            } : result
          ));
        }
      }

      if (uploadedUrls.length > 0) {
        toast.success(`อัพโหลดสำเร็จ ${uploadedUrls.length} ไฟล์`);
        onImagesUploaded?.(uploadedUrls);
      } else {
        toast.error('ไม่สามารถอัพโหลดไฟล์ใดได้');
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  const getStatusIcon = (status: UploadResult['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: UploadResult['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const successCount = uploadResults.filter(r => r.status === 'success').length;
  const errorCount = uploadResults.filter(r => r.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>อัพโหลดรูปภาพแบบกลุ่ม</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={uploading}
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

        {/* Results Summary */}
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
              <X className="h-4 w-4 mr-1" />
              ล้าง
            </Button>
          </div>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {result.file.name}
                  </p>
                  {result.error && (
                    <p className="text-xs text-red-600 truncate">
                      {result.error}
                    </p>
                  )}
                </div>
                <span className={`text-xs ${getStatusColor(result.status)}`}>
                  {result.status === 'pending' && 'รอ'}
                  {result.status === 'uploading' && 'อัพโหลด...'}
                  {result.status === 'success' && 'สำเร็จ'}
                  {result.status === 'error' && 'ล้มเหลว'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded URLs */}
        {successCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">
              URL รูปภาพที่อัพโหลดสำเร็จ:
            </p>
            <div className="bg-green-50 p-3 rounded max-h-40 overflow-y-auto">
              {uploadResults
                .filter(r => r.status === 'success' && r.url)
                .map((result, index) => (
                  <div key={index} className="text-xs font-mono break-all mb-1">
                    {result.url}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchImageUploadManager;
