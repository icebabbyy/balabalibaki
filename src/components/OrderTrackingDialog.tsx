// src/components/OrderTrackingDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { Order } from "@/types/order"; // Use the correct Order type

// Define props correctly
interface OrderTrackingDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Add the onUpdate prop
}

const OrderTrackingDialog = ({ order, isOpen, onClose, onUpdate }: OrderTrackingDialogProps) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const { updateOrderTracking, updating } = useOrderManagement();

  useEffect(() => {
    if (order) {
      setTrackingNumber(order.tracking_number || '');
      setAdminNotes(order.admin_notes || '');
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;
    const success = await updateOrderTracking(order.id, trackingNumber, adminNotes);
    if (success) {
      onUpdate(); // Call onUpdate after a successful save
      onClose();
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไข Tracking & Notes - ออเดอร์ #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="tracking">หมายเลขติดตาม</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="เช่น EE123456789TH"
            />
          </div>
          <div>
            <Label htmlFor="notes">หมายเหตุแอดมิน</Label>
            <Textarea
              id="notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="เพิ่มหมายเหตุ..."
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={updating}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={updating}>
              {updating ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingDialog;