
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Image, X } from 'lucide-react';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';

interface PaymentSlipUploadProps {
  onSlipUploaded: (url: string) => void;
  currentSlip?: string;
  orderId?: number;
}

const PaymentSlipUpload = ({ 
  onSlipUploaded, 
  currentSlip, 
  orderId 
}: PaymentSlipUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentSlip || null);
  const { uploadImage, uploading } = useImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }

    // Show preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // Upload to payment-slips bucket with custom filename
    const fileName = `slip_${orderId || Date.now()}_${file.name}`;
    const uploadedUrl = await uploadImage(file, 'payment-slips');
    
    if (uploadedUrl) {
      onSlipUploaded(uploadedUrl);
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(uploadedUrl);
      toast.success('อัปโหลดสลิปการโอนเงินสำเร็จ!');
    } else {
      setPreviewUrl(currentSlip || null);
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const removeSlip = () => {
    setPreviewUrl(null);
    onSlipUploaded('');
    toast.success('ลบสลิปการโอนเงินแล้ว');
  };

  return (
    <div className="space-y-4">
      <Label>สลิปการโอนเงิน</Label>
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="space-y-2">
          <Image className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">
            คลิกเพื่อเลือกสลิปการโอนเงิน
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('slip-upload')?.click()}
            disabled={uploading}
            className="mt-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
          </Button>
          <p className="text-xs text-gray-500">
            รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 5MB
          </p>
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img 
              src={previewUrl} 
              alt="Payment Slip" 
              className="w-48 h-64 object-cover rounded border shadow-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeSlip}
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            สลิปการโอนเงินที่อัปโหลดแล้ว
          </p>
        </div>
      )}

      <input
        id="slip-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default PaymentSlipUpload;
