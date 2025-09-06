// src/components/ExtraInfoLightbox.tsx
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  triggerLabel?: string;
  title?: string;
  contentHtml?: string;
  children?: ReactNode;
  size?: "md" | "lg" | "xl";
};

export default function ExtraInfoLightbox({
  triggerLabel = "รายละเอียดเพิ่มเติม",
  title = "รายละเอียดเพิ่มเติม",
  contentHtml,
  children,
  size = "xl",
}: Props) {
  const maxW =
    size === "xl" ? "max-w-5xl" : size === "lg" ? "max-w-3xl" : "max-w-2xl";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className={`${maxW} w-[92vw]`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* รองรับทั้ง children และ HTML ตรง ๆ */}
        {children ? (
          <div className="prose max-w-none prose-img:rounded-lg">
            {children}
          </div>
        ) : contentHtml ? (
          <div
            className="prose max-w-none prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <div className="text-sm text-gray-500">
            ยังไม่มีเนื้อหาเพิ่มเติมในขณะนี้
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
