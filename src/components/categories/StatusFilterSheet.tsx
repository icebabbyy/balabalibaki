import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { STATUS_OPTIONS } from "@/hooks/useCategoryFiltering";

type Props = {
  selectedStatuses: string[];
  onStatusChange: (status: string, checked: boolean) => void;
  onClearStatus: () => void;
};

export default function StatusFilterSheet({
  selectedStatuses = [],
  onStatusChange,
  onClearStatus,
}: Props) {
  const count = selectedStatuses?.length ?? 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="whitespace-nowrap">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {count > 0 && (
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[360px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>สถานะสินค้า</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              เลือกสถานะที่ต้องการ
            </span>
            <button
              onClick={onClearStatus}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              ล้างการเลือก
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {STATUS_OPTIONS.map((st) => (
              <label key={st} className="flex items-center space-x-3">
                <Checkbox
                  checked={!!selectedStatuses?.includes(st)}
                  onCheckedChange={(checked) =>
                    onStatusChange(st, Boolean(checked))
                  }
                />
                <span className="text-sm">{st}</span>
              </label>
            ))}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <div className="flex w-full justify-between">
            <button
              onClick={onClearStatus}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ล้างทั้งหมด
            </button>
            <SheetClose asChild>
              <Button>เสร็จสิ้น</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
