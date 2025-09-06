import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  STATUS_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  type StatusOption,
  type ProductTypeOption,
} from "@/hooks/useCategoryFiltering";

interface Category {
  id: number;
  name: string;
  image?: string;
  display_on_homepage?: boolean;
  homepage_order?: number;
}

interface CategoryFiltersProps {
  /* ค้นหา */
  searchTerm: string;
  onSearchChange: (value: string) => void;

  /* หมวดหมู่ */
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryName: string, checked: boolean) => void;
  onClearCategory: () => void;

  /* สถานะสินค้า */
  selectedStatuses: StatusOption[];
  onStatusChange: (status: StatusOption, checked: boolean) => void;
  onClearStatus: () => void;

  /* ประเภทสินค้า */
  selectedTypes: ProductTypeOption[];
  onTypeChange: (typeName: ProductTypeOption, checked: boolean) => void;
  onClearType: () => void;

  /* ล้างทั้งหมด (ไม่บังคับ) */
  onClearAll?: () => void;
}

const CategoryFilters = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryChange,
  onClearCategory,
  selectedStatuses,
  onStatusChange,
  onClearStatus,
  selectedTypes,
  onTypeChange,
  onClearType,
  onClearAll,
}: CategoryFiltersProps) => {
  const [open, setOpen] = useState(false);

  const anyActive =
    selectedStatuses.length > 0 || selectedTypes.length > 0 || selectedCategories.length > 0 || !!searchTerm;

  return (
    <div className="mb-8">
      {/* แถวบน: ค้นหา + ปุ่ม Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ค้นหาสินค้า..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {anyActive ? (
            <span className="ml-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
              Active
            </span>
          ) : null}
        </button>
      </div>

      {/* แสดง chips สรุปสิ่งที่เลือก (ถ้ามี) */}
      {(selectedStatuses.length > 0 || selectedTypes.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedStatuses.map((s) => (
            <Badge key={`st-${s}`} variant="secondary" className="text-xs">{s}</Badge>
          ))}
          {selectedTypes.map((t) => (
            <Badge key={`tp-${t}`} variant="secondary" className="text-xs">{t}</Badge>
          ))}
          {onClearAll && anyActive && (
            <button
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={onClearAll}
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>
      )}

      {/* หมวดหมู่ (คงเดิม) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">เลือกหมวดหมู่</h3>
          <div className="space-x-4">
            <button
              onClick={onClearCategory}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              ล้างการเลือก
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <label
              key={category.id}
              htmlFor={`category-${category.id}`}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) =>
                  onCategoryChange(category.name, Boolean(checked))
                }
              />
              <span className="text-sm font-medium">{category.name}</span>
            </label>
          ))}
        </div>

        {selectedCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              เลือกแล้ว: {selectedCategories.length} หมวดหมู่
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== Drawer Filters ===== */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          {/* panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-[360px] bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-base font-semibold">Filters</h3>
              <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-8 overflow-y-auto h-[calc(100%-56px)]">
              {/* สถานะสินค้า */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">สถานะสินค้า</h4>
                  <button
                    className="text-sm text-purple-600 hover:text-purple-800"
                    onClick={onClearStatus}
                  >
                    ล้างการเลือก
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map((st) => (
                    <label key={st} className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox
                        checked={selectedStatuses.includes(st)}
                        onCheckedChange={(checked) => onStatusChange(st, Boolean(checked))}
                      />
                      <span className="text-sm">{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ประเภทสินค้า */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">ประเภทสินค้า</h4>
                  <button
                    className="text-sm text-purple-600 hover:text-purple-800"
                    onClick={onClearType}
                  >
                    ล้างการเลือก
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {PRODUCT_TYPE_OPTIONS.map((tp) => (
                    <label key={tp} className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox
                        checked={selectedTypes.includes(tp)}
                        onCheckedChange={(checked) => onTypeChange(tp, Boolean(checked))}
                      />
                      <span className="text-sm">{tp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              <button
                className="w-full rounded-lg bg-purple-600 text-white py-2.5 font-medium hover:bg-purple-700"
                onClick={() => setOpen(false)}
              >
                ใช้งานตัวกรอง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;
