
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  status: string;
  sku: string;
}

interface ProductEditDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const ProductEditDialog = ({ product, isOpen, onClose, onSave }: ProductEditDialogProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Update editing product when product prop changes
  useEffect(() => {
    if (product) {
      setEditingProduct({ ...product });
    }
  }, [product]);

  const handleSave = async () => {
    if (!editingProduct) return;

    setSaving(true);
    try {
      // Update in public_products table
      const { error } = await supabase
        .from('public_products')
        .update({
          name: editingProduct.name,
          selling_price: editingProduct.selling_price,
          category: editingProduct.category,
          description: editingProduct.description,
          image: editingProduct.image,
          status: editingProduct.status,
          sku: editingProduct.sku
        })
        .eq('id', editingProduct.id);

      if (error) {
        console.error('Error updating product:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกสินค้า');
        return;
      }

      toast.success('บันทึกข้อมูลสินค้าเรียบร้อยแล้ว');
      onSave(editingProduct);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: value
      });
    }
  };

  if (!editingProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขสินค้า</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>ชื่อสินค้า</Label>
              <Input
                value={editingProduct.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div>
              <Label>ราคา</Label>
              <Input
                type="number"
                value={editingProduct.selling_price || 0}
                onChange={(e) => updateField('selling_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>หมวดหมู่</Label>
              <Input
                value={editingProduct.category || ''}
                onChange={(e) => updateField('category', e.target.value)}
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={editingProduct.sku || ''}
                onChange={(e) => updateField('sku', e.target.value)}
              />
            </div>
            <div>
              <Label>สถานะ</Label>
              <Select value={editingProduct.status || 'พรีออเดอร์'} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                  <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                  <SelectItem value="หมดสต็อก">หมดสต็อก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <ImageUpload
              currentImage={editingProduct.image}
              onImageChange={(imageUrl) => updateField('image', imageUrl)}
              label="รูปภาพสินค้า"
              folder="products"
            />
          </div>
          <div>
            <Label>คำอธิบายสินค้า</Label>
            <Textarea
              value={editingProduct.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={handleSave} 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={saving}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
