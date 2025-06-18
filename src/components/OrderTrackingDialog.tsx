
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useOrderManagement } from "@/hooks/useOrderManagement";

interface OrderTrackingDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const OrderTrackingDialog = ({ order, isOpen, onClose }: OrderTrackingDialogProps) => {
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || '');
  const [adminNotes, setAdminNotes] = useState(order?.admin_notes || '');
  const { updateOrderTracking, updating } = useOrderManagement();

  const handleSave = async () => {
    if (!order) return;

    const success = await updateOrderTracking(order.id, trackingNumber, adminNotes);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setTrackingNumber(order?.tracking_number || '');
    setAdminNotes(order?.admin_notes || '');
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไข Tracking & Notes - ออเดอร์ #{order.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>หมายเลขติดตาม (EMS/Thailand Post)</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="เช่น EE123456789TH"
            />
          </div>
          
          <div>
            <Label>หมายเหตุแอดมิน</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="เพิ่มหมายเหตุสำหรับลูกค้า..."
              rows={4}
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleSave} 
              className="flex-1"
              style={{ backgroundColor: '#956ec3' }}
              disabled={updating}
            >
              {updating ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={updating}
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingDialog;
