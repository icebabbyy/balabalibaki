
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderEditDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const OrderEditDialog = ({ order, isOpen, onClose, onUpdate }: OrderEditDialogProps) => {
  const [formData, setFormData] = useState({
    total_selling_price: order?.total_selling_price || 0,
    shipping_cost: order?.shipping_cost || 0,
    discount: order?.discount || 0,
    deposit: order?.deposit || 0,
    admin_notes: order?.admin_notes || '',
    tracking_number: order?.tracking_number || ''
  });
  const [customerMessage, setCustomerMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!order) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          total_selling_price: parseFloat(formData.total_selling_price.toString()),
          shipping_cost: parseFloat(formData.shipping_cost.toString()),
          discount: parseFloat(formData.discount.toString()),
          deposit: parseFloat(formData.deposit.toString()),
          admin_notes: formData.admin_notes,
          tracking_number: formData.tracking_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) {
        console.error('Error updating order:', error);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        return;
      }

      toast.success('อัปเดตข้อมูลออเดอร์เรียบร้อยแล้ว');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const sendCustomerMessage = async () => {
    if (!customerMessage.trim()) {
      toast.error('กรุณาพิมพ์ข้อความ');
      return;
    }

    // For now, we'll just add it to admin notes
    const updatedNotes = formData.admin_notes + 
      (formData.admin_notes ? '\n\n' : '') + 
      `[ข้อความถึงลูกค้า ${new Date().toLocaleString('th-TH')}]: ${customerMessage}`;

    setFormData(prev => ({ ...prev, admin_notes: updatedNotes }));
    setCustomerMessage('');
    toast.success('เพิ่มข้อความเรียบร้อย (จะส่งเมื่อบันทึกข้อมูล)');
  };

  const profit = formData.total_selling_price - formData.shipping_cost + formData.discount - formData.deposit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขออเดอร์ #{order?.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Financial Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_selling_price">ราคารวม (บาท)</Label>
              <Input
                id="total_selling_price"
                type="number"
                step="0.01"
                value={formData.total_selling_price}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  total_selling_price: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="shipping_cost">ค่าจัดส่ง (บาท)</Label>
              <Input
                id="shipping_cost"
                type="number"
                step="0.01"
                value={formData.shipping_cost}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  shipping_cost: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="discount">ส่วนลด (บาท)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  discount: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="deposit">มัดจำ (บาท)</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                value={formData.deposit}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  deposit: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
          </div>

          {/* Calculated Profit */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium">กำไรสุทธิ</Label>
            <p className="text-lg font-bold text-green-600">
              ฿{profit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              (ราคารวม - ค่าจัดส่ง + ส่วนลด - มัดจำ)
            </p>
          </div>

          {/* Tracking Number */}
          <div>
            <Label htmlFor="tracking_number">หมายเลขติดตาม</Label>
            <Input
              id="tracking_number"
              value={formData.tracking_number}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tracking_number: e.target.value 
              }))}
              placeholder="ใส่หมายเลขติดตาม"
            />
          </div>

          {/* Customer Message */}
          <div className="border-t pt-4">
            <Label htmlFor="customer_message">ส่งข้อความถึงลูกค้า</Label>
            <Textarea
              id="customer_message"
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              placeholder="พิมพ์ข้อความที่ต้องการส่งให้ลูกค้า..."
              rows={3}
              className="mt-2"
            />
            <Button
              onClick={sendCustomerMessage}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!customerMessage.trim()}
            >
              เพิ่มข้อความ
            </Button>
          </div>

          {/* Admin Notes */}
          <div>
            <Label htmlFor="admin_notes">หมายเหตุแอดมิน</Label>
            <Textarea
              id="admin_notes"
              value={formData.admin_notes}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                admin_notes: e.target.value 
              }))}
              placeholder="หมายเหตุสำหรับแอดมิน..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              style={{ backgroundColor: '#956ec3' }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditDialog;
