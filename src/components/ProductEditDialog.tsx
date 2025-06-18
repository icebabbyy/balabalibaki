
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(product);

  const handleSave = () => {
    if (editingProduct) {
      onSave(editingProduct);
      onClose();
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>แก้ไขสินค้า</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>ชื่อสินค้า</Label>
              <Input
                value={editingProduct.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div>
              <Label>ราคา</Label>
              <Input
                type="number"
                value={editingProduct.selling_price}
                onChange={(e) => updateField('selling_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>หมวดหมู่</Label>
              <Input
                value={editingProduct.category}
                onChange={(e) => updateField('category', e.target.value)}
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={editingProduct.sku}
                onChange={(e) => updateField('sku', e.target.value)}
              />
            </div>
            <div>
              <Label>สถานะ</Label>
              <Select value={editingProduct.status} onValueChange={(value) => updateField('status', value)}>
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
            <Label>URL รูปภาพ</Label>
            <Input
              value={editingProduct.image}
              onChange={(e) => updateField('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {editingProduct.image && (
              <div className="mt-2">
                <img 
                  src={editingProduct.image} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
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
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            บันทึก
          </Button>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
