import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type CustomerInfo = {
  name: string;
  address: string;
  phone: string;
  note?: string;
};

const isValidPhone = (phone: string) => /^\d{10}$/.test((phone || "").trim());

export default function EditCustomerInfoDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: CustomerInfo;
  onClose: () => void;
  onSave: (info: CustomerInfo) => void;
}) {
  const [form, setForm] = useState<CustomerInfo>(initial);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setTouched(false);
    }
  }, [open, initial]);

  const phoneOk = isValidPhone(form.phone);
  const canSave = form.name.trim() && form.address.trim() && phoneOk;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลจัดส่ง</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm">ชื่อผู้รับ</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อ-สกุล"
            />
          </div>

          <div>
            <label className="text-sm">ที่อยู่</label>
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="ที่อยู่จัดส่ง"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm">เบอร์โทร (10 หลัก)</label>
            <Input
              value={form.phone}
              onChange={(e) => {
                setTouched(true);
                // บังคับเป็นตัวเลข
                setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "") });
              }}
              inputMode="numeric"
              maxLength={10}
              placeholder="08XXXXXXXX"
            />
            {!phoneOk && touched && (
              <p className="text-xs text-red-600 mt-1">กรุณากรอกเป็นตัวเลข 10 หลัก</p>
            )}
          </div>

          <div>
            <label className="text-sm">หมายเหตุ (ถ้ามี)</label>
            <Textarea
              value={form.note || ""}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={() => canSave && onSave(form)} disabled={!canSave}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
