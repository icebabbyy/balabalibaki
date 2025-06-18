
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  folder?: string;
}

const ImageUpload = ({ currentImage, onImageChange, label = "รูปภาพ", folder = "products" }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Clean up local preview URL
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(uploadedUrl);
    } else {
      // If upload failed, remove preview
      setPreviewUrl(currentImage || null);
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'กำลังอัพโหลด...' : 'เลือกรูปภาพ'}</span>
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {previewUrl && (
        <div className="mt-2">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
