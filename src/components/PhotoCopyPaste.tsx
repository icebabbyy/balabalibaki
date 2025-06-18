
import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // Upload to Supabase
    const uploadedUrl = await uploadImage(file, folder);
    if (uploadedUrl) {
      onImageChange(uploadedUrl);
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(uploadedUrl);
    } else {
      setPreviewUrl(currentImage || null);
      URL.revokeObjectURL(localPreviewUrl);
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
          // Show preview immediately
          const localPreviewUrl = URL.createObjectURL(file);
          setPreviewUrl(localPreviewUrl);

          // Upload to Supabase
          const uploadedUrl = await uploadImage(file, folder);
          if (uploadedUrl) {
            onImageChange(uploadedUrl);
            URL.revokeObjectURL(localPreviewUrl);
            setPreviewUrl(uploadedUrl);
            toast.success('วางรูปภาพสำเร็จ!');
          } else {
            setPreviewUrl(currentImage || null);
            URL.revokeObjectURL(localPreviewUrl);
          }
        }
        break;
      }
    }
  };

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
      
      {/* Paste Area */}
      <div
        ref={pasteAreaRef}
        onPaste={handlePaste}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
        tabIndex={0}
      >
        <div className="space-y-2">
          <Image className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">
            วางรูปภาพที่นี่ (Ctrl+V) หรือคลิกเพื่อเลือกไฟล์
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2"
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
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded border"
          />
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
