
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useProductManagement } from '@/hooks/useProductManagement';
import PhotoCopyPaste from '@/components/PhotoCopyPaste';
import { ProductAdmin } from '@/types/product';

interface ProductEditDialogProps {
  product: ProductAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: ProductAdmin) => void;
}

const ProductEditDialog = ({ product, open, onOpenChange, onSave }: ProductEditDialogProps) => {
  const { updateProduct } = useProductManagement();
  const [formData, setFormData] = useState<Partial<ProductAdmin>>({});

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !formData) return;

    const success = await updateProduct(product.id, formData);
    if (success) {
      onSave({ ...product, ...formData } as ProductAdmin);
      onOpenChange(false);
    }
  };

  const handleInputChange = (field: keyof ProductAdmin, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขสินค้า - {product.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">ชื่อสินค้า</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </div>
          </div>

          <PhotoCopyPaste
            currentImage={formData.image}
            onImageChange={handleImageChange}
            label="รูปภาพสินค้า"
            folder="products"
          />

          <div>
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">หมวดหมู่</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="product_status">สถานะ</Label>
              <Select
                value={formData.product_status || ''}
                onValueChange={(value) => handleInputChange('product_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                  <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                  <SelectItem value="สินค้าหมด">สินค้าหมด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="selling_price">ราคาขาย (บาท)</Label>
              <Input
                id="selling_price"
                type="number"
                value={formData.selling_price || ''}
                onChange={(e) => handleInputChange('selling_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">จำนวน</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price_yuan">ราคาหยวน</Label>
              <Input
                id="price_yuan"
                type="number"
                step="0.01"
                value={formData.price_yuan || ''}
                onChange={(e) => handleInputChange('price_yuan', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="exchange_rate">อัตราแลกเปลี่ยน</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.01"
                value={formData.exchange_rate || ''}
                onChange={(e) => handleInputChange('exchange_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="import_cost">ค่าขนส่ง</Label>
              <Input
                id="import_cost"
                type="number"
                step="0.01"
                value={formData.import_cost || ''}
                onChange={(e) => handleInputChange('import_cost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipment_date">วันที่จัดส่ง</Label>
              <Input
                id="shipment_date"
                type="date"
                value={formData.shipment_date || ''}
                onChange={(e) => handleInputChange('shipment_date', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="link">ลิงก์สินค้า</Label>
              <Input
                id="link"
                type="url"
                value={formData.link || ''}
                onChange={(e) => handleInputChange('link', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" style={{ backgroundColor: '#956ec3' }}>
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
