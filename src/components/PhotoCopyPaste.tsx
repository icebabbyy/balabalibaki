
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';

interface PhotoCopyPasteProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  folder?: string;
}

const PhotoCopyPaste = ({ 
  currentImage, 
  onImageChange, 
  label = "รูปภาพ", 
  folder = "products" 
}: PhotoCopyPasteProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  const handleImageUpload = async (file: File) => {
    // Show preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // Upload to Supabase
    const uploadedUrl = await uploadImage(file, folder);
    if (uploadedUrl) {
      onImageChange(uploadedUrl);
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(uploadedUrl);
      toast.success('อัพโหลดรูปภาพสำเร็จ!');
    } else {
      setPreviewUrl(currentImage || null);
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleImageUpload(file);
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(file);
          toast.success('วางรูปภาพสำเร็จ!');
        }
        break;
      }
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await handleImageUpload(imageFile);
      toast.success('ลากวางรูปภาพสำเร็จ!');
    } else {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
    }
  }, [handleImageUpload]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
      onImageChange(urlInput.trim());
      setUrlInput('');
      toast.success('เพิ่ม URL รูปภาพสำเร็จ!');
    }
  };

  const copyImageUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      toast.success('คัดลอก URL รูปภาพแล้ว!');
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Enhanced Drag & Drop Area */}
      <div
        ref={pasteAreaRef}
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
            <Image className={`h-10 w-10 mx-auto ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
          </div>
          
          <div className="space-y-1">
            <p className={`font-medium ${isDragging ? 'text-purple-600' : 'text-gray-700'}`}>
              {isDragging ? 'วางรูปภาพที่นี่' : 'ลากวาง หรือ คลิกเพื่อเลือกรูปภาพ'}
            </p>
            <p className="text-sm text-gray-500">
              รองรับ: JPG, PNG, GIF | วาง: Ctrl+V | ลากวาง: ลากไฟล์มาวางที่นี่
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
      <div className="flex space-x-2">
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

      {/* Preview and Copy */}
      {previewUrl && (
        <div className="space-y-2">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyImageUrl}
            className="flex items-center space-x-1"
          >
            <Copy className="h-4 w-4" />
            <span>คัดลอก URL</span>
          </Button>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default PhotoCopyPaste;
