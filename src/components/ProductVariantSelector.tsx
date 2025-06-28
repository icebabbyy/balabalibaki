// src/components/ProductVariantSelector.tsx

import { Button } from "@/components/ui/button";

// 1. กำหนด Type ของ option ที่ชัดเจนและเรียบง่าย
interface Option {
  id: string;
  name: string;
}

interface ProductVariantSelectorProps {
  options: Option[];
  selectedVariant: Option | null;
  onVariantChange: (variant: Option) => void;
}

const ProductVariantSelector = ({ 
  options, 
  selectedVariant, 
  onVariantChange 
}: ProductVariantSelectorProps) => {

  // 2. Logic ทั้งหมดตรงไปตรงมา ไม่ต้องเดาข้อมูล
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">ตัวเลือกสินค้า</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.id}
            // 3. เปรียบเทียบด้วย id ที่แน่นอน
            variant={selectedVariant?.id === option.id ? "default" : "outline"}
            onClick={() => onVariantChange(option)} // 4. ส่งกลับเป็น Object ทั้งก้อน
            style={selectedVariant?.id === option.id ? { backgroundColor: '#956ec3', color: 'white' } : {}}
          >
            {option.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ProductVariantSelector;
